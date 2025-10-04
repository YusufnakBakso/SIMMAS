// app/api/school-settings/remove-logo/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = verifyToken(token!);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    // Get current logo URL from database
    const currentResult = await pool.query(
      'SELECT logo_url FROM school_settings ORDER BY id LIMIT 1'
    );

    if (currentResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada pengaturan sekolah yang ditemukan' },
        { status: 404 }
      );
    }

    const currentLogoUrl = currentResult.rows[0].logo_url;

    if (currentLogoUrl) {
      // Delete physical file
      const filename = path.basename(currentLogoUrl);
      const filepath = path.join(process.cwd(), 'public', 'uploads', 'logos', filename);
      
      if (existsSync(filepath)) {
        try {
          await unlink(filepath);
        } catch (error) {
          console.warn('Warning: Could not delete logo file:', error);
          // Continue with database update even if file deletion fails
        }
      }
    }

    // Update database to remove logo URL
    await pool.query(
      'UPDATE school_settings SET logo_url = NULL, updated_at = CURRENT_TIMESTAMP'
    );

    return NextResponse.json({
      success: true,
      message: 'Logo berhasil dihapus'
    });

  } catch (error) {
    console.error('Logo removal error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus logo' },
      { status: 500 }
    );
  }
}