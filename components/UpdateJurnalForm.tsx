'use client';
import { useState } from 'react';

export default function UpdateJurnalForm({ entry, onClose, onSuccess }: any) {
  const [tanggal, setTanggal] = useState(entry.tanggal?.split('T')[0] || '');
  const [kegiatan, setKegiatan] = useState(entry.kegiatan || '');
  const [kendala, setKendala] = useState(entry.kendala || '');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('id', entry.id);
      fd.append('tanggal', tanggal);
      fd.append('kegiatan', kegiatan);
      fd.append('kendala', kendala);
      if (file) fd.append('file', file);

      const token = localStorage.getItem('auth-token');
      const res = await fetch('/api/siswa/logbook', {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        alert('Gagal simpan: ' + (data.message || 'Unknown'));
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg w-full max-w-lg shadow-lg border border-white/20">
        <h2 className="text-lg font-semibold mb-4">Edit Jurnal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="date" value={tanggal} onChange={e=>setTanggal(e.target.value)} className="w-full border p-2 rounded" required />
          <textarea value={kegiatan} onChange={e=>setKegiatan(e.target.value)} placeholder="Kegiatan" className="w-full border p-2 rounded" required />
          <textarea value={kendala} onChange={e=>setKendala(e.target.value)} placeholder="Kendala" className="w-full border p-2 rounded" />
          <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} className="w-full" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
