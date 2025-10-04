import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const resolvedParams = await params;
    const magangId = parseInt(resolvedParams.id);

    // Check if magang exists and belongs to this teacher
    const existingMagang = await pool.query(
      'SELECT id FROM magang WHERE id = $1 AND guru_id = $2',
      [magangId, guruId]
    );

    if (existingMagang.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Data magang tidak ditemukan atau Anda tidak memiliki akses' },
        { status: 404 }
      );
    }

    const { tanggal_mulai, tanggal_selesai, status, nilai_akhir } = await request.json();

    // Build the update query dynamically
    let updateFields = [];
    let queryParams = [];
    let paramCount = 0;

    // Always update these fields
    paramCount++;
    updateFields.push(`tanggal_mulai = $${paramCount}`);
    queryParams.push(tanggal_mulai || null);

    paramCount++;
    updateFields.push(`tanggal_selesai = $${paramCount}`);
    queryParams.push(tanggal_selesai || null);

    paramCount++;
    updateFields.push(`status = $${paramCount}`);
    queryParams.push(status);

    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    queryParams.push(new Date());

    // Handle nilai_akhir based on status
    if (status === 'selesai' && nilai_akhir !== null && nilai_akhir !== undefined) {
      paramCount++;
      updateFields.push(`nilai_akhir = $${paramCount}`);
      queryParams.push(nilai_akhir);
    } else if (status !== 'selesai') {
      updateFields.push(`nilai_akhir = NULL`);
    }

    // Add the WHERE clause parameter
    paramCount++;
    queryParams.push(magangId);

    const updateQuery = `UPDATE magang SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(updateQuery, queryParams);

    return NextResponse.json({
      success: true,
      message: 'Data magang berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update guru magang error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const resolvedParams = await params;
    const magangId = parseInt(resolvedParams.id);

    // Check if magang exists and belongs to this teacher
    const existingMagang = await pool.query(
      'SELECT id, siswa_id FROM magang WHERE id = $1 AND guru_id = $2',
      [magangId, guruId]
    );

    if (existingMagang.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Data magang tidak ditemukan atau Anda tidak memiliki akses' },
        { status: 404 }
      );
    }

    // Check if there are any logbook entries
    const logbookResult = await pool.query(
      'SELECT COUNT(*) as count FROM logbook WHERE magang_id = $1',
      [magangId]
    );

    if (parseInt(logbookResult.rows[0].count) > 0) {
      return NextResponse.json(
        { success: false, message: 'Tidak dapat menghapus data magang yang sudah memiliki logbook' },
        { status: 400 }
      );
    }

    await pool.query('DELETE FROM magang WHERE id = $1', [magangId]);

    return NextResponse.json({
      success: true,
      message: 'Data magang berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete guru magang error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}