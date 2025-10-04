import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    
    if (!user || user.role !== 'siswa') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    // Get siswa ID
    const siswaResult = await pool.query('SELECT id FROM siswa WHERE user_id = $1', [user.id]);
    
    if (siswaResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Data siswa tidak ditemukan' }, { status: 404 });
    }
    
    const siswaId = siswaResult.rows[0].id;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT 
        d.*,
        -- Mock data untuk kuota dan slot
        12 as kuota_magang,
        CASE 
          WHEN d.id % 3 = 0 THEN 3
          WHEN d.id % 3 = 1 THEN 8
          ELSE 12
        END as slot_tersisa,
        -- Check if siswa sudah daftar
        CASE WHEN m.id IS NOT NULL THEN true ELSE false END as sudah_daftar,
        m.status as status_pendaftaran
      FROM dudi d
      LEFT JOIN magang m ON d.id = m.dudi_id AND m.siswa_id = $1
      WHERE d.status = 'aktif'
    `;
    
    let queryParams = [siswaId];
    let paramCount = 1;

    if (search) {
      paramCount++;
      query += ` AND (d.nama_perusahaan ILIKE $${paramCount} OR d.alamat ILIKE $${paramCount} OR d.penanggung_jawab ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    query += ` ORDER BY d.created_at DESC`;
    
    if (limit > 0) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      queryParams.push(limit);
    }
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as count
      FROM dudi d
      WHERE d.status = 'aktif'
    `;
    let countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (d.nama_perusahaan ILIKE $${countParamCount} OR d.alamat ILIKE $${countParamCount} OR d.penanggung_jawab ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: totalCount
    });
  } catch (error) {
    console.error('Get siswa DUDI error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}