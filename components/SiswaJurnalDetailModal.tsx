'use client';

import { useState } from 'react';
import { X, Download, Edit, FileText, User, Calendar } from 'lucide-react';

interface SiswaJurnalDetailModalProps {
  entry: any;
  onClose: () => void;
}

export default function SiswaJurnalDetailModal({ entry, onClose }: SiswaJurnalDetailModalProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disetujui':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">disetujui</span>;
      case 'ditolak':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">ditolak</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">menunggu</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">menunggu</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} ${month} ${year}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Detail Jurnal Harian</h2>
              <p className="text-sm text-gray-500">{formatDate(entry.tanggal)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Student Info - From Student's Perspective */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Nama Siswa</label>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-gray-400" />
                <p className="font-semibold text-gray-900">Yusuf Atmoko Aji</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">NIS</label>
              <p className="mt-1 text-gray-900">-</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Kelas</label>
              <p className="mt-1 text-gray-900">-</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                {getStatusBadge(entry.status_verifikasi)}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Content */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Kegiatan Hari Ini</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">{entry.kegiatan}</p>
          </div>
          
          {entry.kendala && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Kendala</h4>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{entry.kendala}</p>
              </div>
            </div>
          )}
        </div>

        {/* Documentation */}
        {entry.file && (
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Dokumentasi</h3>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div>
                <p className="font-medium text-gray-900">{entry.file.split('/').pop()}</p>
                <p className="text-sm text-gray-500">Dokumen terlampir</p>
              </div>
              <a
                href={entry.file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Unduh
              </a>
            </div>
          </div>
        )}

        {/* Teacher Comments - Read Only for Students */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Edit className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Catatan Guru</h3>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              {entry.catatan_guru || 'Belum ada catatan dari guru'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}











