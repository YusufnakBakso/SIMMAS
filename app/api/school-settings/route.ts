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

if (!user || !['admin', 'guru', 'siswa'].includes(user.role)) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const result = await pool.query('SELECT * FROM school_settings ORDER BY id LIMIT 1');
    
    if (result.rows.length === 0) {
      // Create default settings if none exist
      const defaultSettings = {
        nama_sekolah: 'Nama Sekolah Belum Diatur',
        alamat: 'Alamat Belum Diatur',
        telepon: 'Telepon Belum Diatur',
        email: 'Email Belum Diatur',
        website: 'Website Belum Diatur',
        kepala_sekolah: 'Kepala Sekolah Belum Diatur',
        npsn: 'NPSN Belum Diatur'
      };

      const insertResult = await pool.query(
        'INSERT INTO school_settings (nama_sekolah, alamat, telepon, email, website, kepala_sekolah, npsn, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING *',
        [defaultSettings.nama_sekolah, defaultSettings.alamat, defaultSettings.telepon, defaultSettings.email, defaultSettings.website, defaultSettings.kepala_sekolah, defaultSettings.npsn]
      );

      return NextResponse.json({
        success: true,
        data: insertResult.rows[0]
      });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get school settings error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const { nama_sekolah, alamat, telepon, email, website, kepala_sekolah, npsn } = await request.json();

    const result = await pool.query(
      'UPDATE school_settings SET nama_sekolah = $1, alamat = $2, telepon = $3, email = $4, website = $5, kepala_sekolah = $6, npsn = $7, updated_at = CURRENT_TIMESTAMP RETURNING *',
      [nama_sekolah, alamat, telepon, email, website, kepala_sekolah, npsn]
    );

    return NextResponse.json({
      success: true,
      message: 'Pengaturan sekolah berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update school settings error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}