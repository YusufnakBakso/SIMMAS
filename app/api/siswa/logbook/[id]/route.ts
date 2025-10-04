import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

// GET detail logbook
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);

    if (!user || user.role !== "siswa") {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const result = await pool.query(
      `SELECT * FROM logbook 
       WHERE id = $1 AND magang_id IN (SELECT id FROM magang WHERE siswa_id = $2)`,
      [params.id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Logbook tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("GET Detail Logbook error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// PUT update logbook
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);

    if (!user || user.role !== "siswa") {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const { tanggal, kegiatan, kendala } = await request.json();

    const result = await pool.query(
      `UPDATE logbook 
       SET tanggal = $1, kegiatan = $2, kendala = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND magang_id IN (SELECT id FROM magang WHERE siswa_id = $5)
       RETURNING *`,
      [tanggal, kegiatan, kendala, params.id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Logbook tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("PUT Logbook error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// DELETE logbook
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);

    if (!user || user.role !== "siswa") {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const result = await pool.query(
      `DELETE FROM logbook 
       WHERE id = $1 AND magang_id IN (SELECT id FROM magang WHERE siswa_id = $2)
       RETURNING *`,
      [params.id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Logbook tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Logbook berhasil dihapus" });
  } catch (err) {
    console.error("DELETE Logbook error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}


