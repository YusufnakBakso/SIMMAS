'use client';

import { useState, useEffect } from 'react';
import { GuruLayout } from '@/components/GuruLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Search,
  MapPin,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface GuruDudiStats {
  totalDudi: number;
  totalSiswaMagang: number;
  rataRataSiswa: number;
}

export interface Dudi {
  id: number;
  nama_perusahaan: string;
  alamat: string;
  telepon: string;
  email: string;
  penanggung_jawab: string;
  status: 'aktif' | 'nonaktif' | 'pending';
  created_at: string;
  siswa_bimbingan_count: number;
}

export default function GuruDudiManagement() {
  const [dudiList, setDudiList] = useState<Dudi[]>([]);
  const [stats, setStats] = useState<GuruDudiStats>({
    totalDudi: 0,
    totalSiswaMagang: 0,
    rataRataSiswa: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);

  useEffect(() => {
    setCurrentPage(1);
    fetchDudiData();
  }, [searchTerm, limit]);

  useEffect(() => {
    fetchDudiData();
  }, [currentPage]);

  const fetchDudiData = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const offset = (currentPage - 1) * limit;
      const params = new URLSearchParams({
        search: searchTerm,
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await fetch(`/api/guru/dudi?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setDudiList(data.data);
        setStats(data.stats);
        setTotalData(data.total || data.stats.totalDudi);
      }
    } catch (error) {
      console.error('Error fetching DUDI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'aktif': { label: 'Aktif', className: 'bg-green-100 text-green-800' },
      'nonaktif': { label: 'Tidak Aktif', className: 'bg-red-100 text-red-800' },
      'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getSiswaBadge = (count: number) => {
    let bgColor = 'bg-gray-500';
    if (count > 0 && count <= 5) bgColor = 'bg-blue-500';
    else if (count > 5 && count <= 10) bgColor = 'bg-green-500';
    else if (count > 10) bgColor = 'bg-orange-500';

    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 ${bgColor} text-white text-xs font-semibold rounded-full`}>
        {count}
      </span>
    );
  };

  if (loading) {
    return (
      <GuruLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen DUDI</h1>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen DUDI</h1>
          <p className="text-gray-600">Data DUDI yang terhubung dengan siswa bimbingan</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total DUDI</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalDudi}</div>
              <p className="text-xs text-gray-500">Perusahaan mitra aktif</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Siswa Magang</CardTitle>
              <User className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalSiswaMagang}</div>
              <p className="text-xs text-gray-500">Siswa bimbingan magang</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Siswa</CardTitle>
              <Building2 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.rataRataSiswa}</div>
              <p className="text-xs text-gray-500">Per perusahaan</p>
            </CardContent>
          </Card>
        </div>

        {/* DUDI Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <CardTitle>Daftar DUDI</CardTitle>
              </div>
            </div>
            
            <div className="flex items-center justify-between space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari perusahaan, alamat, penanggung jawab..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Tampilkan:</span>
                <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500">entri</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perusahaan
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kontak
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Penanggung Jawab
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Siswa Bimbingan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dudiList.length > 0 ? (
                    dudiList.map((dudi) => (
                      <tr key={dudi.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-cyan-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{dudi.nama_perusahaan}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {dudi.alamat}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 space-y-1">
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-2 text-gray-400" />
                              {dudi.email}
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-2 text-gray-400" />
                              {dudi.telepon}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            {dudi.penanggung_jawab}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(dudi.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getSiswaBadge(dudi.siswa_bimbingan_count)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Data tidak tersedia</p>
                        <p className="text-sm text-gray-400">Belum ada DUDI yang terkait dengan siswa bimbingan Anda</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {dudiList.length > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-sm text-gray-700">
                    Menampilkan {Math.min((currentPage - 1) * limit + 1, totalData)} sampai {Math.min(currentPage * limit, totalData)} dari {totalData} entri
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {(() => {
                      const totalPages = Math.ceil(totalData / limit);
                      const pages = [];
                      
                      const startPage = Math.max(1, currentPage - 2);
                      const endPage = Math.min(totalPages, startPage + 4);
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              currentPage === i 
                                ? 'bg-cyan-500 text-white border-cyan-500' 
                                : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                      
                      return pages;
                    })()}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalData / limit)))}
                      disabled={currentPage === Math.ceil(totalData / limit)}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </GuruLayout>
  );
}