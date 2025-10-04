'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Plus, 
  Search,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export interface DudiStats {
  totalDudi: number;
  dudiAktif: number;
  dudiTidakAktif: number;
  totalSiswaMagang: number;
}

export interface Dudi {
  id: number;
  nama_perusahaan: string;
  alamat: string;
  telepon: string;
  email: string;
  penanggung_jawab: string;
  status: 'aktif' | 'nonaktif' | 'pending'; // Fixed: Added 'pending' status
  created_at: string;
  siswa_magang_count: number;
}

export default function DudiManagement() {
  const [dudiList, setDudiList] = useState<Dudi[]>([]);
  const [stats, setStats] = useState<DudiStats>({
    totalDudi: 0,
    dudiAktif: 0,
    dudiTidakAktif: 0,
    totalSiswaMagang: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDudi, setSelectedDudi] = useState<Dudi | null>(null);
  const [formData, setFormData] = useState({
    nama_perusahaan: '',
    alamat: '',
    telepon: '',
    email: '',
    penanggung_jawab: '',
    status: 'aktif' as 'aktif' | 'nonaktif' | 'pending' // Fixed: Added 'pending' status
  });

  useEffect(() => {
    setCurrentPage(1); // Reset ke halaman 1 ketika filter berubah
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

      const response = await fetch(`/api/dudi?${params}`, {
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
      toast.error('Gagal memuat data DUDI');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDudi = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/dudi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setShowAddDialog(false);
        setFormData({
          nama_perusahaan: '',
          alamat: '',
          telepon: '',
          email: '',
          penanggung_jawab: '',
          status: 'aktif'
        });
        fetchDudiData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error adding DUDI:', error);
      toast.error('Gagal menambahkan DUDI');
    }
  };

  const handleEditDudi = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDudi) return;
    
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/dudi/${selectedDudi.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('DUDI berhasil diperbarui');
        setShowEditDialog(false);
        setSelectedDudi(null);
        setFormData({
          nama_perusahaan: '',
          alamat: '',
          telepon: '',
          email: '',
          penanggung_jawab: '',
          status: 'aktif'
        });
        fetchDudiData();
      } else {
        toast.error(data.message || 'Gagal memperbarui DUDI');
      }
    } catch (error) {
      console.error('Error updating DUDI:', error);
      toast.error('Gagal memperbarui DUDI');
    }
  };

  const handleDeleteDudi = async () => {
    if (!selectedDudi) return;
    
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/dudi/${selectedDudi.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('DUDI berhasil dihapus');
        setShowDeleteDialog(false);
        setSelectedDudi(null);
        fetchDudiData();
      } else {
        toast.error(data.message || 'Gagal menghapus DUDI');
      }
    } catch (error) {
      console.error('Error deleting DUDI:', error);
      toast.error('Gagal menghapus DUDI');
    }
  };

  const openEditDialog = (dudi: Dudi) => {
    setSelectedDudi(dudi);
    setFormData({
      nama_perusahaan: dudi.nama_perusahaan,
      alamat: dudi.alamat,
      telepon: dudi.telepon,
      email: dudi.email,
      penanggung_jawab: dudi.penanggung_jawab,
      status: dudi.status
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (dudi: Dudi) => {
    setSelectedDudi(dudi);
    setShowDeleteDialog(true);
  };

  const resetFormData = () => {
    setFormData({
      nama_perusahaan: '',
      alamat: '',
      telepon: '',
      email: '',
      penanggung_jawab: '',
      status: 'aktif'
    });
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

  const getSiswaMagangBadge = (count: number) => {
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
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen DUDI</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen DUDI</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total DUDI</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalDudi}</div>
              <p className="text-xs text-gray-500">Perusahaan mitra</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DUDI Aktif</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.dudiAktif}</div>
              <p className="text-xs text-gray-500">Perusahaan aktif</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DUDI Tidak Aktif</CardTitle>
              <Building2 className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.dudiTidakAktif}</div>
              <p className="text-xs text-gray-500">Perusahaan tidak aktif</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Siswa Magang</CardTitle>
              <User className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.totalSiswaMagang}</div>
              <p className="text-xs text-gray-500">Siswa magang aktif</p>
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
              
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-500 hover:bg-cyan-600" onClick={resetFormData}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah DUDI
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-3">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      Tambah DUDI Baru
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                      Lengkapi semua informasi yang diperlukan
                    </DialogDescription>
                  </DialogHeader>

                  <div className="px-1 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Perusahaan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan nama perusahaan"
                        value={formData.nama_perusahaan}
                        onChange={(e) => setFormData(prev => ({ ...prev, nama_perusahaan: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm placeholder-gray-400 bg-gray-50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan alamat lengkap"
                        value={formData.alamat}
                        onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm placeholder-gray-400 bg-gray-50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telepon <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="Contoh: 08123456789"
                          value={formData.telepon}
                          onChange={(e) => setFormData(prev => ({ ...prev, telepon: e.target.value }))}
                          className="w-full px-3 py-2 pr-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm placeholder-gray-400 bg-gray-50"
                          required
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-300 px-1.5 py-0.5 rounded text-xs text-gray-600 font-mono">
                          +62
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Contoh: info@perusahaan.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm placeholder-gray-400 bg-gray-50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Penanggung Jawab <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nama penanggung jawab"
                        value={formData.penanggung_jawab}
                        onChange={(e) => setFormData(prev => ({ ...prev, penanggung_jawab: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm placeholder-gray-400 bg-gray-50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'aktif' | 'nonaktif' | 'pending' }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm bg-gray-50 cursor-pointer"
                        required
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Tidak Aktif</option>
                      </select>
                    </div>
                  </div>

                  <DialogFooter className="flex gap-3 pt-3 mt-4">
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
                      onClick={handleAddDudi}
                      className="flex-1 py-2 bg-blue-500 hover:bg-blue-600"
                    >
                      Simpan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                      Siswa Magang
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dudiList.length > 0 ? (
                    dudiList.map((dudi, index) => (
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
                          {getSiswaMagangBadge(dudi.siswa_magang_count)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-400 hover:text-yellow-600"
                              onClick={() => openEditDialog(dudi)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-400 hover:text-red-600"
                              onClick={() => openDeleteDialog(dudi)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Tidak ada data DUDI yang ditemukan</p>
                        <p className="text-sm text-gray-400">Silakan tambahkan DUDI baru atau ubah filter pencarian</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
                    
                    // Logika untuk menampilkan halaman
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
                    
                    // Tambahkan ... jika ada lebih banyak halaman
                    if (endPage < totalPages) {
                      pages.push(
                        <span key="dots" className="px-2 text-gray-500">...</span>
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
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Edit DUDI
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Perbarui informasi DUDI yang diperlukan
              </DialogDescription>
            </DialogHeader>

            <div className="px-1 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Perusahaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama perusahaan"
                  value={formData.nama_perusahaan}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama_perusahaan: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm placeholder-gray-400 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan alamat lengkap"
                  value={formData.alamat}
                  onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm placeholder-gray-400 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telepon <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={formData.telepon}
                    onChange={(e) => setFormData(prev => ({ ...prev, telepon: e.target.value }))}
                    className="w-full px-3 py-2 pr-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm placeholder-gray-400 bg-gray-50"
                    required
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-300 px-1.5 py-0.5 rounded text-xs text-gray-600 font-mono">
                    +62
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Contoh: info@perusahaan.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm placeholder-gray-400 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Penanggung Jawab <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama penanggung jawab"
                  value={formData.penanggung_jawab}
                  onChange={(e) => setFormData(prev => ({ ...prev, penanggung_jawab: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm placeholder-gray-400 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'aktif' | 'nonaktif' | 'pending' }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm bg-gray-50 cursor-pointer"
                  required
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Tidak Aktif</option>
                </select>
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-3 mt-4">
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
                onClick={handleEditDudi}
                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600"
              >
                Perbarui
              </Button>
            </DialogFooter>
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
                Apakah Anda yakin ingin menghapus data DUDI ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {selectedDudi && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">{selectedDudi.nama_perusahaan}</h4>
                  <p className="text-sm text-gray-500">{selectedDudi.alamat}</p>
                  <p className="text-sm text-gray-500">Penanggung Jawab: {selectedDudi.penanggung_jawab}</p>
                </div>
              )}
            </div>

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
                onClick={handleDeleteDudi}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white"
              >
                Ya, Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}