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

    // Get all students that can be assigned to this teacher
    // This could be filtered by class, major, or other criteria based on school policy
    const result = await pool.query(`
      SELECT s.* 
      FROM siswa s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.nama
    `);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}