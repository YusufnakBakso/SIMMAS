import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    
    if (!user || user.role !== 'guru') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    // Get guru ID from user
    const guruResult = await pool.query('SELECT id FROM guru WHERE user_id = $1', [user.id]);
    
    if (guruResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Data guru tidak ditemukan' }, { status: 404 });
    }
    
    const guruId = guruResult.rows[0].id;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query to get DUDI that are connected to this teacher's students
    let query = `
      SELECT 
        d.*,
        COUNT(DISTINCT m.siswa_id) as siswa_bimbingan_count
      FROM dudi d
      JOIN magang m ON d.id = m.dudi_id
      WHERE m.guru_id = $1 AND d.status = 'aktif'
    `;
    
    let queryParams = [guruId];
    let paramCount = 1;

    if (search) {
      paramCount++;
      query += ` AND (d.nama_perusahaan ILIKE $${paramCount} OR d.alamat ILIKE $${paramCount} OR d.penanggung_jawab ILIKE $${paramCount} OR d.email ILIKE $${paramCount} OR d.telepon ILIKE $${paramCount})`;
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

    // Get stats for teacher's students
    const totalDudiResult = await pool.query(
      'SELECT COUNT(DISTINCT dudi_id) as count FROM magang WHERE guru_id = $1',
      [guruId]
    );
    
    const totalSiswaMagangResult = await pool.query(
      'SELECT COUNT(DISTINCT siswa_id) as count FROM magang WHERE guru_id = $1 AND status IN ($2, $3)',
      [guruId, 'berlangsung', 'diterima']
    );

    const totalDudiCount = parseInt(totalDudiResult.rows[0].count);
    const totalSiswaMagangCount = parseInt(totalSiswaMagangResult.rows[0].count);
    const rataRataSiswa = totalDudiCount > 0 ? Math.round(totalSiswaMagangCount / totalDudiCount) : 0;

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      stats: {
        totalDudi: totalDudiCount,
        totalSiswaMagang: totalSiswaMagangCount,
        rataRataSiswa: rataRataSiswa,
      }
    });
  } catch (error) {
    console.error('Get guru DUDI error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}