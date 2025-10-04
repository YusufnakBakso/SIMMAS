import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    // Get stats
    const totalSiswaResult = await pool.query('SELECT COUNT(*) as count FROM siswa');
    const totalDudiResult = await pool.query('SELECT COUNT(*) as count FROM dudi WHERE status = $1', ['aktif']);
    const siswaMagangResult = await pool.query('SELECT COUNT(*) as count FROM magang WHERE status IN ($1, $2)', ['berlangsung', 'diterima']);
    const logbookHariIniResult = await pool.query('SELECT COUNT(*) as count FROM logbook WHERE DATE(created_at) = CURRENT_DATE');

    // Get recent magang
    const recentMagangResult = await pool.query(`
      SELECT 
        s.nama as siswa_nama,
        d.nama_perusahaan,
        m.status,
        m.tanggal_mulai,
        m.created_at
      FROM magang m
      JOIN siswa s ON m.siswa_id = s.id
      JOIN dudi d ON m.dudi_id = d.id
      ORDER BY m.created_at DESC
      LIMIT 10
    `);

    // Get active DUDI with intern count
    const activeDudiResult = await pool.query(`
      SELECT 
        d.nama_perusahaan,
        d.alamat,
        d.telepon,
        COUNT(m.id) as siswa_count
      FROM dudi d
      LEFT JOIN magang m ON d.id = m.dudi_id AND m.status IN ('berlangsung', 'diterima')
      WHERE d.status = 'aktif'
      GROUP BY d.id, d.nama_perusahaan, d.alamat, d.telepon
      ORDER BY siswa_count DESC
      LIMIT 10
    `);

    // Get recent logbook entries (newest first)
    const recentLogbookResult = await pool.query(`
      SELECT 
        l.id,
        l.tanggal,
        l.kegiatan,
        l.kendala,
        l.status_verifikasi,
        l.created_at,
        s.nama AS nama_siswa
      FROM logbook l
      JOIN magang m ON l.magang_id = m.id
      JOIN siswa s ON m.siswa_id = s.id
      WHERE l.deleted_at IS NULL
      ORDER BY l.created_at DESC NULLS LAST, l.tanggal DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      stats: {
        totalSiswa: parseInt(totalSiswaResult.rows[0].count),
        totalDudi: parseInt(totalDudiResult.rows[0].count),
        siswaMagang: parseInt(siswaMagangResult.rows[0].count),
        logbookHariIni: parseInt(logbookHariIniResult.rows[0].count),
      },
      recentMagang: recentMagangResult.rows,
      activeDudi: activeDudiResult.rows,
      recentLogbook: recentLogbookResult.rows,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}