import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    
    if (!user || user.role !== 'siswa') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const { dudi_id } = await request.json();

    // Get siswa data
    const siswaResult = await pool.query('SELECT id FROM siswa WHERE user_id = $1', [user.id]);
    
    if (siswaResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Data siswa tidak ditemukan' }, { status: 404 });
    }
    
    const siswaId = siswaResult.rows[0].id;

    // Check if siswa sudah mencapai batas maksimal pendaftaran
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM magang WHERE siswa_id = $1',
      [siswaId]
    );
    
    const totalPendaftaran = parseInt(countResult.rows[0].count);
    const maxPendaftaran = 3;

    if (totalPendaftaran >= maxPendaftaran) {
      return NextResponse.json({ 
        success: false, 
        message: `Anda sudah mencapai batas maksimal ${maxPendaftaran} pendaftaran magang` 
      }, { status: 400 });
    }

    // Check if siswa sudah daftar di DUDI ini
    const existingResult = await pool.query(
      'SELECT id FROM magang WHERE siswa_id = $1 AND dudi_id = $2',
      [siswaId, dudi_id]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Anda sudah mendaftar di DUDI ini' 
      }, { status: 400 });
    }

    // Check if DUDI exists and aktif
    const dudiResult = await pool.query(
      'SELECT id, nama_perusahaan FROM dudi WHERE id = $1 AND status = $2',
      [dudi_id, 'aktif']
    );

    if (dudiResult.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'DUDI tidak ditemukan atau tidak aktif' 
      }, { status: 404 });
    }

    // Get a default guru (for now, we'll assign the first available guru)
    // In a real implementation, this should be based on school/class assignment
    const guruResult = await pool.query('SELECT id FROM guru LIMIT 1');
    
    if (guruResult.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Guru pembimbing belum tersedia' 
      }, { status: 400 });
    }
    
    const guruId = guruResult.rows[0].id;

    // Insert pendaftaran magang
    const result = await pool.query(
      `INSERT INTO magang (siswa_id, dudi_id, guru_id, status, created_at) 
       VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP) 
       RETURNING *`,
      [siswaId, dudi_id, guruId]
    );

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran magang berhasil diajukan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Daftar magang error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Gagal mendaftar magang' 
    }, { status: 500 });
  }
}