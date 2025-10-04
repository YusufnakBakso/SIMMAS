//profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

function mapStatus(status: string | null) {
  switch (status) {
    case 'berlangsung':
    case 'diterima':
      return 'aktif';
    case 'selesai':
      return 'selesai';
    case 'pending':
      return 'menunggu';
    default:
      return 'menunggu'; // fallback kalau ditolak/dibatalkan
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    
    if (!user || user.role !== 'siswa') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    // Get siswa data
    const siswaResult = await pool.query(
      /*'SELECT * FROM siswa WHERE user_id = $1',*/
      `SELECT 
        s.id as siswa_id,
        s.nama,
        s.nis,
        s.kelas,
        s.jurusan,
        s.alamat,
        m.id as magang_id,
        m.tanggal_mulai,
        m.tanggal_selesai,
        m.nilai_akhir,
        m.status as magang_status,
        d.nama_perusahaan,
        d.alamat as alamat_perusahaan
      FROM siswa s
      LEFT JOIN magang m ON m.siswa_id = s.id
      LEFT JOIN dudi d ON d.id = m.dudi_id
      WHERE s.user_id = $1
      ORDER BY 
        CASE 
          WHEN m.status IN ('berlangsung','selesai','diterima') THEN 1
          WHEN m.status = 'pending' THEN 2
          ELSE 3
        END,
        m.created_at DESC
      LIMIT 1;`,
      [user.id]
    );

    if (siswaResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Data siswa tidak ditemukan' }, { status: 404 });
    }

    const siswaData = siswaResult.rows[0];

    // Get total pendaftaran magang
    const pendaftaranResult = await pool.query(
      'SELECT COUNT(*) as count FROM magang WHERE siswa_id = $1',
      [siswaData.id]
    );

    const totalPendaftaran = parseInt(pendaftaranResult.rows[0].count);
    const maxPendaftaran = 3; // Batas maksimal pendaftaran

    return NextResponse.json({
      success: true,
      data: {
        ...siswaData,
        status: mapStatus(siswaData.magang_status),
        total_pendaftaran: totalPendaftaran,
        max_pendaftaran: maxPendaftaran
      }
    });
  } catch (error) {
    console.error('Get siswa profile error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
