'use client';

import { useEffect, useState } from 'react';
import { GuruLayout } from '@/components/GuruLayout';
import JurnalDetailModal from '@/components/JurnalDetailModal';
import { CheckCircle, XCircle, Eye, Calendar, User, FileText, MessageSquare, Filter, Search } from 'lucide-react';

export default function GuruLogbookPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterDay) params.append('day', filterDay);
      if (filterMonth) params.append('month', filterMonth);
      if (filterYear) params.append('year', filterYear);
      
      const url = `/api/guru/logbook${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setEntries(data.data);
      else setEntries([]);
    } catch (err) {
      console.error('Error fetch guru logbook:', err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filterStatus, filterDay, filterMonth, filterYear]);

  const handleVerifikasi = async (id: number, status: string, catatan: string) => {
    try {
      const res = await fetch('/api/guru/logbook', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, catatan }),
      });
      const data = await res.json();
      if (data.success) {
        fetchEntries();
        return Promise.resolve();
      } else {
        alert('Gagal verifikasi: ' + (data.message || 'tidak diketahui'));
        return Promise.reject();
      }
    } catch (err) {
      console.error('Verifikasi error:', err);
      alert('Terjadi kesalahan saat verifikasi');
      return Promise.reject();
    }
  };

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

  const filteredEntries = entries.filter(entry => {
    const matchesStatus = filterStatus === 'all' || entry.status_verifikasi === filterStatus;
    const matchesSearch = entry.nama_siswa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.kegiatan?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <GuruLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jurnal Harian (Guru)</h1>
            <p className="text-gray-600">Manajemen Jurnal Harian Magang</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Search and Status Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cari nama siswa atau kegiatan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="disetujui">Disetujui</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>
                
                {/* Minimal Date Filter */}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <select
                    value={filterDay}
                    onChange={(e) => setFilterDay(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs w-16"
                  >
                    <option value="">Hari</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs w-20"
                  >
                    <option value="">Bulan</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2024, i, 1).toLocaleDateString('id-ID', { month: 'short' })}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs w-16"
                  >
                    <option value="">Tahun</option>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Journal Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Memuat data...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada jurnal siswa</p>
              <p className="text-sm text-gray-400">Data jurnal akan muncul di sini setelah siswa mengirim</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{entry.nama_siswa}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{entry.nis || '-'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>{entry.kelas || '-'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4" />
                          {entry.tanggal ? new Date(entry.tanggal).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : '-'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(entry.status_verifikasi)}
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Kegiatan</h4>
                      <p className="text-gray-700 text-sm line-clamp-2">{entry.kegiatan}</p>
                    </div>

                    {entry.kendala && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Kendala</h4>
                        <p className="text-gray-700 text-sm line-clamp-1">{entry.kendala}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {entry.file && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>Dokumen terlampir</span>
                          </div>
                        )}
                        {entry.catatan_guru && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>Ada catatan guru</span>
                          </div>
                        )}
                      </div>
                      
                      {entry.status_verifikasi === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifikasi(entry.id, 'ditolak', 'Jurnal perlu diperbaiki')}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            Tolak
                          </button>
                          <button
                            onClick={() => handleVerifikasi(entry.id, 'disetujui', 'Jurnal sudah sesuai')}
                            className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Setujui
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <JurnalDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onVerifikasi={handleVerifikasi}
          onRefresh={fetchEntries}
        />
      )}
    </GuruLayout>
  );
}
