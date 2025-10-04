import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET single DUDI by ID
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

    const dudiId = parseInt(params.id);
    
    const result = await pool.query(
      `SELECT 
        d.*,
        COUNT(m.id) as siswa_magang_count
      FROM dudi d
      LEFT JOIN magang m ON d.id = m.dudi_id AND m.status IN ('berlangsung', 'diterima')
      WHERE d.id = $1
      GROUP BY d.id`,
      [dudiId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'DUDI tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get DUDI by ID error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// UPDATE DUDI by ID
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

    const dudiId = parseInt(params.id);
    const { nama_perusahaan, alamat, telepon, email, penanggung_jawab, status } = await request.json();

    // Check if DUDI exists
    const existingDudi = await pool.query('SELECT id FROM dudi WHERE id = $1', [dudiId]);
    if (existingDudi.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'DUDI tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if company name already exists (excluding current record)
    const duplicateCheck = await pool.query(
      'SELECT id FROM dudi WHERE nama_perusahaan = $1 AND id != $2',
      [nama_perusahaan, dudiId]
    );

    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Nama perusahaan sudah terdaftar' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE dudi 
       SET nama_perusahaan = $1, alamat = $2, telepon = $3, email = $4, 
           penanggung_jawab = $5, status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [nama_perusahaan, alamat, telepon, email, penanggung_jawab, status, dudiId]
    );

    return NextResponse.json({
      success: true,
      message: 'DUDI berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update DUDI error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Gagal memperbarui DUDI' 
    }, { status: 500 });
  }
}

// DELETE DUDI by ID
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

    const dudiId = parseInt(params.id);

    // Check if DUDI exists
    const existingDudi = await pool.query('SELECT id, nama_perusahaan FROM dudi WHERE id = $1', [dudiId]);
    if (existingDudi.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'DUDI tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if there are active internships
    const activeMagang = await pool.query(
      'SELECT COUNT(*) as count FROM magang WHERE dudi_id = $1 AND status IN ($2, $3)',
      [dudiId, 'berlangsung', 'diterima']
    );

    if (parseInt(activeMagang.rows[0].count) > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Tidak dapat menghapus DUDI yang masih memiliki siswa magang aktif' 
        },
        { status: 400 }
      );
    }

    // Delete the DUDI (this will cascade to related records if properly configured)
    await pool.query('DELETE FROM dudi WHERE id = $1', [dudiId]);

    return NextResponse.json({
      success: true,
      message: `DUDI ${existingDudi.rows[0].nama_perusahaan} berhasil dihapus`
    });
  } catch (error) {
    console.error('Delete DUDI error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Gagal menghapus DUDI' 
    }, { status: 500 });
  }
}