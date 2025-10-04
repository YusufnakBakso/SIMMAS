'use client';

import { useState, useEffect } from 'react';
import { SiswaLayout } from '@/components/SiswaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Building2, 
  Search,
  MapPin,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  AlertCircle
} from 'lucide-react';

interface Dudi {
  id: number;
  nama_perusahaan: string;
  alamat: string;
  telepon: string;
  email: string;
  penanggung_jawab: string;
  status: 'aktif' | 'nonaktif' | 'pending';
  created_at: string;
  bidang_usaha?: string;
  kuota_magang: number;
  slot_tersisa: number;
  sudah_daftar: boolean;
  status_pendaftaran?: 'pending' | 'diterima' | 'ditolak';
}

interface SiswaProfile {
  nama: string;
  total_pendaftaran: number;
  max_pendaftaran: number;
}

export default function SiswaDudiPage() {
  const [dudiList, setDudiList] = useState<Dudi[]>([]);
  const [siswaProfile, setSiswaProfile] = useState<SiswaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [selectedDudi, setSelectedDudi] = useState<Dudi | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
    fetchDudiData();
  }, [searchTerm, limit]);

  useEffect(() => {
    fetchDudiData();
  }, [currentPage]);

  useEffect(() => {
    fetchSiswaProfile();
  }, []);

  const fetchDudiData = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const offset = (currentPage - 1) * limit;
      const params = new URLSearchParams({
        search: searchTerm,
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await fetch(`/api/siswa/dudi?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setDudiList(data.data);
        setTotalData(data.total || data.data.length);
      }
    } catch (error) {
      console.error('Error fetching DUDI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiswaProfile = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/siswa/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSiswaProfile(data.data);
      }
    } catch (error) {
      console.error('Error fetching siswa profile:', error);
    }
  };

  const handleDaftarMagang = async (dudiId: number) => {
    if (!siswaProfile) return;
    
    if (siswaProfile.total_pendaftaran >= siswaProfile.max_pendaftaran) {
      toast.error(`Anda sudah mencapai batas maksimal ${siswaProfile.max_pendaftaran} pendaftaran magang`);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/siswa/magang/daftar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ dudi_id: dudiId })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Pendaftaran magang berhasil diajukan, menunggu verifikasi dari pihak guru');
        setShowDetailDialog(false);
        fetchDudiData();
        fetchSiswaProfile();
      } else {
        toast.error(data.message || 'Gagal mendaftar magang');
      }
    } catch (error) {
      console.error('Error daftar magang:', error);
      toast.error('Gagal mendaftar magang');
    } finally {
      setSubmitting(false);
    }
  };

  const openDetailDialog = (dudi: Dudi) => {
    setSelectedDudi(dudi);
    setShowDetailDialog(true);
  };

  const getStatusPendaftaranBadge = (status?: string) => {
    const statusMap = {
      'pending': { label: 'Menunggu Verifikasi', className: 'bg-yellow-100 text-yellow-800' },
      'diterima': { label: 'Diterima', className: 'bg-green-100 text-green-800' },
      'ditolak': { label: 'Ditolak', className: 'bg-red-100 text-red-800' }
    };
    
    if (!status) return null;
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <SiswaLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cari Tempat Magang</h1>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cari Tempat Magang</h1>
            <p className="text-gray-600">Pilih tempat magang yang sesuai dengan minat Anda</p>
          </div>
        </div>

        {/* Info Pendaftaran */}
        {siswaProfile && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Status Pendaftaran: {siswaProfile.total_pendaftaran}/{siswaProfile.max_pendaftaran} pendaftaran
                  </p>
                  <p className="text-xs text-blue-700">
                    Anda dapat mendaftar maksimal {siswaProfile.max_pendaftaran} tempat magang
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari perusahaan, bidang usaha..."
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
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500">per halaman</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* DUDI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dudiList.length > 0 ? (
            dudiList.map((dudi) => (
              <Card key={dudi.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-cyan-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{dudi.nama_perusahaan}</CardTitle>
                        <p className="text-sm text-gray-500">{dudi.bidang_usaha || 'Teknologi Informasi'}</p>
                      </div>
                    </div>
                    {dudi.sudah_daftar && getStatusPendaftaranBadge(dudi.status_pendaftaran)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{dudi.alamat}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span>PIC: {dudi.penanggung_jawab}</span>
                    </div>
                  </div>

                  {/* Kuota Magang */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Kuota Magang</span>
                      <span className="text-sm font-bold text-cyan-600">{dudi.slot_tersisa}/{dudi.kuota_magang}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-cyan-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${((dudi.kuota_magang - dudi.slot_tersisa) / dudi.kuota_magang) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{dudi.slot_tersisa} slot tersisa</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openDetailDialog(dudi)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </Button>
                    {!dudi.sudah_daftar && dudi.slot_tersisa > 0 && (
                      <Button 
                        size="sm" 
                        onClick={() => handleDaftarMagang(dudi.id)}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                        disabled={(siswaProfile?.total_pendaftaran ?? 0) >= (siswaProfile?.max_pendaftaran ?? 3)}
                      >
                        Daftar
                      </Button>
                    )}
                    {dudi.sudah_daftar && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="flex-1"
                        disabled
                      >
                        {dudi.status_pendaftaran === 'pending' ? 'Sudah Mendaftar' : 
                         dudi.status_pendaftaran === 'diterima' ? 'Diterima' : 'Ditolak'}
                      </Button>
                    )}
                    {dudi.slot_tersisa === 0 && !dudi.sudah_daftar && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="flex-1"
                        disabled
                      >
                        Kuota Penuh
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Data tidak tersedia</p>
              <p className="text-sm text-gray-400">Belum ada DUDI yang tersedia saat ini</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {dudiList.length > 0 && (
          <div className="flex items-center justify-center space-x-2">
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
        )}

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-cyan-600" />
                <span>{selectedDudi?.nama_perusahaan}</span>
              </DialogTitle>
              <DialogDescription className="text-cyan-600">
                {selectedDudi?.bidang_usaha || 'Digital Marketing'}
              </DialogDescription>
              {selectedDudi?.sudah_daftar && (
                <div className="flex justify-end">
                  {getStatusPendaftaranBadge(selectedDudi.status_pendaftaran)}
                </div>
              )}
            </DialogHeader>
            
            {selectedDudi && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Tentang Perusahaan</h4>
                  <p className="text-sm text-gray-600">
                    Konsultan digital marketing yang membantu UMKM berkembang di era digital. 
                    Menyediakan program magang untuk jurusan multimedia dan pemasaran.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Informasi Kontak</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-gray-600">{selectedDudi.alamat}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-gray-600">{selectedDudi.telepon}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-gray-600">{selectedDudi.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-gray-600">Penanggung jawab: {selectedDudi.penanggung_jawab}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Informasi Magang</h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bidang Usaha</span>
                      <span className="text-sm font-medium">{selectedDudi.bidang_usaha || 'Digital Marketing'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Kuota Magang</span>
                      <span className="text-sm font-medium text-cyan-600">
                        {selectedDudi.slot_tersisa}/{selectedDudi.kuota_magang}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Slot Tersisa</span>
                      <span className="text-sm font-medium">{selectedDudi.slot_tersisa} slot</span>
                    </div>
                  </div>
                </div>

                {!selectedDudi.sudah_daftar && selectedDudi.slot_tersisa > 0 && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                      Tutup
                    </Button>
                    <Button 
                      onClick={() => handleDaftarMagang(selectedDudi.id)}
                      className="bg-cyan-500 hover:bg-cyan-600"
                      disabled={submitting || ((siswaProfile?.total_pendaftaran ?? 0) >= (siswaProfile?.max_pendaftaran ?? 3))}                    >
                      {submitting ? 'Mendaftar...' : 'Daftar Magang'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SiswaLayout>
  );
}