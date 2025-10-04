// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// ================= PUT (Update User) =================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const requestData = await request.json();
    const { name, email, role, email_verified, siswa, guru, dudi } = requestData;
    const userId = parseInt(params.id);

    // Check if email already exists for another user
    const existingResult = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    );
    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email sudah digunakan oleh user lain' },
        { status: 400 }
      );
    }

    // Get current role of user
    const currentUserResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    if (currentUserResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }
    const currentRole = currentUserResult.rows[0].role;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const emailVerifiedAt = email_verified ? new Date() : null;

      // Update user base info
      const userUpdateResult = await client.query(
        `UPDATE users 
         SET name = $1, email = $2, role = $3, email_verified_at = $4, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $5 
         RETURNING id, name, email, role, email_verified_at, created_at`,
        [name, email, role, emailVerifiedAt, userId]
      );

      if (userUpdateResult.rows.length === 0) {
        throw new Error('Gagal memperbarui user');
      }

      // Handle role-specific data
      if (role === 'siswa' && siswa) {
        if (siswa.nis) {
          const existingNis = await client.query(
            'SELECT id FROM siswa WHERE nis = $1 AND user_id != $2',
            [siswa.nis, userId]
          );
          if (existingNis.rows.length > 0) {
            throw new Error('NIS sudah terdaftar oleh siswa lain');
          }
        }

        const existingSiswa = await client.query(
          'SELECT id FROM siswa WHERE user_id = $1',
          [userId]
        );
        if (existingSiswa.rows.length > 0) {
          await client.query(
            `UPDATE siswa 
             SET nama = $1, nis = $2, kelas = $3, jurusan = $4, alamat = $5, telepon = $6, updated_at = CURRENT_TIMESTAMP 
             WHERE user_id = $7`,
            [name, siswa.nis, siswa.kelas, siswa.jurusan, siswa.alamat, siswa.telepon, userId]
          );
        } else {
          await client.query(
            `INSERT INTO siswa (user_id, nama, nis, kelas, jurusan, alamat, telepon, created_at) 
             VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_TIMESTAMP)`,
            [userId, name, siswa.nis, siswa.kelas, siswa.jurusan, siswa.alamat, siswa.telepon]
          );
        }
      } else if (role === 'guru' && guru) {
        if (guru.nip) {
          const existingNip = await client.query(
            'SELECT id FROM guru WHERE nip = $1 AND user_id != $2',
            [guru.nip, userId]
          );
          if (existingNip.rows.length > 0) {
            throw new Error('NIP sudah terdaftar oleh guru lain');
          }
        }

        const existingGuru = await client.query(
          'SELECT id FROM guru WHERE user_id = $1',
          [userId]
        );
        if (existingGuru.rows.length > 0) {
          await client.query(
            `UPDATE guru 
             SET nama = $1, nip = $2, alamat = $3, telepon = $4, updated_at = CURRENT_TIMESTAMP 
             WHERE user_id = $5`,
            [name, guru.nip, guru.alamat, guru.telepon, userId]
          );
        } else {
          await client.query(
            `INSERT INTO guru (user_id, nama, nip, alamat, telepon, created_at) 
             VALUES ($1,$2,$3,$4,$5,CURRENT_TIMESTAMP)`,
            [userId, name, guru.nip, guru.alamat, guru.telepon]
          );
        }
      } else if (role === 'dudi' && dudi) {
        const existingDudi = await client.query(
          'SELECT id FROM dudi WHERE user_id = $1',
          [userId]
        );
        if (existingDudi.rows.length > 0) {
          await client.query(
            `UPDATE dudi 
             SET nama_perusahaan = $1, alamat = $2, telepon = $3, email = $4, penanggung_jawab = $5, updated_at = CURRENT_TIMESTAMP 
             WHERE user_id = $6`,
            [dudi.nama_perusahaan || name, dudi.alamat, dudi.telepon, email, dudi.penanggung_jawab || name, userId]
          );
        } else {
          await client.query(
            `INSERT INTO dudi (user_id, nama_perusahaan, alamat, telepon, email, penanggung_jawab, status, created_at) 
             VALUES ($1,$2,$3,$4,$5,$6,'pending',CURRENT_TIMESTAMP)`,
            [userId, dudi.nama_perusahaan || name, dudi.alamat, dudi.telepon, email, dudi.penanggung_jawab || name]
          );
        }
      }

      // Clean up if role changed
      if (currentRole !== role) {
        if (currentRole === 'siswa' && role !== 'siswa') {
          await client.query('DELETE FROM siswa WHERE user_id = $1', [userId]);
        } else if (currentRole === 'guru' && role !== 'guru') {
          await client.query('DELETE FROM guru WHERE user_id = $1', [userId]);
        } else if (currentRole === 'dudi' && role !== 'dudi') {
          await client.query('DELETE FROM dudi WHERE user_id = $1', [userId]);
        }
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'User berhasil diperbarui',
        data: userUpdateResult.rows[0],
      });
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Gagal memperbarui user',
    }, { status: 500 });
  }
}

// ================= DELETE (Delete User) =================
export async function DELETE(
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

    const existingResult = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );
    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus user' },
      { status: 500 }
    );
  }
}
