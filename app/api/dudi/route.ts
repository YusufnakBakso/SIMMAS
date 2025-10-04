import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    
    //if (!user || user.role !== 'admin') {
      //return NextResponse.json({ success: false }, { status: 403 });
    //}
  
if (!user || !['admin', 'guru'].includes(user.role)) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT 
        d.*,
        COUNT(m.id) as siswa_magang_count
      FROM dudi d
      LEFT JOIN magang m ON d.id = m.dudi_id AND m.status IN ('berlangsung', 'diterima')
    `;
    let queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` WHERE (d.nama_perusahaan ILIKE $${paramCount} OR d.alamat ILIKE $${paramCount} OR d.penanggung_jawab ILIKE $${paramCount} OR d.email ILIKE $${paramCount} OR d.telepon ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    query += ` GROUP BY d.id ORDER BY d.created_at DESC`;
    
    if (limit > 0) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      queryParams.push(limit);
    }
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const result = await pool.query(query, queryParams);

    // Get stats
    const totalDudiResult = await pool.query('SELECT COUNT(*) as count FROM dudi');
    const dudiAktifResult = await pool.query('SELECT COUNT(*) as count FROM dudi WHERE status = $1', ['aktif']);
    const dudiTidakAktifResult = await pool.query('SELECT COUNT(*) as count FROM dudi WHERE status = $1', ['nonaktif']);
    const totalSiswaMagangResult = await pool.query('SELECT COUNT(*) as count FROM magang WHERE status IN ($1, $2)', ['berlangsung', 'diterima']);

    return NextResponse.json({
      success: true,
      data: result.rows,
      stats: {
        totalDudi: parseInt(totalDudiResult.rows[0].count),
        dudiAktif: parseInt(dudiAktifResult.rows[0].count),
        dudiTidakAktif: parseInt(dudiTidakAktifResult.rows[0].count),
        totalSiswaMagang: parseInt(totalSiswaMagangResult.rows[0].count),
      }
    });
  } catch (error) {
    console.error('Get DUDI error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const { nama_perusahaan, alamat, telepon, email, penanggung_jawab, status } = await request.json();

    // Check if company already exists
    const existingResult = await pool.query(
      'SELECT id FROM dudi WHERE nama_perusahaan = $1',
      [nama_perusahaan]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Nama perusahaan sudah terdaftar' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO dudi (nama_perusahaan, alamat, telepon, email, penanggung_jawab, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *',
      [nama_perusahaan, alamat, telepon, email, penanggung_jawab, status]
    );

    return NextResponse.json({
      success: true,
      message: 'DUDI berhasil ditambahkan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create DUDI error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}