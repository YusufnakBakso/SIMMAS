'use client';

import { useState, useEffect } from 'react';
import { SiswaLayout } from '@/components/SiswaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  GraduationCap, 
  Building2, 
  Calendar,
  BookOpen
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

export default function SiswaDashboard() {
  const [siswaData, setSiswaData] = useState<SiswaData | null>(null);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiswaData();
    fetchSchoolSettings();
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

        {/* Student Info Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NIS</CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{siswaData?.nis || '-'}</div>
              <p className="text-xs text-gray-500">Nomor Induk Siswa</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kelas</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{siswaData?.kelas || '-'}</div>
              <p className="text-xs text-gray-500">Kelas saat ini</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jurusan</CardTitle>
              <BookOpen className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-orange-600">{siswaData?.jurusan || '-'}</div>
              <p className="text-xs text-gray-500">Program keahlian</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-600">Aktif</div>
              <p className="text-xs text-gray-500">Status siswa</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-cyan-500" />
                <span>Informasi Magang</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada data magang</p>
                <p className="text-sm text-gray-400">Daftar magang di halaman DUDI untuk memulai</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                <span>Jurnal Harian</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada jurnal</p>
                <p className="text-sm text-gray-400">Mulai menulis jurnal harian setelah magang dimulai</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SiswaLayout>
  );
}