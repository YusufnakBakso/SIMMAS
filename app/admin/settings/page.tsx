'use client';

import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { 
  Settings,
  Edit,
  Save,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  User,
  FileText,
  Eye,
  School,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';

interface SchoolSettings {
  id: number;
  logo_url: string | null;
  nama_sekolah: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  kepala_sekolah: string;
  npsn: string;
  created_at: string;
  updated_at: string | null;
}

export default function SchoolSettingsPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    nama_sekolah: '',
    alamat: '',
    telepon: '',
    email: '',
    website: '',
    kepala_sekolah: '',
    npsn: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchSchoolSettings();
  }, []);

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
        setSettings(data.data);
        setFormData({
          nama_sekolah: data.data.nama_sekolah,
          alamat: data.data.alamat,
          telepon: data.data.telepon,
          email: data.data.email,
          website: data.data.website || '',
          kepala_sekolah: data.data.kepala_sekolah,
          npsn: data.data.npsn
        });
      }
    } catch (error) {
      console.error('Error fetching school settings:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data pengaturan sekolah",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/school-settings/upload-logo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        // Update settings with new logo URL
        setSettings(prev => prev ? { ...prev, logo_url: data.logoUrl } : null);
        
        toast({
          title: "Berhasil",
          description: "Logo berhasil diupload"
        });
        
        // Clear the file input and preview
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal mengupload logo",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "Gagal mengupload logo",
        variant: "destructive"
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Format file tidak didukung. Gunakan PNG, JPG, atau SVG",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "Ukuran file terlalu besar. Maksimal 5MB",
        variant: "destructive"
      });
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/school-settings/remove-logo', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSettings(prev => prev ? { ...prev, logo_url: null } : null);
        toast({
          title: "Berhasil",
          description: "Logo berhasil dihapus"
        });
      }
    } catch (error) {
      console.error('Error removing logo:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus logo",
        variant: "destructive"
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.nama_sekolah.trim()) {
      errors.nama_sekolah = 'Nama sekolah harus diisi';
    }

    if (!formData.alamat.trim()) {
      errors.alamat = 'Alamat harus diisi';
    }

    if (!formData.telepon.trim()) {
      errors.telepon = 'Telepon harus diisi';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (!formData.kepala_sekolah.trim()) {
      errors.kepala_sekolah = 'Nama kepala sekolah harus diisi';
    }

    if (!formData.npsn.trim()) {
      errors.npsn = 'NPSN harus diisi';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateSettings = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/school-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        setShowEditDialog(false);
        toast({
          title: "Berhasil",
          description: "Pengaturan sekolah berhasil diperbarui"
        });
        
        // Trigger a page reload to update the AdminLayout with new school name
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal memperbarui pengaturan sekolah",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating school settings:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui pengaturan sekolah",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = () => {
    if (settings) {
      setFormData({
        nama_sekolah: settings.nama_sekolah,
        alamat: settings.alamat,
        telepon: settings.telepon,
        email: settings.email,
        website: settings.website || '',
        kepala_sekolah: settings.kepala_sekolah,
        npsn: settings.npsn
      });
    }
    setFormErrors({});
    setShowEditDialog(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sekolah</h1>
          </div>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sekolah</h1>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500">Tidak ada data pengaturan sekolah</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sekolah</h1>
            <p className="text-gray-600">Konfigurasi informasi sekolah</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - School Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-blue-500" />
                    <CardTitle>Informasi Sekolah</CardTitle>
                  </div>
                  <Button 
                    onClick={openEditDialog}
                    className="bg-cyan-500 hover:bg-cyan-600"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Logo Section with Upload */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      <School className="w-4 h-4 mr-2" />
                      Logo Sekolah
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".png,.jpg,.jpeg,.svg"
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingLogo}
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                      </Button>
                      {settings.logo_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeLogo}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                      ) : settings.logo_url ? (
                        <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      {logoFile ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-900">{logoFile.name}</p>
                          <p className="text-xs text-gray-500">
                            Ukuran: {(logoFile.size / 1024).toFixed(1)} KB
                          </p>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => logoFile && handleLogoUpload(logoFile)}
                              disabled={uploadingLogo}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              {uploadingLogo ? 'Uploading...' : 'Simpan Logo'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setLogoFile(null);
                                setLogoPreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                            >
                              Batal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600">
                            {settings.logo_url ? 'Logo sudah diupload' : 'Belum ada logo'}
                          </p>
                          <p className="text-xs text-gray-400">Format: PNG, JPG, SVG (Max: 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* School Name */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                    <Building className="w-4 h-4 mr-2" />
                    Nama Sekolah/Instansi
                  </Label>
                  <p className="text-gray-900 font-medium">{settings.nama_sekolah}</p>
                </div>

                {/* Address */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                    <MapPin className="w-4 h-4 mr-2" />
                    Alamat Lengkap
                  </Label>
                  <p className="text-gray-900">{settings.alamat}</p>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Telepon
                    </Label>
                    <p className="text-gray-900">{settings.telepon}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Label>
                    <p className="text-gray-900">{settings.email}</p>
                  </div>
                </div>

                {/* Website */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </Label>
                  <p className="text-gray-900">{settings.website || '-'}</p>
                </div>

                {/* Principal */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                    <User className="w-4 h-4 mr-2" />
                    Kepala Sekolah
                  </Label>
                  <p className="text-gray-900">{settings.kepala_sekolah}</p>
                </div>

                {/* NPSN */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                    <FileText className="w-4 h-4 mr-2" />
                    NPSN (Nomor Pokok Sekolah Nasional)
                  </Label>
                  <p className="text-gray-900">{settings.npsn}</p>
                </div>

                {/* Last Updated */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Terakhir diperbarui: {settings.updated_at ? 
                      new Date(settings.updated_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 
                      new Date(settings.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-orange-500" />
                  <CardTitle>Preview Tampilan</CardTitle>
                </div>
                <CardDescription>
                  Pratinjau bagaimana informasi sekolah akan ditampilkan
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Dashboard Header Preview */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <Label className="font-medium">Dashboard Header</Label>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {settings.logo_url ? (
                          <img src={settings.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
                        ) : (
                          <School className="w-6 h-6 text-cyan-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{settings.nama_sekolah}</h3>
                        <p className="text-sm text-gray-500">Sistem Informasi Magang</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Header Rapor/Sertifikat Preview */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <Label className="font-medium">Header Rapor/Sertifikat</Label>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-cyan-100 rounded-full mx-auto flex items-center justify-center overflow-hidden">
                        {settings.logo_url ? (
                          <img src={settings.logo_url} alt="Logo" className="w-12 h-12 object-contain" />
                        ) : (
                          <School className="w-8 h-8 text-cyan-600" />
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">{settings.nama_sekolah}</h3>
                      <p className="text-sm text-gray-600">{settings.alamat}</p>
                      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                        <span>Telp: {settings.telepon}</span>
                        <span>Email: {settings.email}</span>
                      </div>
                      {settings.website && (
                        <p className="text-xs text-gray-500">Web: {settings.website}</p>
                      )}
                      
                      <div className="mt-4 py-2 bg-gray-100 rounded">
                        <p className="font-semibold text-sm text-gray-900">SERTIFIKAT MAGANG</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dokumen Catak Preview */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <Label className="font-medium">Dokumen Catak</Label>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-cyan-100 rounded flex items-center justify-center overflow-hidden">
                        {settings.logo_url ? (
                          <img src={settings.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
                        ) : (
                          <School className="w-6 h-6 text-cyan-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{settings.nama_sekolah}</h4>
                        <p className="text-xs text-gray-600">NPSN: {settings.npsn}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>{settings.alamat}</p>
                      <p>{settings.telepon}</p>
                      <p>{settings.email}</p>
                      <p className="font-medium mt-2">Kepala Sekolah: {settings.kepala_sekolah}</p>
                    </div>
                  </div>
                </div>

                {/* Informasi Penggunaan */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Informasi Penggunaan:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></div>
                      <span><strong>Dashboard:</strong> Logo dan nama sekolah ditampilkan di header navigasi</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 mt-1.5"></div>
                      <span><strong>Rapor/Sertifikat:</strong> Informasi lengkap sebagai kop dokumen resmi</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-1.5"></div>
                      <span><strong>Dokumen Catak:</strong> Footer atau header pada laporan yang dicetak</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="w-5 h-5" />
                <span>Edit Informasi Sekolah</span>
              </DialogTitle>
              <DialogDescription>
                Perbarui informasi sekolah yang akan ditampilkan di sistem
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="nama_sekolah">Nama Sekolah/Instansi <span className="text-red-500">*</span></Label>
                  <Input
                    id="nama_sekolah"
                    placeholder="Masukkan nama sekolah"
                    value={formData.nama_sekolah}
                    onChange={(e) => setFormData(prev => ({ ...prev, nama_sekolah: e.target.value }))}
                    className={formErrors.nama_sekolah ? "border-red-500" : ""}
                  />
                  {formErrors.nama_sekolah && <p className="text-sm text-red-500 mt-1">{formErrors.nama_sekolah}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="alamat">Alamat Lengkap <span className="text-red-500">*</span></Label>
                  <Input
                    id="alamat"
                    placeholder="Masukkan alamat lengkap sekolah"
                    value={formData.alamat}
                    onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
                    className={formErrors.alamat ? "border-red-500" : ""}
                  />
                  {formErrors.alamat && <p className="text-sm text-red-500 mt-1">{formErrors.alamat}</p>}
                </div>
                
                <div>
                  <Label htmlFor="telepon">Telepon <span className="text-red-500">*</span></Label>
                  <Input
                    id="telepon"
                    placeholder="Contoh: 031-1234567"
                    value={formData.telepon}
                    onChange={(e) => setFormData(prev => ({ ...prev, telepon: e.target.value }))}
                    className={formErrors.telepon ? "border-red-500" : ""}
                  />
                  {formErrors.telepon && <p className="text-sm text-red-500 mt-1">{formErrors.telepon}</p>}
                </div>
                
                <div>
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Contoh: info@sekolah.sch.id"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                  {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="Contoh: www.sekolah.sch.id"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="kepala_sekolah">Kepala Sekolah <span className="text-red-500">*</span></Label>
                  <Input
                    id="kepala_sekolah"
                    placeholder="Nama lengkap dengan gelar"
                    value={formData.kepala_sekolah}
                    onChange={(e) => setFormData(prev => ({ ...prev, kepala_sekolah: e.target.value }))}
                    className={formErrors.kepala_sekolah ? "border-red-500" : ""}
                  />
                  {formErrors.kepala_sekolah && <p className="text-sm text-red-500 mt-1">{formErrors.kepala_sekolah}</p>}
                </div>
                
                <div>
                  <Label htmlFor="npsn">NPSN <span className="text-red-500">*</span></Label>
                  <Input
                    id="npsn"
                    placeholder="Nomor Pokok Sekolah Nasional"
                    value={formData.npsn}
                    onChange={(e) => setFormData(prev => ({ ...prev, npsn: e.target.value }))}
                    className={formErrors.npsn ? "border-red-500" : ""}
                  />
                  {formErrors.npsn && <p className="text-sm text-red-500 mt-1">{formErrors.npsn}</p>}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Batal
              </Button>
              <Button
                onClick={handleUpdateSettings}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}