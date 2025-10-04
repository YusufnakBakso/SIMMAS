'use client';

import { useEffect, useState } from 'react';
import { SiswaLayout } from '@/components/SiswaLayout';
import TambahJurnalForm from '@/components/TambahJurnalForm';
import SiswaJurnalDetailModal from '@/components/SiswaJurnalDetailModal';
import {
  Plus, FileText, CheckCircle, Clock, Eye,
  MessageSquare, Trash2, Filter, AlertCircle, ChevronDown, Edit
} from 'lucide-react';

export default function SiswaLogbookPage() {
  const [showFilter, setShowFilter] = useState(true);
  const [filters, setFilters] = useState({ status: '', bulan: '', tahun: '' });
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<any | null>(null); // untuk edit
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null); // untuk detail modal
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState('10');

  // Fetch dari API siswa logbook
  const fetchEntries = async (page = 1) => {
    try {
      setLoading(true);
      const limit = parseInt(itemsPerPage, 10) || 10;
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        status: filters.status || 'all',
        bulan: filters.bulan || '0',
        tahun: filters.tahun || '0',
        limit: String(limit),
        offset: String(offset),
      });

      const token = localStorage.getItem('auth-token');
      const res = await fetch(`/api/siswa/logbook?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) {
        // coba parse body untuk pesan error
        let errText = `HTTP ${res.status}`;
        let userFriendlyMessage = 'Gagal memuat data jurnal';
        try {
          const errJson = await res.json();
          errText = errJson?.message || JSON.stringify(errJson);
          userFriendlyMessage = errJson?.message || userFriendlyMessage;
        } catch {}
        console.error('fetchEntries error:', errText);
        alert(`Error: ${userFriendlyMessage}`);
        setEntries([]);
        return;
      }

      const data = await res.json();
      if (data && data.success) {
        setEntries(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error('fetchEntries payload error:', data);
        setEntries([]);
      }
    } catch (err) {
      console.error('Gagal ambil data logbook:', err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // initial & whenever filters/itemsPerPage/page berubah
  useEffect(() => {
    fetchEntries(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, itemsPerPage, currentPage]);

  // dipanggil setelah berhasil POST/PUT dari modal
  const handleSuccess = () => {
    setShowForm(false);
    setEditEntry(null);
    setCurrentPage(1);
    fetchEntries(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus jurnal ini?')) return;
    try {
      const token = localStorage.getItem('auth-token');
      const res = await fetch('/api/siswa/logbook', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // refresh current page (atau reset ke 1 kalau kosong)
        fetchEntries(currentPage);
      } else {
        alert('Gagal hapus: ' + (data.message || 'Server error'));
      }
    } catch (err) {
      console.error('Error hapus jurnal:', err);
      alert('Terjadi kesalahan saat menghapus jurnal');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ditolak': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'disetujui': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const limit = parseInt(itemsPerPage, 10) || 10;
  const canNext = entries.length === limit;
  const canPrev = currentPage > 1;

  return (
    <SiswaLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Jurnal Harian Magang</h1>
              <p className="text-cyan-100">Dokumentasikan kegiatan magang harian Anda dengan detail</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{entries.length} Jurnal</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>{entries.filter(e => e.status_verifikasi === 'disetujui').length} Disetujui</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{entries.filter(e => e.status_verifikasi === 'pending').length} Menunggu</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowForm(true); setEditEntry(null); }}
                className="flex items-center gap-2 bg-white text-cyan-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" /> Tambah Jurnal Baru
              </button>
            </div>
          </div>
        </div>

        {/* Filter (ringkas) */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter</span>
            </div>
            <div className="flex items-center gap-2">
              <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} className="px-3 py-2 border rounded">
                <option value="">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
              </select>
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value)} className="px-3 py-2 border rounded">
                <option value="5">5 / halaman</option>
                <option value="10">10 / halaman</option>
                <option value="25">25 / halaman</option>
              </select>
            </div>
          </div>
        </div>

        {/* Riwayat Jurnal */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Memuat data jurnal...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Belum ada jurnal</p>
              <p className="text-sm text-gray-400 mt-1">Mulai tambah jurnal harian kegiatan magang Anda</p>
              <button
                onClick={() => { setShowForm(true); setEditEntry(null); }}
                className="mt-4 inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" /> Tambah Jurnal Pertama
              </button>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header with date and status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-100 rounded-lg">
                        <FileText className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {entry.tanggal ? new Date(entry.tanggal).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Tanggal tidak tersedia'}
                        </h3>
                        <p className="text-sm text-gray-500">Jurnal Harian Magang</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(entry.status_verifikasi)}`}>
                        {entry.status_verifikasi === 'pending' && '⏳ Menunggu'}
                        {entry.status_verifikasi === 'disetujui' && '✅ Disetujui'}
                        {entry.status_verifikasi === 'ditolak' && '❌ Ditolak'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Kegiatan yang Dilakukan</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{entry.kegiatan}</p>
                    </div>

                    {entry.kendala && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Kendala atau Hambatan</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{entry.kendala}</p>
                      </div>
                    )}

                    {entry.catatan_guru && (
                      <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                        <h4 className="font-medium text-blue-900 mb-1 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Feedback Guru
                        </h4>
                        <p className="text-blue-800 text-sm">{entry.catatan_guru}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer with file and actions */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {entry.file && (
                        <a
                          href={entry.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <FileText className="w-4 h-4" />
                          Lihat Dokumentasi
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="flex items-center gap-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                        title="Lihat Detail Jurnal"
                      >
                        <Eye className="w-4 h-4" />
                        Lihat Detail
                      </button>

                      {(entry.status_verifikasi === 'pending' || entry.status_verifikasi === 'ditolak') && (
                        <>
                          <button
                            onClick={() => { setEditEntry(entry); setShowForm(true); }}
                            className="flex items-center gap-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                            title="Edit Jurnal"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                            title="Hapus Jurnal"
                          >
                            <Trash2 className="w-4 h-4" />
                            Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {entries.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Menampilkan halaman {currentPage} • {entries.length} entri
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { if (canPrev) setCurrentPage(p => p - 1); }}
                    disabled={!canPrev}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    ← Sebelumnya
                  </button>
                  <span className="px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-lg text-sm font-medium">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => { if (canNext) setCurrentPage(p => p + 1); }}
                    disabled={!canNext}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Selanjutnya →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal tambah / edit */}
      {showForm && (
        <TambahJurnalForm
          onClose={() => { setShowForm(false); setEditEntry(null); }}
          onSuccess={handleSuccess}
          initialData={editEntry ?? undefined}
        />
      )}

      {/* Modal detail jurnal */}
      {selectedEntry && (
        <SiswaJurnalDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </SiswaLayout>
  );
}
