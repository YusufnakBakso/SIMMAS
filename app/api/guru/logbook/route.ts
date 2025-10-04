// app/api/guru/logbook/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

/**
 * GET: ambil semua jurnal untuk guru (dengan filter opsional)
 * Mengembalikan kolom file yang sudah dinormalisasi agar bisa langsung digunakan di frontend.
 */
export async function GET(req: Request) {
  try {
    // Auth: hanya guru
    // @ts-ignore - NextRequest subset acceptable
    const token = getTokenFromRequest(req as any);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== "guru") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // Ambil guru_id dari user
    const guruRes = await pool.query("SELECT id FROM guru WHERE user_id = $1", [user.id]);
    if (guruRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Data guru tidak ditemukan" }, { status: 404 });
    }
    const guruId = guruRes.rows[0].id as number;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const day = searchParams.get("day");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const bulan = searchParams.get("bulan");
    const tahun = searchParams.get("tahun");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const siswaId = searchParams.get("siswaId");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam))) : null; // 1..100

    // ambil kolom penting eksplisit agar jelas apa yang dikirim
    let query = `
      SELECT 
        l.id,
        l.tanggal,
        l.kegiatan,
        l.kendala,
        l.file,
        l.status_verifikasi,
        l.catatan_guru,
        l.deleted_at,
        m.id AS magang_id,
        s.id AS siswa_id,
        s.nama AS nama_siswa,
        s.nis,
        s.kelas,
        s.jurusan,
        u.email AS email_siswa
      FROM logbook l
      LEFT JOIN magang m ON l.magang_id = m.id
      LEFT JOIN siswa s ON m.siswa_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE l.deleted_at IS NULL AND m.guru_id = $1
    `;

    const values: any[] = [guruId];

    if (status && status !== "all") {
      values.push(status);
      query += ` AND l.status_verifikasi = $${values.length}`;
    }
    if (day && day !== "") {
      values.push(day);
      query += ` AND EXTRACT(DAY FROM l.tanggal) = $${values.length}`;
    }
    if (month && month !== "") {
      values.push(month);
      query += ` AND EXTRACT(MONTH FROM l.tanggal) = $${values.length}`;
    }
    if (year && year !== "") {
      values.push(year);
      query += ` AND EXTRACT(YEAR FROM l.tanggal) = $${values.length}`;
    }
    if (bulan && bulan !== "0") {
      values.push(bulan);
      query += ` AND EXTRACT(MONTH FROM l.tanggal) = $${values.length}`;
    }
    if (tahun && tahun !== "0") {
      values.push(tahun);
      query += ` AND EXTRACT(YEAR FROM l.tanggal) = $${values.length}`;
    }
    if (startDate) {
      values.push(startDate);
      query += ` AND l.tanggal >= $${values.length}`;
    }
    if (endDate) {
      values.push(endDate);
      query += ` AND l.tanggal <= $${values.length}`;
    }
    if (siswaId) {
      values.push(siswaId);
      query += ` AND s.id = $${values.length}`;
    }

    query += " ORDER BY l.created_at DESC NULLS LAST, l.tanggal DESC";
    if (limit) {
      values.push(limit);
      query += ` LIMIT $${values.length}`;
    }

    const result = await pool.query(query, values);

    // Normalisasi field file supaya frontend mudah pakai
    const rows = result.rows.map((r: any) => {
      const fileVal: string | null = r.file ?? null;
      let normalized: string | null = null;

      if (fileVal) {
        const trimmed = String(fileVal).trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
          normalized = trimmed;
        } else if (trimmed.startsWith("/")) {
          // sudah path absolut relatif root, pakai apa adanya
          normalized = trimmed;
        } else {
          // dianggap nama file, prefix ke /uploads/
          normalized = `/uploads/${trimmed}`;
        }
      }

      return {
        ...r,
        file: normalized,
      };
    });

    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    console.error("GET /api/guru/logbook error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

/**
 * PUT: verifikasi jurnal (set status dan catatan_guru)
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, catatan } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "ID dan status wajib diisi" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE logbook 
       SET status_verifikasi = $1, catatan_guru = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, catatan || null, id]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error("PUT /api/guru/logbook error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
