'use client';

import { useState, useEffect } from 'react';
import { GuruLayout } from '@/components/GuruLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Clock,
  Building2,
  User,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Award,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

export interface MagangStats {
  totalSiswa: number;
  aktif: number;
  selesai: number;
  pending: number;
}

export interface Magang {
  id: number;
  siswa_id: number;
  siswa_nama: string;
  siswa_nis: string;
  siswa_kelas: string;
  siswa_jurusan: string;
  dudi_id: number;
  nama_perusahaan: string;
  alamat_dudi: string;
  guru_id: number;
  guru_nama: string;
  status: 'pending' | 'diterima' | 'ditolak' | 'berlangsung' | 'selesai' | 'dibatalkan';
  nilai_akhir: number | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  created_at: string;
}

export interface Siswa {
  id: number;
  nama: string;
  nis: string;
  kelas: string;
  jurusan: string;
}

export interface Dudi {
  id: number;
  nama_perusahaan: string;
  alamat: string;
}

export interface MagangFormData {
  siswa_id: number;
  dudi_id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: 'pending' | 'berlangsung' | 'selesai';
  nilai_akhir: number | null;
}

export default function GuruMagangManagement() {
  const [magangList, setMagangList] = useState<Magang[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [dudiList, setDudiList] = useState<Dudi[]>([]);
  const [stats, setStats] = useState<MagangStats>({
    totalSiswa: 0,
    aktif: 0,
    selesai: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);

  // Modal states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMagang, setSelectedMagang] = useState<Magang | null>(null);

  // Form data
  const [formData, setFormData] = useState<MagangFormData>({
    siswa_id: 0,
    dudi_id: 0,
    tanggal_mulai: '',
    tanggal_selesai: '',
    status: 'berlangsung',
    nilai_akhir: null
  });

  useEffect(() => {
    setCurrentPage(1);
    fetchMagangData();
  }, [searchTerm, statusFilter, limit]);

  useEffect(() => {
    fetchMagangData();
  }, [currentPage]);

  useEffect(() => {
    if (showAddDialog || showEditDialog) {
      fetchSiswaList();
      fetchDudiList();
    }
  }, [showAddDialog, showEditDialog]);

  const fetchMagangData = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const offset = (currentPage - 1) * limit;
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await fetch(`/api/guru/magang?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setMagangList(data.data);
        setStats(data.stats);
        setTotalData(data.total || data.stats.totalSiswa);
      } else {
        toast.error(data.message || 'Gagal memuat data magang');
      }
    } catch (error) {
      console.error('Error fetching magang data:', error);
      toast.error('Gagal memuat data magang');
    } finally {
      setLoading(false);
    }
  };

  const fetchSiswaList = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/guru/siswa', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSiswaList(data.data);
      }
    } catch (error) {
      console.error('Error fetching siswa data:', error);
    }
  };

  const fetchDudiList = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/dudi?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setDudiList(data.data.filter((dudi: any) => dudi.status === 'aktif'));
      }
    } catch (error) {
      console.error('Error fetching DUDI data:', error);
    }
  };

  const handleAddMagang = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/guru/magang', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Data magang berhasil ditambahkan');
        setShowAddDialog(false);
        resetFormData();
        fetchMagangData();
      } else {
        toast.error(data.message || 'Gagal menambahkan data magang');
      }
    } catch (error) {
      console.error('Error adding magang:', error);
      toast.error('Gagal menambahkan data magang');
    }
  };

  const handleEditMagang = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMagang) return;
    
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/guru/magang/${selectedMagang.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tanggal_mulai: formData.tanggal_mulai,
          tanggal_selesai: formData.tanggal_selesai,
          status: formData.status,
          nilai_akhir: formData.nilai_akhir
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Data magang berhasil diperbarui');
        setShowEditDialog(false);
        setSelectedMagang(null);
        resetFormData();
        fetchMagangData();
      } else {
        toast.error(data.message || 'Gagal memperbarui data magang');
      }
    } catch (error) {
      console.error('Error updating magang:', error);
      toast.error('Gagal memperbarui data magang');
    }
  };

  const handleDeleteMagang = async () => {
    if (!selectedMagang) return;
    
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/guru/magang/${selectedMagang.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Data magang berhasil dihapus');
        setShowDeleteDialog(false);
        setSelectedMagang(null);
        fetchMagangData();
      } else {
        toast.error(data.message || 'Gagal menghapus data magang');
      }
    } catch (error) {
      console.error('Error deleting magang:', error);
      toast.error('Gagal menghapus data magang');
    }
  };

  const openEditDialog = (magang: Magang) => {
    setSelectedMagang(magang);
    setFormData({
      siswa_id: magang.siswa_id,
      dudi_id: magang.dudi_id,
      tanggal_mulai: magang.tanggal_mulai || '',
      tanggal_selesai: magang.tanggal_selesai || '',
      status: magang.status === 'diterima' ? 'berlangsung' : magang.status as any,
      nilai_akhir: magang.nilai_akhir
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (magang: Magang) => {
    setSelectedMagang(magang);
    setShowDeleteDialog(true);
  };

  const resetFormData = () => {
    setFormData({
      siswa_id: 0,
      dudi_id: 0,
      tanggal_mulai: '',
      tanggal_selesai: '',
      status: 'berlangsung',
      nilai_akhir: null
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      'diterima': { label: 'Aktif', className: 'bg-blue-100 text-blue-800' },
      'berlangsung': { label: 'Aktif', className: 'bg-blue-100 text-blue-800' },
      'selesai': { label: 'Selesai', className: 'bg-green-100 text-green-800' },
      'ditolak': { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
      'dibatalkan': { label: 'Dibatalkan', className: 'bg-gray-100 text-gray-800' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <GuruLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Siswa Magang</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Siswa Magang</h1>
          <p className="text-gray-600">Kelola data siswa yang sedang, sudah, atau akan melaksanakan kegiatan magang</p>
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
              <p className="text-xs text-gray-500">Siswa magang terdaftar</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.aktif}</div>
              <p className="text-xs text-gray-500">Sedang magang</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <Award className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.selesai}</div>
              <p className="text-xs text-gray-500">Magang selesai</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-gray-500">Menunggu persetujuan</p>
            </CardContent>
          </Card>
        </div>

        {/* Magang Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle>Daftar Siswa Magang</CardTitle>
              </div>
              
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-500 hover:bg-cyan-600" onClick={resetFormData}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari siswa, guru, atau DUDI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="berlangsung">Aktif</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                      <SelectItem value="ditolak">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
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
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Siswa
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guru Pembimbing
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DUDI
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Periode
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nilai
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {magangList.length > 0 ? (
                    magangList.map((magang) => (
                      <tr key={magang.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{magang.siswa_nama}</div>
                              <div className="text-sm text-gray-500">NIS: {magang.siswa_nis}</div>
                              <div className="text-xs text-gray-400">{magang.siswa_kelas} • {magang.siswa_jurusan}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            {magang.guru_nama}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-orange-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{magang.nama_perusahaan}</div>
                              <div className="text-xs text-gray-500">{magang.alamat_dudi}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(magang.tanggal_mulai)} 
                            {magang.tanggal_selesai && (
                              <span className="block text-xs text-gray-500">
                                s.d {formatDate(magang.tanggal_selesai)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(magang.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {magang.nilai_akhir ? (
                            <span className="text-sm font-medium text-gray-900">
                              {magang.nilai_akhir}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-400 hover:text-yellow-600"
                              onClick={() => openEditDialog(magang)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-400 hover:text-red-600"
                              onClick={() => openDeleteDialog(magang)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Tidak ada data siswa magang yang ditemukan</p>
                        <p className="text-sm text-gray-400">Silakan tambahkan data siswa magang baru</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {magangList.length > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-sm text-gray-700">
                    Menampilkan {Math.min((currentPage - 1) * limit + 1, totalData)} sampai {Math.min(currentPage * limit, totalData)} dari {totalData} entri
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    {(() => {
                      const totalPages = Math.ceil(totalData / limit);
                      const pages = [];
                      
                      const startPage = Math.max(1, currentPage - 2);
                      const endPage = Math.min(totalPages, startPage + 4);
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <Button
                            key={i}
                            variant={currentPage === i ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(i)}
                            className={`w-8 h-8 p-0 ${currentPage === i ? 'bg-cyan-500 text-white border-cyan-500' : ''}`}
                          >
                            {i}
                          </Button>
                        );
                      }
                      
                      return pages;
                    })()}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalData / limit)))}
                      disabled={currentPage === Math.ceil(totalData / limit)}
                      className="flex items-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Tambah Data Siswa Magang
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Masukkan informasi data magang siswa baru
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddMagang} className="space-y-6">
              {/* Siswa & Pembimbing Section */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 border-b pb-2">Siswa & Pembimbing</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siswa">Siswa <span className="text-red-500">*</span></Label>
                    <Select value={formData.siswa_id.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, siswa_id: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Siswa" />
                      </SelectTrigger>
                      <SelectContent>
                        {siswaList.map((siswa) => (
                          <SelectItem key={siswa.id} value={siswa.id.toString()}>
                            {siswa.nama} - {siswa.nis}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="guru">Guru Pembimbing</Label>
                    <Input value="Anda (Otomatis)" disabled className="bg-gray-100" />
                    <p className="text-xs text-gray-500 mt-1">Guru pembimbing otomatis terisi dengan akun yang sedang login</p>
                  </div>
                </div>
              </div>

              {/* Tempat Magang Section */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 border-b pb-2">Tempat Magang</h3>
                
                <div>
                  <Label htmlFor="dudi">Dunia Usaha/Dunia Industri <span className="text-red-500">*</span></Label>
                  <Select value={formData.dudi_id.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, dudi_id: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih DUDI" />
                    </SelectTrigger>
                    <SelectContent>
                      {dudiList.map((dudi) => (
                        <SelectItem key={dudi.id} value={dudi.id.toString()}>
                          {dudi.nama_perusahaan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Periode & Status Section */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 border-b pb-2">Periode & Status</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="tanggal_mulai">Tanggal Mulai <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      value={formData.tanggal_mulai}
                      onChange={(e) => setFormData(prev => ({ ...prev, tanggal_mulai: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
                    <Input
                      type="date"
                      value={formData.tanggal_selesai}
                      onChange={(e) => setFormData(prev => ({ ...prev, tanggal_selesai: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="berlangsung">Aktif</SelectItem>
                        <SelectItem value="ditolak">Ditolak</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Status default untuk data baru adalah Aktif</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex gap-3 pt-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1 py-2"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600"
                >
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Edit Data Siswa Magang
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Perbarui informasi data magang siswa
              </DialogDescription>
            </DialogHeader>

            {selectedMagang && (
              <form onSubmit={handleEditMagang} className="space-y-6">
                {/* Info Siswa (Read Only) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Informasi Siswa</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Nama:</strong> {selectedMagang.siswa_nama}</p>
                    <p><strong>NIS:</strong> {selectedMagang.siswa_nis}</p>
                    <p><strong>Kelas:</strong> {selectedMagang.siswa_kelas}</p>
                    <p><strong>DUDI:</strong> {selectedMagang.nama_perusahaan}</p>
                  </div>
                </div>

                {/* Periode & Status Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900 border-b pb-2">Periode & Status</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit_tanggal_mulai">Tanggal Mulai</Label>
                      <Input
                        type="date"
                        value={formData.tanggal_mulai}
                        onChange={(e) => setFormData(prev => ({ ...prev, tanggal_mulai: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit_tanggal_selesai">Tanggal Selesai</Label>
                      <Input
                        type="date"
                        value={formData.tanggal_selesai}
                        onChange={(e) => setFormData(prev => ({ ...prev, tanggal_selesai: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit_status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="berlangsung">Aktif</SelectItem>
                          <SelectItem value="selesai">Selesai</SelectItem>
                          <SelectItem value="ditolak">Ditolak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Penilaian Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900 border-b pb-2">Penilaian</h3>
                  
                  <div>
                    <Label htmlFor="nilai_akhir">Nilai Akhir</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Hanya bisa diisi jika status selesai"
                      value={formData.nilai_akhir || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nilai_akhir: e.target.value ? parseFloat(e.target.value) : null }))}
                      disabled={formData.status !== 'selesai'}
                    />
                    <p className="text-xs text-gray-500 mt-1">Nilai hanya dapat diisi setelah status magang selesai</p>
                  </div>
                </div>

                <DialogFooter className="flex gap-3 pt-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowEditDialog(false)}
                    className="flex-1 py-2"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600"
                  >
                    Update
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Konfirmasi Hapus
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Apakah Anda yakin ingin menghapus jurnal ini? Aksi ini tidak bisa dibatalkan.
              </DialogDescription>
            </DialogHeader>

            {selectedMagang && (
              <div className="py-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">Data yang akan dihapus:</h4>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <p><strong>Siswa:</strong> {selectedMagang.siswa_nama}</p>
                    <p><strong>DUDI:</strong> {selectedMagang.nama_perusahaan}</p>
                    <p><strong>Status:</strong> {selectedMagang.status}</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 py-2"
              >
                Batal
              </Button>
              <Button 
                type="button" 
                onClick={handleDeleteMagang}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white"
              >
                Ya, Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </GuruLayout>
  );
}