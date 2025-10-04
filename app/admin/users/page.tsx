///app/admin/users/page/tsx
'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
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
import { useToast } from '@/hooks/use-toast';
import { 
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  GraduationCap,
  BookOpen,
  MapPin,
  Phone,
  User
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'siswa' | 'guru' | 'dudi';
  email_verified_at: string | null;
  created_at: string;
}

interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalGurus: number;
  totalSiswa: number;
  totalDudis: number;
}

interface UserFormData {
  name: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
  email_verified: boolean;
  // Additional fields for siswa
  nis: string;
  kelas: string;
  jurusan: string;
  siswa_alamat: string;
  siswa_telepon: string;
  // Additional fields for guru
  nip: string;
  guru_alamat: string;
  guru_telepon: string;
}

interface UserDetailData {
  user: User;
  siswa?: {
    nis: string;
    kelas: string;
    jurusan: string;
    alamat: string;
    telepon: string;
  };
  guru?: {
    nip: string;
    alamat: string;
    telepon: string;
  };
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalGurus: 0,
    totalSiswa: 0,
    totalDudis: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalData, setTotalData] = useState(0);
  const { toast } = useToast();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  // Form data
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'siswa',
    password: '',
    confirmPassword: '',
    email_verified: false,
    // Siswa fields
    nis: '',
    kelas: '',
    jurusan: '',
    siswa_alamat: '',
    siswa_telepon: '',
    // Guru fields
    nip: '',
    guru_alamat: '',
    guru_telepon: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrentPage(1);
    fetchUsers();
  }, [searchTerm, roleFilter, limit]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const offset = (currentPage - 1) * limit;
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter && roleFilter !== 'all') params.append('role', roleFilter);

      const response = await fetch(`/api/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setTotalData(data.data.length);
        
        const statsData = {
          totalUsers: data.data.length,
          totalAdmins: data.data.filter((u: User) => u.role === 'admin').length,
          totalGurus: data.data.filter((u: User) => u.role === 'guru').length,
          totalSiswa: data.data.filter((u: User) => u.role === 'siswa').length,
          totalDudis: data.data.filter((u: User) => u.role === 'dudi').length,
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data pengguna",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId: number): Promise<UserDetailData | null> => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/users/${userId}/detail`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user detail:', error);
      return null;
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'siswa',
      password: '',
      confirmPassword: '',
      email_verified: false,
      nis: '',
      kelas: '',
      jurusan: '',
      siswa_alamat: '',
      siswa_telepon: '',
      nip: '',
      guru_alamat: '',
      guru_telepon: ''
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const validateForm = (isEdit = false) => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nama lengkap harus diisi';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (!formData.role || formData.role === '') {
      errors.role = 'Role harus dipilih';
    }

    if (!isEdit) {
      if (!formData.password) {
        errors.password = 'Password harus diisi';
      } else if (formData.password.length < 6) {
        errors.password = 'Password minimal 6 karakter';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Konfirmasi password harus diisi';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Konfirmasi password tidak cocok';
      }
    }

    // Validate additional fields based on role
    if (formData.role === 'siswa') {
      if (!formData.nis.trim()) {
        errors.nis = 'NIS harus diisi';
      }
      if (!formData.kelas.trim()) {
        errors.kelas = 'Kelas harus diisi';
      }
      if (!formData.jurusan.trim()) {
        errors.jurusan = 'Jurusan harus diisi';
      }
      if (!formData.siswa_alamat.trim()) {
        errors.siswa_alamat = 'Alamat harus diisi';
      }
      if (!formData.siswa_telepon.trim()) {
        errors.siswa_telepon = 'Telepon harus diisi';
      }
    }

    if (formData.role === 'guru') {
      if (!formData.nip.trim()) {
        errors.nip = 'NIP harus diisi';
      }
      if (!formData.guru_alamat.trim()) {
        errors.guru_alamat = 'Alamat harus diisi';
      }
      if (!formData.guru_telepon.trim()) {
        errors.guru_telepon = 'Telepon harus diisi';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Berhasil",
          description: "User berhasil ditambahkan"
        });
        setShowAddModal(false);
        resetForm();
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal menambahkan user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan user",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = async () => {
    if (!validateForm(true) || !selectedUser) return;

    try {
      const token = localStorage.getItem('auth-token');
      
      // Prepare the request body with all necessary data
      const requestBody: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        email_verified: formData.email_verified
      };

      // Add role-specific data
      if (formData.role === 'siswa') {
        requestBody.siswa = {
          nis: formData.nis,
          kelas: formData.kelas,
          jurusan: formData.jurusan,
          alamat: formData.siswa_alamat,
          telepon: formData.siswa_telepon
        };
      } else if (formData.role === 'guru') {
        requestBody.guru = {
          nip: formData.nip,
          alamat: formData.guru_alamat,
          telepon: formData.guru_telepon
        };
      }

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Berhasil",
          description: "User berhasil diperbarui"
        });
        setShowEditModal(false);
        resetForm();
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal memperbarui user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui user",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Berhasil",
          description: "User berhasil dihapus"
        });
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal menghapus user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus user",
        variant: "destructive"
      });
    }
  };

  const openEditModal = async (user: User) => {
    setSelectedUser(user);
    setLoadingUserDetail(true);
    
    // Fetch detailed user data
    const userDetail = await fetchUserDetail(user.id);
    
    if (userDetail) {
      setFormData({
        name: userDetail.user.name,
        email: userDetail.user.email,
        role: userDetail.user.role,
        password: '',
        confirmPassword: '',
        email_verified: !!userDetail.user.email_verified_at,
        // Siswa fields
        nis: userDetail.siswa?.nis || '',
        kelas: userDetail.siswa?.kelas || '',
        jurusan: userDetail.siswa?.jurusan || '',
        siswa_alamat: userDetail.siswa?.alamat || '',
        siswa_telepon: userDetail.siswa?.telepon || '',
        // Guru fields
        nip: userDetail.guru?.nip || '',
        guru_alamat: userDetail.guru?.alamat || '',
        guru_telepon: userDetail.guru?.telepon || ''
      });
    } else {
      // Fallback to basic user data
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
        confirmPassword: '',
        email_verified: !!user.email_verified_at,
        nis: '',
        kelas: '',
        jurusan: '',
        siswa_alamat: '',
        siswa_telepon: '',
        nip: '',
        guru_alamat: '',
        guru_telepon: ''
      });
    }
    
    setLoadingUserDetail(false);
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const getRoleBadge = (role: string) => {
    const roleMap = {
      'admin': { label: 'Admin', className: 'bg-red-100 text-red-800' },
      'guru': { label: 'Guru', className: 'bg-blue-100 text-blue-800' },
      'siswa': { label: 'Siswa', className: 'bg-green-100 text-green-800' },
      'dudi': { label: 'DUDI', className: 'bg-orange-100 text-orange-800' }
    };
    
    const roleInfo = roleMap[role as keyof typeof roleMap] || { label: role, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.className}`}>
        {roleInfo.label}
      </span>
    );
  };

  const getVerificationBadge = (verified: boolean) => {
    return verified ? (
      <div className="flex items-center space-x-1">
        <Check className="w-3 h-3 text-green-600" />
        <span className="text-xs text-green-600 font-medium">Verified</span>
      </div>
    ) : (
      <div className="flex items-center space-x-1">
        <X className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-400">Unverified</span>
      </div>
    );
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
  };

  const getAvatarColor = (role: string) => {
    const colors = {
      'admin': 'bg-red-500',
      'guru': 'bg-blue-500', 
      'siswa': 'bg-green-500',
      'dudi': 'bg-orange-500'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500';
  };

  // Handle role change to clear conditional fields
  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value,
      // Clear siswa fields when role changes
      nis: '',
      kelas: '',
      jurusan: '',
      siswa_alamat: '',
      siswa_telepon: '',
      // Clear guru fields when role changes
      nip: '',
      guru_alamat: '',
      guru_telepon: ''
    }));
    // Clear errors when role changes
    setFormErrors({});
  };

  // Handle role change for edit modal (preserve existing data when role doesn't change)
  const handleEditRoleChange = (value: string) => {
    if (value !== formData.role) {
      setFormData(prev => ({
        ...prev,
        role: value,
        // Clear siswa fields when role changes
        nis: '',
        kelas: '',
        jurusan: '',
        siswa_alamat: '',
        siswa_telepon: '',
        // Clear guru fields when role changes
        nip: '',
        guru_alamat: '',
        guru_telepon: ''
      }));
      // Clear errors when role changes
      setFormErrors({});
    }
  };

  const renderAdditionalFields = (isEditMode = false) => {
    if (formData.role === 'siswa') {
      return (
        <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-3">
            <GraduationCap className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-800">Data Siswa</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nis">NIS <span className="text-red-500">*</span></Label>
              <Input
                id="nis"
                placeholder="Nomor Induk Siswa"
                value={formData.nis}
                onChange={(e) => setFormData(prev => ({ ...prev, nis: e.target.value }))}
                className={formErrors.nis ? "border-red-500" : ""}
              />
              {formErrors.nis && <p className="text-sm text-red-500 mt-1">{formErrors.nis}</p>}
            </div>
            
            <div>
              <Label htmlFor="kelas">Kelas <span className="text-red-500">*</span></Label>
              <Input
                id="kelas"
                placeholder="Contoh: XII RPL 1"
                value={formData.kelas}
                onChange={(e) => setFormData(prev => ({ ...prev, kelas: e.target.value }))}
                className={formErrors.kelas ? "border-red-500" : ""}
              />
              {formErrors.kelas && <p className="text-sm text-red-500 mt-1">{formErrors.kelas}</p>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="jurusan">Jurusan <span className="text-red-500">*</span></Label>
            <Select value={formData.jurusan} onValueChange={(value) => setFormData(prev => ({ ...prev, jurusan: value }))}>
              <SelectTrigger className={formErrors.jurusan ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih jurusan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak (RPL)</SelectItem>
                <SelectItem value="Desain Permodelan dan Informasi Bangunan">Desain Permodelan dan Informasi Bangunan (DPIB)</SelectItem>
                <SelectItem value="Teknik Pemesinan">Teknik Pemesinan (TPM)</SelectItem>
                <SelectItem value="Teknik Kontruksi dan Perumahan">Teknik Kontruksi dan Perumahan (TKP)</SelectItem>
                <SelectItem value="Teknik Sepeda Motor">Teknik Sepeda Motor (TSM)</SelectItem>
                <SelectItem value="Teknik Pengelasan">Teknik Pengelasan (TLAS)</SelectItem>
                <SelectItem value="Teknik Elektronika Industri">Teknik Elektronika Industri(TEI)</SelectItem>
                <SelectItem value="Teknik Otomasi Industri">Teknik Otomasi Industri (TOI)</SelectItem>
                <SelectItem value="Teknik Pemanasan, Tata Udara dan Tata Pendinginan">Teknik Pemanasan, Tata Udara dan Tata Pendinginan (TPTUP)</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.jurusan && <p className="text-sm text-red-500 mt-1">{formErrors.jurusan}</p>}
          </div>
          
          <div>
            <Label htmlFor="siswa_alamat">Alamat <span className="text-red-500">*</span></Label>
            <Input
              id="siswa_alamat"
              placeholder="Alamat lengkap siswa"
              value={formData.siswa_alamat}
              onChange={(e) => setFormData(prev => ({ ...prev, siswa_alamat: e.target.value }))}
              className={formErrors.siswa_alamat ? "border-red-500" : ""}
            />
            {formErrors.siswa_alamat && <p className="text-sm text-red-500 mt-1">{formErrors.siswa_alamat}</p>}
          </div>
          
          <div>
            <Label htmlFor="siswa_telepon">Telepon <span className="text-red-500">*</span></Label>
            <Input
              id="siswa_telepon"
              placeholder="Nomor telepon siswa"
              value={formData.siswa_telepon}
              onChange={(e) => setFormData(prev => ({ ...prev, siswa_telepon: e.target.value }))}
              className={formErrors.siswa_telepon ? "border-red-500" : ""}
            />
            {formErrors.siswa_telepon && <p className="text-sm text-red-500 mt-1">{formErrors.siswa_telepon}</p>}
          </div>
        </div>
      );
    }

    if (formData.role === 'guru') {
      return (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-blue-800">Data Guru</h4>
          </div>
          
          <div>
            <Label htmlFor="nip">NIP <span className="text-red-500">*</span></Label>
            <Input
              id="nip"
              placeholder="Nomor Induk Pegawai"
              value={formData.nip}
              onChange={(e) => setFormData(prev => ({ ...prev, nip: e.target.value }))}
              className={formErrors.nip ? "border-red-500" : ""}
            />
            {formErrors.nip && <p className="text-sm text-red-500 mt-1">{formErrors.nip}</p>}
          </div>
          
          <div>
            <Label htmlFor="guru_alamat">Alamat <span className="text-red-500">*</span></Label>
            <Input
              id="guru_alamat"
              placeholder="Alamat lengkap guru"
              value={formData.guru_alamat}
              onChange={(e) => setFormData(prev => ({ ...prev, guru_alamat: e.target.value }))}
              className={formErrors.guru_alamat ? "border-red-500" : ""}
            />
            {formErrors.guru_alamat && <p className="text-sm text-red-500 mt-1">{formErrors.guru_alamat}</p>}
          </div>
          
          <div>
            <Label htmlFor="guru_telepon">Telepon <span className="text-red-500">*</span></Label>
            <Input
              id="guru_telepon"
              placeholder="Nomor telepon guru"
              value={formData.guru_telepon}
              onChange={(e) => setFormData(prev => ({ ...prev, guru_telepon: e.target.value }))}
              className={formErrors.guru_telepon ? "border-red-500" : ""}
            />
            {formErrors.guru_telepon && <p className="text-sm text-red-500 mt-1">{formErrors.guru_telepon}</p>}
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          </div>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
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
            <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
            <p className="text-gray-600">Kelola pengguna sistem</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <CardTitle>Daftar User</CardTitle>
              </div>
              
              <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      resetForm();
                      setShowAddModal(true);
                    }}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah User
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Semua Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Role</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="guru">Guru</SelectItem>
                      <SelectItem value="siswa">Siswa</SelectItem>
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
                      User
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email & Verifikasi
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Terdaftar
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(user.role)}`}>
                              {getUserInitials(user.name)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">ID {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          {getVerificationBadge(!!user.email_verified_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditModal(user)}
                              className="text-gray-400 hover:text-yellow-600"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openDeleteModal(user)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Tidak ada data user yang ditemukan</p>
                        <p className="text-sm text-gray-400">Silakan tambahkan user baru atau ubah filter pencarian</p>
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
                  Menampilkan 1 sampai 5 dari {users.length} entri
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
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-cyan-500 text-white hover:bg-cyan-600 border-cyan-500"
                  >
                    1
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={users.length < limit}
                    className="flex items-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add User Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
              <DialogDescription>
                Lengkapi semua informasi yang diperlukan
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
              </div>
              
              <div>
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Contoh: user@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
              </div>
              
              <div>
                <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className={formErrors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="siswa">Siswa</SelectItem>
                    <SelectItem value="guru">Guru</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.role && <p className="text-sm text-red-500 mt-1">{formErrors.role}</p>}
              </div>

              {/* Conditional Additional Fields */}
              {renderAdditionalFields()}
              
              <div>
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password (min. 6 karakter)"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={formErrors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {formErrors.password && <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>}
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Konfirmasi Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={formErrors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {formErrors.confirmPassword && <p className="text-sm text-red-500 mt-1">{formErrors.confirmPassword}</p>}
              </div>
              
              <div>
                <Label htmlFor="emailVerification">Email Verification</Label>
                <Select 
                  value={formData.email_verified ? "verified" : "unverified"} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, email_verified: value === "verified" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button
                onClick={handleAddUser}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Perbarui informasi user. Semua field yang diisi akan diupdate.
              </DialogDescription>
            </DialogHeader>
            
            {loadingUserDetail ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                <span className="ml-2 text-gray-500">Memuat data user...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editName">Nama Lengkap <span className="text-red-500">*</span></Label>
                  <Input
                    id="editName"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
                </div>
                
                <div>
                  <Label htmlFor="editEmail">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="editEmail"
                    type="email"
                    placeholder="Contoh: user@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                  {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
                </div>
                
                <div>
                  <Label htmlFor="editRole">Role <span className="text-red-500">*</span></Label>
                  <Select value={formData.role} onValueChange={handleEditRoleChange}>
                    <SelectTrigger className={formErrors.role ? "border-red-500" : ""}>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="siswa">Siswa</SelectItem>
                      <SelectItem value="guru">Guru</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="dudi">DUDI</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.role && <p className="text-sm text-red-500 mt-1">{formErrors.role}</p>}
                </div>

                {/* Conditional Additional Fields for Edit */}
                {renderAdditionalFields(true)}
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 text-blue-600 mt-0.5">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Informasi Penting</h4>
                      <p className="text-sm text-blue-700">
                        <strong>Password:</strong> Untuk mengubah password, silakan gunakan fitur reset password yang terpisah.
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        <strong>Role:</strong> Mengubah role akan mengosongkan data spesifik role sebelumnya.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="editEmailVerification">Email Verification</Label>
                  <Select 
                    value={formData.email_verified ? "verified" : "unverified"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, email_verified: value === "verified" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                  setSelectedUser(null);
                }}
              >
                Batal
              </Button>
              <Button
                onClick={handleEditUser}
                disabled={loadingUserDetail}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Perbarui
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus data user ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
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

