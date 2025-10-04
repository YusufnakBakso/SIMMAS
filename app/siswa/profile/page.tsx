//profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { SiswaLayout } from '@/components/SiswaLayout';
import { User, MapPin, Calendar, Award, Building2, GraduationCap, Hash, BookOpen } from 'lucide-react';

interface MagangData {
  nama: string;
  nis: string;
  kelas: string;
  jurusan: string;
  nama_perusahaan: string;
  alamat: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: 'aktif' | 'selesai' | 'menunggu';
  nilai_akhir: number | null;
}

export default function SiswaProfilePage() {
  const [loading, setLoading] = useState(true);
  const [magangData, setMagangData] = useState<MagangData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMagangData();
  }, []);

  const fetchMagangData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/siswa/profile');
      const result = await response.json();

      if (result.success) {
        setMagangData(result.data);
      } else {
        setError('Gagal memuat data magang');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aktif':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'selesai':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'menunggu':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aktif':
        return 'Aktif';
      case 'selesai':
        return 'Selesai';
      case 'menunggu':
        return 'Menunggu';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <SiswaLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Status Magang Saya</h1>
            <p className="text-gray-600">Informasi pribadi dan akademik</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </SiswaLayout>
    );
  }

  if (error || !magangData) {
    return (
      <SiswaLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Status Magang Saya</h1>
            <p className="text-gray-600">Informasi pribadi dan akademik</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-red-500">{error || 'Data tidak ditemukan'}</p>
          </div>
        </div>
      </SiswaLayout>
    );
  }

  return (
    <SiswaLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Status Magang Saya</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 text-white">
              <User className="w-6 h-6 text-blue-500" />
              <h2 className="text-lg text-black font-semibold">Data Magang</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Personal Info */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">Nama Siswa</div>
                      <div className="font-medium text-gray-900">{magangData.nama}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">Kelas</div>
                      <div className="font-medium text-gray-900">{magangData.kelas}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">Nama Perusahaan</div>
                      <div className="font-medium text-gray-900">{magangData.nama_perusahaan}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">Periode Magang</div>
                      <div className="font-medium text-gray-900">
                        {formatDate(magangData.tanggal_mulai)} s.d {formatDate(magangData.tanggal_selesai)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">Nilai Akhir</div>
                      {magangData.nilai_akhir !== null ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-cyan-600">{magangData.nilai_akhir}</span>
                          <span className="text-sm text-gray-500">/100</span>
                        </div>
                      ) : (
                        <div className="font-medium text-gray-400 italic">Belum ada nilai</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Magang Info */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Hash className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">NIS</div>
                      <div className="font-medium text-gray-900">{magangData.nis}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">Jurusan</div>
                      <div className="font-medium text-gray-900">{magangData.jurusan}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">Alamat</div>
                      <div className="font-medium text-gray-900">{magangData.alamat}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">Status</div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(magangData.status)}`}>
                        {getStatusText(magangData.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        {magangData.status === 'aktif' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Status Magang Aktif</h3>
                <p className="text-sm text-blue-700">
                  Anda sedang menjalani program magang. Pastikan untuk mengisi jurnal harian dan mengikuti semua kegiatan magang dengan baik.
                </p>
              </div>
            </div>
          </div>
        )}

        {magangData.status === 'selesai' && magangData.nilai_akhir !== null && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">Magang Selesai</h3>
                <p className="text-sm text-green-700">
                  Selamat! Anda telah menyelesaikan program magang dengan nilai {magangData.nilai_akhir}. Sertifikat akan segera diproses.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SiswaLayout>
  );
}