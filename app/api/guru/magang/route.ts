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
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT 
        m.*,
        s.nama as siswa_nama,
        s.nis as siswa_nis,
        s.kelas as siswa_kelas,
        s.jurusan as siswa_jurusan,
        d.nama_perusahaan,
        d.alamat as alamat_dudi,
        g.nama as guru_nama
      FROM magang m
      JOIN siswa s ON m.siswa_id = s.id
      JOIN dudi d ON m.dudi_id = d.id
      JOIN guru g ON m.guru_id = g.id
      WHERE m.guru_id = $1
    `;
    
    let queryParams = [guruId];
    let paramCount = 1;

    if (search) {
      paramCount++;
      query += ` AND (s.nama ILIKE $${paramCount} OR d.nama_perusahaan ILIKE $${paramCount} OR g.nama ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (status && status !== 'all') {
      paramCount++;
      if (status === 'berlangsung') {
        query += ` AND m.status IN ($${paramCount}, $${paramCount + 1})`;
        queryParams.push('berlangsung', 'diterima');
        paramCount++;
      } else {
        query += ` AND m.status = $${paramCount}`;
        queryParams.push(status);
      }
    }

    query += ` ORDER BY m.created_at DESC`;
    
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
    const totalSiswaResult = await pool.query(
      'SELECT COUNT(*) as count FROM magang WHERE guru_id = $1',
      [guruId]
    );
    
    const aktifResult = await pool.query(
      'SELECT COUNT(*) as count FROM magang WHERE guru_id = $1 AND status IN ($2, $3)',
      [guruId, 'berlangsung', 'diterima']
    );
    
    const selesaiResult = await pool.query(
      'SELECT COUNT(*) as count FROM magang WHERE guru_id = $1 AND status = $2',
      [guruId, 'selesai']
    );
    
    const pendingResult = await pool.query(
      'SELECT COUNT(*) as count FROM magang WHERE guru_id = $1 AND status = $2',
      [guruId, 'pending']
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      stats: {
        totalSiswa: parseInt(totalSiswaResult.rows[0].count),
        aktif: parseInt(aktifResult.rows[0].count),
        selesai: parseInt(selesaiResult.rows[0].count),
        pending: parseInt(pendingResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get guru magang error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { siswa_id, dudi_id, tanggal_mulai, tanggal_selesai, status } = await request.json();

    // Check if student is already assigned to internship under this teacher
    const existingResult = await pool.query(
      'SELECT id FROM magang WHERE siswa_id = $1 AND guru_id = $2 AND status NOT IN ($3, $4)',
      [siswa_id, guruId, 'selesai', 'dibatalkan']
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Siswa sudah terdaftar dalam program magang yang aktif' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO magang (siswa_id, dudi_id, guru_id, status, tanggal_mulai, tanggal_selesai, created_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *',
      [siswa_id, dudi_id, guruId, status, tanggal_mulai || null, tanggal_selesai || null]
    );

    return NextResponse.json({
      success: true,
      message: 'Data magang berhasil ditambahkan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create guru magang error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}