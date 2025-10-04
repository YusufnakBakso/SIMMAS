///users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken, hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0'); 

    let query = 'SELECT id, name, email, role, email_verified_at, created_at FROM users';
    /*let queryParams = [];*/
    /*const queryParams: any[] = [];*/
    const queryParams: (string | number | null)[] = [];
    let paramCount = 0;
    /*let whereConditions = [];*/
    const whereConditions: string[] = [];

    if (search) {
      paramCount++;
      whereConditions.push(`(name ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    if (role && role !== 'all') {
      paramCount++;
      whereConditions.push(`role = $${paramCount}`);
      /*whereConditions.push(`LOWER(role) = LOWER($${paramCount})`);*/
      queryParams.push(role);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ' ORDER BY created_at DESC';
    
    if (limit > 0) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      queryParams.push(limit);
    }
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const result = await pool.query(query, queryParams);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const requestData = await request.json();
    const {
      name,
      email,
      role,
      password,
      email_verified,
      // Siswa fields
      nis,
      kelas,
      jurusan,
      siswa_alamat,
      siswa_telepon,
      // Guru fields
      nip,
      guru_alamat,
      guru_telepon
    } = requestData;

    // Check if email already exists
    const existingResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Check unique constraints for siswa/guru
    if (role === 'siswa' && nis) {
      const existingNis = await pool.query('SELECT id FROM siswa WHERE nis = $1', [nis]);
      if (existingNis.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: 'NIS sudah terdaftar' },
          { status: 400 }
        );
      }
    }

    if (role === 'guru' && nip) {
      const existingNip = await pool.query('SELECT id FROM guru WHERE nip = $1', [nip]);
      if (existingNip.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: 'NIP sudah terdaftar' },
          { status: 400 }
        );
      }
    }

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const hashedPassword = hashPassword(password);
      const emailVerifiedAt = email_verified ? new Date() : null;

      // Insert user
      const userResult = await client.query(
        'INSERT INTO users (name, email, role, password, email_verified_at, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id, name, email, role, email_verified_at, created_at',
        [name, email, role, hashedPassword, emailVerifiedAt]
      );

      const newUser = userResult.rows[0];
      const userId = newUser.id;

      // Insert additional data based on role
      if (role === 'siswa') {
        await client.query(
          'INSERT INTO siswa (user_id, nama, nis, kelas, jurusan, alamat, telepon, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)',
          [userId, name, nis, kelas, jurusan, siswa_alamat, siswa_telepon]
        );
      } else if (role === 'guru') {
        await client.query(
          'INSERT INTO guru (user_id, nama, nip, alamat, telepon, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)',
          [userId, name, nip, guru_alamat, guru_telepon]
        );
      } else if (role === 'dudi') {
        // For DUDI users, we might want to create a placeholder entry or handle separately
        await client.query(
          'INSERT INTO dudi (user_id, nama_perusahaan, alamat, telepon, email, penanggung_jawab, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)',
          [userId, name, '', '', email, name, 'pending']
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'User berhasil ditambahkan',
        data: newUser
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Gagal menambahkan user' 
    }, { status: 500 });
  }
}
