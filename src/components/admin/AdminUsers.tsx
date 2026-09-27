import React, { useState } from 'react';
import { User, Company, Role } from '../../types';
import { Plus, UserCheck, ShieldCheck, Building2, X, Mail, Edit2, Trash2 } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

interface AdminUsersProps {
  users: User[];
  companies: Company[];
  onUserChange: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, companies, onUserChange }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('client');
  const [companyId, setCompanyId] = useState(companies[0]?.id || '');
  const [title, setTitle] = useState('');

  const handleOpenAdd = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('client');
    setCompanyId(companies[0]?.id || '');
    setTitle('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password || '');
    setRole(user.role);
    setCompanyId(user.companyId || companies[0]?.id || '');
    setTitle(user.title || '');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    StorageService.addUser({
      name: name.trim(),
      email: email.trim(),
      password: password.trim() || 'password123',
      role,
      companyId: role === 'client' ? companyId : null,
      title: title.trim() || (role === 'client' ? 'Client Representative' : 'Talent Partner'),
    });

    setShowAddModal(false);
    onUserChange();
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !name.trim() || !email.trim()) return;

    StorageService.updateUser(editingUser.uid, {
      name: name.trim(),
      email: email.trim(),
      role,
      companyId: role === 'client' ? companyId : null,
      title: title.trim(),
      password: password.trim() || editingUser.password || 'password123',
    });

    setEditingUser(null);
    onUserChange();
  };

  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return;
    StorageService.deleteUser(deletingUser.uid);
    setDeletingUser(null);
    onUserChange();
  };

  const getCompany = (cId: string | null) => {
    if (!cId) return null;
    return companies.find((c) => c.id === cId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-neutral-900">Kelola Akses Pengguna</h2>
          <p className="text-xs text-neutral-500 font-normal mt-0.5">
            Manajemen akun pengguna Linchub ATS dan pengaturan hak akses portal klien per perusahaan.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-3 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 font-medium cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50 text-neutral-500 font-normal">
                <th className="py-2.5 px-4 font-normal">Pengguna</th>
                <th className="py-2.5 px-4 font-normal">Email Akun</th>
                <th className="py-2.5 px-4 font-normal">Peran (Role)</th>
                <th className="py-2.5 px-4 font-normal">Perusahaan Ditautkan</th>
                <th className="py-2.5 px-4 font-normal text-right">Terdaftar</th>
                <th className="py-2.5 px-3 font-normal text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700 font-normal">
              {users.map((u) => {
                const userCompany = getCompany(u.companyId);
                const isMasterAdmin = u.email.toLowerCase() === 'adminlinchub@cmp.id';

                return (
                  <tr key={u.uid} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[10px] font-medium text-neutral-700 shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">{u.name}</div>
                          <div className="text-[11px] text-neutral-400 font-normal">
                            {u.title || u.role}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-neutral-600 font-mono">
                        <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span>{u.email}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-normal capitalize bg-neutral-50 border-neutral-200 text-neutral-700">
                        {u.role === 'admin' && <ShieldCheck className="w-3 h-3 text-neutral-500" />}
                        {u.role === 'recruiter' && <UserCheck className="w-3 h-3 text-neutral-500" />}
                        {u.role === 'client' && <Building2 className="w-3 h-3 text-neutral-500" />}
                        <span>{u.role}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {u.role === 'client' ? (
                        userCompany ? (
                          <span className="text-neutral-800 font-medium">{userCompany.companyName}</span>
                        ) : (
                          <span className="text-amber-600 font-normal">Belum ditautkan</span>
                        )
                      ) : (
                        <span className="text-neutral-400">Internal Linchub (Semua Klien)</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[11px] text-neutral-400 tabular-nums">
                      {new Date(u.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Edit akun"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!isMasterAdmin && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="p-1 rounded text-neutral-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl w-full max-w-md p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-medium text-neutral-900">
                Tambah Akun Pengguna Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Alamat Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@perusahaan.com"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Kata Sandi Awal (Password)
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Default: password123"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Jabatan / Posisi
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: HR Director / Talent Partner"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Peran (Role) *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
                >
                  <option value="client">Client (Hanya melihat kandidat perusahaannya)</option>
                  <option value="recruiter">Recruiter (Akses rekrutmen & assessment)</option>
                  <option value="admin">Admin (Akses penuh sistem Linchub)</option>
                </select>
              </div>

              {role === 'client' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tautkan ke Perusahaan Klien *
                  </label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs rounded border border-neutral-200 hover:bg-neutral-50 text-neutral-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 font-medium cursor-pointer"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl w-full max-w-md p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-medium text-neutral-900">
                Edit Akun Pengguna
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Alamat Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Ubah Kata Sandi (Password)
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak diubah"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Jabatan / Posisi
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Peran (Role) *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
                >
                  <option value="client">Client (Hanya melihat kandidat perusahaannya)</option>
                  <option value="recruiter">Recruiter (Akses rekrutmen & assessment)</option>
                  <option value="admin">Admin (Akses penuh sistem Linchub)</option>
                </select>
              </div>

              {role === 'client' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tautkan ke Perusahaan Klien *
                  </label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 text-xs rounded border border-neutral-200 hover:bg-neutral-50 text-neutral-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 font-medium cursor-pointer"
                >
                  Perbarui Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete User Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingUser}
        title="Hapus Akun Pengguna"
        message="Apakah Anda yakin ingin menghapus akun pengguna ini? Hak akses login akun ini akan dicabut secara permanen."
        itemName={deletingUser ? `${deletingUser.name} (${deletingUser.email})` : undefined}
        confirmLabel="Hapus Pengguna"
        onConfirm={handleConfirmDeleteUser}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  );
};
