'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
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

export interface DashboardStats {
  totalSiswa: number;
  totalDudi: number;
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSiswa: 0,
    totalDudi: 0,
    siswaMagang: 0,
    logbookHariIni: 0
  });
  const [recentMagang, setRecentMagang] = useState<RecentMagang[]>([]);
  const [activeDudi, setActiveDudi] = useState<ActiveDudi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/dashboard/stats', {
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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Selamat Datang Di Sistem Pelaporan Magang Siswa SMKN Negeri 1 Surabaya</p>
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
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Selamat datang di Sistem Pelaporan Magang Siswa</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalSiswa}</div>
              <p className="text-xs text-gray-500">Seluruh siswa terdaftar</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DUDI Partner</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalDudi}</div>
              <p className="text-xs text-gray-500">Perusahaan mitra</p>
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
                <p className="text-gray-500 text-center py-4">Belum ada data magang terbaru</p>
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
                <p className="text-gray-500 text-center py-4">Belum ada DUDI aktif</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Logbook Terbaru removed as requested */}
      </div>
    </AdminLayout>
  );
}