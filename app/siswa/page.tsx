'use client';

import { useState, useEffect } from 'react';
import { SiswaLayout } from '@/components/SiswaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  GraduationCap, 
  Building2, 
  Calendar,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  User
} from 'lucide-react';

interface SiswaData {
  nama: string;
  nis: string;
  kelas: string;
  jurusan: string;
}

interface SchoolSettings {
  nama_sekolah: string;
}

interface MagangData {
  id: number;
  status: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  nilai_akhir: number | null;
  nama_perusahaan: string;
  alamat_dudi: string;
  guru_nama: string;
}

interface JurnalData {
  id: number;
  tanggal: string;
  kegiatan: string;
  kendala: string;
  status_verifikasi: string;
  created_at: string;
}

interface JurnalStats {
  total_jurnal: number;
  disetujui: number;
  pending: number;
  ditolak: number;
}

export default function SiswaDashboard() {
  const [siswaData, setSiswaData] = useState<SiswaData | null>(null);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [magangData, setMagangData] = useState<MagangData | null>(null);
  const [jurnalData, setJurnalData] = useState<JurnalData[]>([]);
  const [jurnalStats, setJurnalStats] = useState<JurnalStats>({
    total_jurnal: 0,
    disetujui: 0,
    pending: 0,
    ditolak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiswaData();
    fetchSchoolSettings();
    fetchDashboardData();
  }, []);

  const fetchSiswaData = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/siswa/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSiswaData(data.data);
      }
    } catch (error) {
      console.error('Error fetching siswa data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolSettings = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/school-settings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSchoolSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching school settings:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/siswa/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setMagangData(data.data.magang);
        setJurnalData(data.data.jurnal);
        setJurnalStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      'diterima': { label: 'Aktif', className: 'bg-blue-100 text-blue-800' },
      'berlangsung': { label: 'Aktif', className: 'bg-blue-100 text-blue-800' },
      'selesai': { label: 'Selesai', className: 'bg-green-100 text-green-800' },
      'ditolak': { label: 'Ditolak', className: 'bg-red-100 text-red-800' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getJurnalStatusIcon = (status: string) => {
    switch (status) {
      case 'disetujui':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'ditolak':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <SiswaLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SiswaLayout>
    );
  }

  return (
    <SiswaLayout>
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Selamat datang, {siswaData?.nama || 'Siswa'}!
              </h1>
              <p className="text-gray-600">
                Sistem Pelaporan Magang Siswa {schoolSettings?.nama_sekolah || 'SMK Negeri 1 Surabaya'}
              </p>
            </div>
          </div>
        </div>

        {/* Student Statistics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Jurnal</CardTitle>
              <BookOpen className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{jurnalStats.total_jurnal}</div>
              <p className="text-xs text-blue-600">Jurnal yang telah dibuat</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Disetujui</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{jurnalStats.disetujui}</div>
              <p className="text-xs text-green-600">Jurnal yang sudah disetujui</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Pending</CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700">{jurnalStats.pending}</div>
              <p className="text-xs text-yellow-600">Menunggu persetujuan</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Status Magang</CardTitle>
              <Building2 className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-700">
                {magangData ? getStatusBadge(magangData.status) : 'Belum Ada'}
              </div>
              <p className="text-xs text-purple-600">Status magang saat ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Student Info Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-800">NIS</CardTitle>
              <GraduationCap className="h-5 w-5 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-700">{siswaData?.nis || '-'}</div>
              <p className="text-xs text-cyan-600">Nomor Induk Siswa</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800">Kelas</CardTitle>
              <Building2 className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">{siswaData?.kelas || '-'}</div>
              <p className="text-xs text-emerald-600">Kelas saat ini</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Jurusan</CardTitle>
              <BookOpen className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-orange-700">{siswaData?.jurusan || '-'}</div>
              <p className="text-xs text-orange-600">Program keahlian</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-violet-800">Status</CardTitle>
              <Calendar className="h-5 w-5 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-violet-700">Aktif</div>
              <p className="text-xs text-violet-600">Status siswa</p>
            </CardContent>
          </Card>
        </div>

        {/* Internship & Journal Information */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Internship Information */}
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-t-lg -m-6 mb-6 p-6">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Building2 className="h-6 w-6" />
                <span className="text-lg font-semibold">Informasi Magang</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {magangData ? (
                <div className="space-y-4">
                  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-cyan-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 text-lg">{magangData.nama_perusahaan}</h3>
                      {getStatusBadge(magangData.status)}
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-3 p-2 bg-white/50 rounded-lg">
                        <MapPin className="w-5 h-5 text-cyan-600" />
                        <span className="text-gray-700 font-medium">{magangData.alamat_dudi}</span>
                      </div>
                      <div className="flex items-center space-x-3 p-2 bg-white/50 rounded-lg">
                        <User className="w-5 h-5 text-cyan-600" />
                        <span className="text-gray-700 font-medium">Guru: {magangData.guru_nama}</span>
                      </div>
                      <div className="flex items-center space-x-3 p-2 bg-white/50 rounded-lg">
                        <Calendar className="w-5 h-5 text-cyan-600" />
                        <span className="text-gray-700 font-medium">
                          {formatDate(magangData.tanggal_mulai)} - {magangData.tanggal_selesai ? formatDate(magangData.tanggal_selesai) : 'Sekarang'}
                        </span>
                      </div>
                      {magangData.nilai_akhir && (
                        <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg border border-green-200">
                          <GraduationCap className="w-5 h-5 text-green-600" />
                          <span className="text-green-700 font-bold">Nilai: {magangData.nilai_akhir}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/70 backdrop-blur-sm p-8 rounded-xl text-center border border-cyan-200">
                  <Building2 className="w-16 h-16 text-cyan-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Belum ada data magang</p>
                  <p className="text-sm text-gray-500">Daftar magang di halaman DUDI untuk memulai</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Journal Information */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg -m-6 mb-6 p-6">
              <CardTitle className="flex items-center space-x-2 text-white">
                <BookOpen className="h-6 w-6" />
                <span className="text-lg font-semibold">Jurnal Harian Terbaru</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jurnalData.length > 0 ? (
                <div className="space-y-3">
                  {jurnalData.slice(0, 3).map((jurnal) => (
                    <div key={jurnal.id} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getJurnalStatusIcon(jurnal.status_verifikasi)}
                          <span className="text-sm font-bold text-gray-900">
                            {formatDate(jurnal.tanggal)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full">
                          {new Date(jurnal.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 font-medium">{jurnal.kegiatan}</p>
                      {jurnal.kendala && (
                        <p className="text-xs text-gray-600 bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                          <strong>Kendala:</strong> {jurnal.kendala}
                        </p>
                      )}
                    </div>
                  ))}
                  {jurnalData.length > 3 && (
                    <div className="text-center">
                      <span className="inline-block bg-white/70 text-gray-600 text-xs px-3 py-1 rounded-full border border-green-200">
                        Dan {jurnalData.length - 3} jurnal lainnya...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/70 backdrop-blur-sm p-8 rounded-xl text-center border border-green-200">
                  <BookOpen className="w-16 h-16 text-green-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Belum ada jurnal</p>
                  <p className="text-sm text-gray-500">Mulai menulis jurnal harian setelah magang dimulai</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        {jurnalStats.total_jurnal > 0 && (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg -m-6 mb-6 p-6">
              <CardTitle className="flex items-center space-x-2 text-white">
                <BookOpen className="h-6 w-6" />
                <span className="text-lg font-semibold">Progress Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-purple-200">
                  <div className="text-4xl font-bold text-purple-700 mb-2">{jurnalStats.total_jurnal}</div>
                  <p className="text-sm text-purple-600 font-medium">Total Jurnal</p>
                  <p className="text-xs text-gray-500 mt-1">Jurnal yang telah dibuat</p>
                </div>
                <div className="text-center bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-green-200">
                  <div className="text-4xl font-bold text-green-700 mb-2">{jurnalStats.disetujui}</div>
                  <p className="text-sm text-green-600 font-medium">Disetujui</p>
                  <p className="text-xs text-gray-500 mt-1">Jurnal yang sudah disetujui</p>
                </div>
                <div className="text-center bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-yellow-200">
                  <div className="text-4xl font-bold text-yellow-700 mb-2">{jurnalStats.pending}</div>
                  <p className="text-sm text-yellow-600 font-medium">Pending</p>
                  <p className="text-xs text-gray-500 mt-1">Menunggu persetujuan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SiswaLayout>
  );
}