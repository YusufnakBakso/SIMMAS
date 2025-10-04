///users/[id]/detail/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const userId = parseInt(params.id);

    // Get user basic info
    const userResult = await pool.query(
      'SELECT id, name, email, role, email_verified_at, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const userData = userResult.rows[0];
    const responseData: any = {
      user: userData
    };

    // Get role-specific data
    if (userData.role === 'siswa') {
      const siswaResult = await pool.query(
        'SELECT nis, kelas, jurusan, alamat, telepon FROM siswa WHERE user_id = $1',
        [userId]
      );
      
      if (siswaResult.rows.length > 0) {
        responseData.siswa = siswaResult.rows[0];
      }
    } else if (userData.role === 'guru') {
      const guruResult = await pool.query(
        'SELECT nip, alamat, telepon FROM guru WHERE user_id = $1',
        [userId]
      );
      
      if (guruResult.rows.length > 0) {
        responseData.guru = guruResult.rows[0];
      }
    } else if (userData.role === 'dudi') {
      const dudiResult = await pool.query(
        'SELECT nama_perusahaan, alamat, telepon, penanggung_jawab FROM dudi WHERE user_id = $1',
        [userId]
      );
      
      if (dudiResult.rows.length > 0) {
        responseData.dudi = dudiResult.rows[0];
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Get user detail error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
