// components/AdminLayout.tsx - Updated version with logo support

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  School
} from 'lucide-react';
import Image from 'next/image';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface SchoolSettings {
  nama_sekolah: string;
  alamat: string;
  telepon: string;
  email: string;
  logo_url: string | null;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      setCurrentDate(now.toLocaleDateString('id-ID', options));
    };

    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch school settings
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

    if (user?.role === 'admin') {
      fetchSchoolSettings();
    }
  }, [user]);

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      description: 'Ringkasan sistem'
    },
    {
      name: 'DUDI',
      href: '/admin/dudi',
      icon: Building2,
      description: 'Manajemen DUDI'
    },
    {
      name: 'Pengguna',
      href: '/admin/users',
      icon: Users,
      description: 'Manajemen user'
    },
    {
      name: 'Pengaturan',
      href: '/admin/settings',
      icon: Settings,
      description: 'Konfigurasi sistem'
    }
  ];

  if (!user || user.role !== 'admin') {
    return null;
  }

  const schoolName = schoolSettings?.nama_sekolah || 'Nama Sekolah Belum Diatur';
  const schoolShortName = schoolName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center overflow-hidden">
              {schoolSettings?.logo_url ? (
                <Image
                  src={schoolSettings.logo_url}
                  alt="School Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-white font-bold text-sm">{schoolShortName}</span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">SIMMAS</h1>
              <p className="text-xs text-gray-500">Panel Admin</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-3 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className={`text-xs ${isActive ? 'text-cyan-100' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700 truncate">{schoolName}</span>
            </div>
            <p className="text-xs text-green-600 mt-1">Sistem Pelaporan v1.0</p>
          </div>
        </div>
        
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {schoolSettings?.logo_url ? (
                    <Image
                      src={schoolSettings.logo_url}
                      alt="School Logo"
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <School className="w-6 h-6 text-cyan-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{schoolName}</h2>
                  <p className="text-sm text-gray-500">Sistem Manajemen Magang Siswa</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-gray-600">{currentDate}</p>
                <p className="text-xs text-gray-500">Selamat datang, {user.name}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">A</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="ml-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}