'use client';

import { useState, useEffect } from 'react';
import { GuruLayout } from '@/components/GuruLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  UserCheck, 
  BookOpen,
  TrendingUp,
  Clock,
  MapPin,
  Phone
} from 'lucide-react';

export interface GuruDashboardStats {
  totalSiswaBimbingan: number;
  totalDudiPartner: number;
  siswaMagang: number;
  logbookHariIni: number;
}

export interface RecentMagang {
  siswa_nama: string;
  nama_perusahaan: string;
  status: string;
  tanggal_mulai: string;
  created_at: string;
}

export interface ActiveDudi {
  nama_perusahaan: string;
  alamat: string;
  telepon: string;
  siswa_count: number;
}

interface SchoolSettings {
  nama_sekolah: string;
}

export default function GuruDashboard() {
  const [stats, setStats] = useState<GuruDashboardStats>({
    totalSiswaBimbingan: 0,
    totalDudiPartner: 0,
    siswaMagang: 0,
    logbookHariIni: 0
  });
  const [recentMagang, setRecentMagang] = useState<RecentMagang[]>([]);
  const [activeDudi, setActiveDudi] = useState<ActiveDudi[]>([]);
  const [recentLogbooks, setRecentLogbooks] = useState<any[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchSchoolSettings();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/guru/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setRecentMagang(data.recentMagang);
        setActiveDudi(data.activeDudi);
      }
      // fetch recent logbooks in parallel after stats call returns
      const logbookRes = await fetch('/api/guru/logbook?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const logbookData = await logbookRes.json();
      if (logbookData.success) {
        setRecentLogbooks(logbookData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Pending', variant: 'secondary' as const },
      'diterima': { label: 'Aktif', variant: 'default' as const },
      'berlangsung': { label: 'Aktif', variant: 'default' as const },
      'selesai': { label: 'Selesai', variant: 'outline' as const },
      'ditolak': { label: 'Ditolak', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getSiswaBadge = (count: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (loading) {
    return (
      <GuruLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Selamat Datang Di Sistem Pelaporan Magang Siswa {schoolSettings?.nama_sekolah || 'SMK Negeri 1 Surabaya'}</p>
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
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Selamat datang di Sistem Pelaporan Magang Siswa {schoolSettings?.nama_sekolah || 'SMK Negeri 1 Surabaya'}</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Siswa Bimbingan</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalSiswaBimbingan}</div>
              <p className="text-xs text-gray-500">Siswa di bawah bimbingan</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DUDI Partner</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalDudiPartner}</div>
              <p className="text-xs text-gray-500">Perusahaan mitra terhubung</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Siswa Magang</CardTitle>
              <UserCheck className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.siswaMagang}</div>
              <p className="text-xs text-gray-500">Sedang aktif magang</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Logbook Hari Ini</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.logbookHariIni}</div>
              <p className="text-xs text-gray-500">Laporan masuk hari ini</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Magang */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-cyan-500" />
                <CardTitle>Magang Terbaru</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentMagang.length > 0 ? (
                recentMagang.slice(0, 5).map((magang, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {magang.siswa_nama.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{magang.siswa_nama}</p>
                        <p className="text-sm text-gray-600">{magang.nama_perusahaan}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(magang.tanggal_mulai || magang.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(magang.status)}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Data tidak tersedia</p>
              )}
            </CardContent>
          </Card>

          {/* Active DUDI */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-orange-500" />
                <CardTitle>DUDI Aktif</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeDudi.length > 0 ? (
                activeDudi.slice(0, 5).map((dudi, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {dudi.nama_perusahaan.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{dudi.nama_perusahaan}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{dudi.alamat}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{dudi.telepon}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getSiswaBadge(dudi.siswa_count)}`}>
                      {dudi.siswa_count}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Data tidak tersedia</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Logbook Section (bottom) */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              <CardTitle>Logbook Terbaru</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLogbooks.length > 0 ? (
              recentLogbooks.map((lb, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                      {String(lb.nama_siswa || '').charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{lb.nama_siswa}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{lb.kegiatan}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(lb.tanggal).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={lb.status_verifikasi === 'disetujui' ? 'default' : lb.status_verifikasi === 'ditolak' ? 'destructive' : 'secondary'}>
                    {lb.status_verifikasi || 'menunggu'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Data tidak tersedia</p>
                <p className="text-sm text-gray-400">Belum ada data logbook dari siswa bimbingan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </GuruLayout>
  );
}