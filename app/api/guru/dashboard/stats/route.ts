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

    // Get stats for students under this teacher's supervision
    const totalSiswaBimbinganResult = await pool.query(
      'SELECT COUNT(DISTINCT siswa_id) as count FROM magang WHERE guru_id = $1',
      [guruId]
    );
    
    const totalDudiPartnerResult = await pool.query(
      'SELECT COUNT(DISTINCT dudi_id) as count FROM magang WHERE guru_id = $1',
      [guruId]
    );
    
    const siswaMagangResult = await pool.query(
      'SELECT COUNT(*) as count FROM magang WHERE guru_id = $1 AND status IN ($2, $3)',
      [guruId, 'berlangsung', 'diterima']
    );
    
    const logbookHariIniResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM logbook l
      JOIN magang m ON l.magang_id = m.id
      WHERE m.guru_id = $1 AND DATE(l.created_at) = CURRENT_DATE
    `, [guruId]);

    // Get recent magang for students under supervision
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
      WHERE m.guru_id = $1
      ORDER BY m.created_at DESC
      LIMIT 10
    `, [guruId]);

    // Get active DUDI ordered by latest magang activity for this guru
    const activeDudiResult = await pool.query(`
      SELECT 
        d.nama_perusahaan,
        d.alamat,
        d.telepon,
        COUNT(m.id) AS siswa_count,
        MAX(m.created_at) AS last_activity
      FROM dudi d
      JOIN magang m ON d.id = m.dudi_id AND m.status IN ('berlangsung', 'diterima')
      WHERE m.guru_id = $1 AND d.status = 'aktif'
      GROUP BY d.id, d.nama_perusahaan, d.alamat, d.telepon
      ORDER BY last_activity DESC NULLS LAST, siswa_count DESC
      LIMIT 10
    `, [guruId]);

    return NextResponse.json({
      success: true,
      stats: {
        totalSiswaBimbingan: parseInt(totalSiswaBimbinganResult.rows[0].count),
        totalDudiPartner: parseInt(totalDudiPartnerResult.rows[0].count),
        siswaMagang: parseInt(siswaMagangResult.rows[0].count),
        logbookHariIni: parseInt(logbookHariIniResult.rows[0].count),
      },
      recentMagang: recentMagangResult.rows,
      activeDudi: activeDudiResult.rows,
    });
  } catch (error) {
    console.error('Guru dashboard stats error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}