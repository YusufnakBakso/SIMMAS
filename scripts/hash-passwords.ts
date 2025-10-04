/*import pool from "@/lib/db";*/
import pool from "../lib/db";
import bcrypt from "bcryptjs";
import "dotenv/config";

console.log("ENV CHECK:", {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  db: process.env.POSTGRES_DB,
  pass: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});


async function migratePasswords() {
  try {
    // Ambil semua user
    const result = await pool.query("SELECT id, password FROM users");

    for (const user of result.rows) {
      const plainPassword = user.password;

      // Kalau password kelihatan masih plain (misal < 30 karakter), hash
      if (plainPassword && plainPassword.length < 30) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(plainPassword, salt);

        await pool.query(
          "UPDATE users SET password = $1 WHERE id = $2",
          [hashed, user.id]
        );

        console.log(`✅ Password user ${user.id} berhasil di-hash`);
      } else {
        console.log(`⏩ User ${user.id} sudah hash, dilewati`);
      }
    }

    console.log("🚀 Migrasi selesai!");
  } catch (error) {
    console.error("❌ Error saat migrasi:", error);
  } finally {
    await pool.end();
  }
}

migratePasswords();
