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

    // Get siswa_id from user
    const siswaRes = await pool.query('SELECT id FROM siswa WHERE user_id = $1', [user.id]);
    if (!siswaRes.rowCount) {
      return NextResponse.json({ success: false, message: 'Data siswa tidak ditemukan' }, { status: 404 });
    }
    const siswaId = siswaRes.rows[0].id;

    // Get current internship information
    const magangResult = await pool.query(`
      SELECT 
        m.id,
        m.status,
        m.tanggal_mulai,
        m.tanggal_selesai,
        m.nilai_akhir,
        d.nama_perusahaan,
        d.alamat as alamat_dudi,
        g.nama as guru_nama
      FROM magang m
      LEFT JOIN dudi d ON m.dudi_id = d.id
      LEFT JOIN guru g ON m.guru_id = g.id
      WHERE m.siswa_id = $1
      ORDER BY m.created_at DESC
      LIMIT 1
    `, [siswaId]);

    // Get recent journal entries (latest 5)
    const jurnalResult = await pool.query(`
      SELECT 
        l.id,
        l.tanggal,
        l.kegiatan,
        l.kendala,
        l.status_verifikasi,
        l.created_at
      FROM logbook l
      JOIN magang m ON l.magang_id = m.id
      WHERE m.siswa_id = $1 AND l.deleted_at IS NULL
      ORDER BY l.created_at DESC
      LIMIT 5
    `, [siswaId]);

    // Get journal statistics
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_jurnal,
        COUNT(CASE WHEN status_verifikasi = 'disetujui' THEN 1 END) as disetujui,
        COUNT(CASE WHEN status_verifikasi = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status_verifikasi = 'ditolak' THEN 1 END) as ditolak
      FROM logbook l
      JOIN magang m ON l.magang_id = m.id
      WHERE m.siswa_id = $1 AND l.deleted_at IS NULL
    `, [siswaId]);

    return NextResponse.json({
      success: true,
      data: {
        magang: magangResult.rows[0] || null,
        jurnal: jurnalResult.rows,
        stats: statsResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Siswa dashboard error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
