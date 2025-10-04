// app/api/siswa/logbook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// ====================== GET ======================
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    if (!user || user.role !== 'siswa') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const siswaRes = await pool.query('SELECT id FROM siswa WHERE user_id = $1', [user.id]);
    if (!siswaRes.rowCount) {
      return NextResponse.json({ success: false, message: 'Data siswa tidak ditemukan' }, { status: 404 });
    }
    const siswaId = siswaRes.rows[0].id;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const bulan = parseInt(searchParams.get('bulan') || '0');
    const tahun = parseInt(searchParams.get('tahun') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT l.id, l.tanggal, l.kegiatan, l.kendala, l.file,
             l.status_verifikasi, l.catatan_guru, l.created_at
      FROM logbook l
      JOIN magang m ON l.magang_id = m.id
      WHERE m.siswa_id = $1 AND l.deleted_at IS NULL
    `;
    const params: any[] = [siswaId];
    let idx = 1;

    if (status !== 'all') {
      idx++;
      query += ` AND l.status_verifikasi = $${idx}`;
      params.push(status);
    }
    if (bulan > 0) {
      idx++;
      query += ` AND EXTRACT(MONTH FROM l.tanggal) = $${idx}`;
      params.push(bulan);
    }
    if (tahun > 0) {
      idx++;
      query += ` AND EXTRACT(YEAR FROM l.tanggal) = $${idx}`;
      params.push(tahun);
    }

    idx++;
    query += ` ORDER BY l.tanggal DESC LIMIT $${idx}`;
    params.push(limit);

    idx++;
    query += ` OFFSET $${idx}`;
    params.push(offset);

    const result = await pool.query(query, params);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('GET Logbook error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// ====================== POST ======================
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    if (!user || user.role !== 'siswa') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const form = await request.formData();
    const tanggal = (form.get('tanggal') || '').toString();
    const kegiatan = (form.get('kegiatan') || '').toString();
    const kendala = (form.get('kendala') || '').toString();
    const file = form.get('file') as File | null;

    if (!tanggal || !kegiatan) {
      return NextResponse.json({ success: false, message: 'Lengkapi tanggal dan kegiatan.' }, { status: 400 });
    }

    const siswaRes = await pool.query('SELECT id FROM siswa WHERE user_id = $1', [user.id]);
    if (!siswaRes.rowCount) {
      return NextResponse.json({ success: false, message: 'Data siswa tidak ditemukan' }, { status: 404 });
    }
    const siswaId = siswaRes.rows[0].id;

    const magangRes = await pool.query(
      "SELECT id FROM magang WHERE siswa_id = $1 AND status IN ($2,$3) ORDER BY created_at DESC LIMIT 1",
      [siswaId, 'berlangsung', 'diterima']
    );
    if (!magangRes.rowCount) {
      return NextResponse.json({ success: false, message: 'Tidak ada magang aktif.' }, { status: 400 });
    }
    const magangId = magangRes.rows[0].id;

    let filePath: string | null = null;
    if (file && (file as any).size) {
      const arrayBuffer = await (file as any).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logbook');
      await fs.promises.mkdir(uploadsDir, { recursive: true });
      const safeName = file.name.replace(/\s+/g, '_').replace(/[^\w.\-]/g, '');
      const fileName = `${Date.now()}_${safeName}`;
      await fs.promises.writeFile(path.join(uploadsDir, fileName), buffer);
      filePath = `/uploads/logbook/${fileName}`;
    }

    const insert = await pool.query(
      `INSERT INTO logbook (magang_id, tanggal, kegiatan, kendala, file, status_verifikasi, created_at)
       VALUES ($1,$2,$3,$4,$5,'pending',CURRENT_TIMESTAMP) RETURNING *`,
      [magangId, tanggal, kegiatan, kendala || null, filePath]
    );

    return NextResponse.json({ success: true, data: insert.rows[0] });
  } catch (err) {
    console.error('POST Logbook error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// ====================== PUT (Update) ======================
export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    if (!user || user.role !== 'siswa') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const form = await request.formData();
    const id = form.get('id')?.toString();
    const tanggal = form.get('tanggal')?.toString();
    const kegiatan = form.get('kegiatan')?.toString();
    const kendala = form.get('kendala')?.toString() || null;
    const file = form.get('file') as File | null;

    if (!id || !tanggal || !kegiatan) {
      return NextResponse.json({ success: false, message: 'ID, tanggal, dan kegiatan wajib diisi' }, { status: 400 });
    }

    const check = await pool.query(
      `SELECT l.file, l.status_verifikasi
       FROM logbook l
       JOIN magang m ON l.magang_id = m.id
       JOIN siswa s ON m.siswa_id = s.id
       WHERE l.id=$1 AND s.user_id=$2 AND l.deleted_at IS NULL`,
      [id, user.id]
    );
    if (!check.rowCount) {
      return NextResponse.json({ success: false, message: 'Logbook tidak ditemukan' }, { status: 404 });
    }
    if (check.rows[0].status_verifikasi === 'disetujui') {
      return NextResponse.json({ success: false, message: 'Jurnal sudah disetujui, tidak bisa diubah' }, { status: 400 });
    }

    let filePath = check.rows[0].file;
    if (file && (file as any).size) {
      if (filePath && filePath.startsWith('/uploads/')) {
        try { await fs.promises.unlink(path.join(process.cwd(), 'public', filePath)); } catch {}
      }
      const buffer = Buffer.from(await (file as any).arrayBuffer());
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logbook');
      await fs.promises.mkdir(uploadsDir, { recursive: true });
      const safeName = file.name.replace(/\s+/g, '_').replace(/[^\w.\-]/g, '');
      const fileName = `${Date.now()}_${safeName}`;
      await fs.promises.writeFile(path.join(uploadsDir, fileName), buffer);
      filePath = `/uploads/logbook/${fileName}`;
    }

    const update = await pool.query(
      `UPDATE logbook
       SET tanggal=$1, kegiatan=$2, kendala=$3, file=$4,
           status_verifikasi='pending', updated_at=CURRENT_TIMESTAMP
       WHERE id=$5
       RETURNING *`,
      [tanggal, kegiatan, kendala, filePath, id]
    );

    return NextResponse.json({ success: true, data: update.rows[0] });
  } catch (err) {
    console.error('PUT Logbook error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// ====================== DELETE ======================
export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    if (!user || user.role !== 'siswa') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID logbook wajib ada' }, { status: 400 });
    }

    const check = await pool.query(
      `SELECT l.file, l.status_verifikasi
       FROM logbook l
       JOIN magang m ON l.magang_id = m.id
       JOIN siswa s ON m.siswa_id = s.id
       WHERE l.id=$1 AND s.user_id=$2 AND l.deleted_at IS NULL`,
      [id, user.id]
    );
    if (!check.rowCount) {
      return NextResponse.json({ success: false, message: 'Logbook tidak ditemukan' }, { status: 404 });
    }
    if (check.rows[0].status_verifikasi === 'disetujui') {
      return NextResponse.json({ success: false, message: 'Tidak bisa menghapus jurnal yang sudah disetujui' }, { status: 400 });
    }

    if (check.rows[0].file && check.rows[0].file.startsWith('/uploads/')) {
      try { await fs.promises.unlink(path.join(process.cwd(), 'public', check.rows[0].file)); } catch {}
    }

    // Soft delete - set deleted_at timestamp instead of actually deleting
    await pool.query('UPDATE logbook SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: 'Logbook dihapus' });
  } catch (err) {
    console.error('DELETE Logbook error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
