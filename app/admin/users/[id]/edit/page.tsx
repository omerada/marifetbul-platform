'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Ban, Shield, AlertTriangle } from 'lucide-react';
import { Button, Card, Input, Label, Badge } from '@/components/ui';
import { useToast } from '@/hooks';

interface Props {
  params: Promise<{ id: string }>;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * Admin User Edit Page
 * Edit user details, manage roles, and handle suspensions
 */
export default function AdminUserEditPage({ params }: Props) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [userId, setUserId] = useState<string>('');
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    role: 'FREELANCER',
  });

  useEffect(() => {
    params.then((p) => setUserId(p.id));
  }, [params]);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/v1/admin/users/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        const data = await response.json();
        const userData = data.data;
        setUser(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          username: userData.username || '',
          role: userData.role || 'FREELANCER',
        });
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('Kullanıcı bilgileri yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update user');

      success('Başarılı', 'Kullanıcı bilgileri güncellendi');

      // Refresh user data
      const updatedData = await response.json();
      setUser(updatedData.data);
    } catch (err) {
      console.error('Failed to update user:', err);
      showError('Hata', 'Kullanıcı bilgileri güncellenemedi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuspend = async () => {
    if (!confirm('Bu kullanıcıyı askıya almak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/v1/admin/users/${userId}/suspend`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to suspend user');

      success('Başarılı', 'Kullanıcı askıya alındı');

      // Refresh user data
      const updatedData = await response.json();
      setUser(updatedData.data);
    } catch (err) {
      console.error('Failed to suspend user:', err);
      showError('Hata', 'Kullanıcı askıya alınamadı');
    }
  };

  const handleBan = async () => {
    const reason = prompt('Ban sebebini giriniz:');
    if (!reason) return;

    if (
      !confirm(
        'Bu kullanıcıyı kalıcı olarak engellemek istediğinizden emin misiniz?'
      )
    ) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/v1/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to ban user');

      success('Başarılı', 'Kullanıcı engellendi');

      // Refresh user data
      const updatedData = await response.json();
      setUser(updatedData.data);
    } catch (err) {
      console.error('Failed to ban user:', err);
      showError('Hata', 'Kullanıcı engellenemedi');
    }
  };

  const handleUnban = async () => {
    if (
      !confirm(
        'Bu kullanıcının engelini kaldırmak istediğinizden emin misiniz?'
      )
    ) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/v1/admin/users/${userId}/unban`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to unban user');

      success('Başarılı', 'Kullanıcının engeli kaldırıldı');

      // Refresh user data
      const updatedData = await response.json();
      setUser(updatedData.data);
    } catch (err) {
      console.error('Failed to unban user:', err);
      showError('Hata', 'Kullanıcının engeli kaldırılamadı');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant:
          | 'default'
          | 'secondary'
          | 'success'
          | 'warning'
          | 'destructive';
        label: string;
      }
    > = {
      ACTIVE: { variant: 'success', label: 'Aktif' },
      SUSPENDED: { variant: 'warning', label: 'Askıda' },
      BANNED: { variant: 'destructive', label: 'Engellendi' },
      INACTIVE: { variant: 'secondary', label: 'Pasif' },
    };

    const config = variants[status] || variants.ACTIVE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Yönetici',
      EMPLOYER: 'İşveren',
      FREELANCER: 'Freelancer',
      USER: 'Kullanıcı',
    };

    return <Badge variant="secondary">{labels[role] || role}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="h-96 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/users')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kullanıcılara Dön
        </Button>
        <Card className="p-8 text-center">
          <p className="text-red-600">{error || 'Kullanıcı bulunamadı'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/users')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kullanıcılara Dön
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Kullanıcı Düzenle</h1>
            <p className="text-muted-foreground mt-1">Kullanıcı ID: {userId}</p>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(user.status)}
            {getRoleBadge(user.role)}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* User Info Form */}
        <Card className="p-6">
          <h2 className="mb-6 text-xl font-semibold">Kullanıcı Bilgileri</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ad</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange('firstName', e.target.value)
                  }
                  placeholder="Ad"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Soyad</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange('lastName', e.target.value)
                  }
                  placeholder="Soyad"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="E-posta"
              />
              {user.isEmailVerified && (
                <p className="text-xs text-green-600">✓ E-posta doğrulandı</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Kullanıcı adı"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="FREELANCER">Freelancer</option>
                <option value="EMPLOYER">İşveren</option>
                <option value="ADMIN">Yönetici</option>
                <option value="USER">Kullanıcı</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/users')}
              >
                İptal
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-6">
          <h2 className="mb-6 text-xl font-semibold">Hesap İşlemleri</h2>

          <div className="space-y-4">
            {/* Suspend/Activate */}
            {user.status === 'ACTIVE' && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Hesabı Askıya Al</p>
                    <p className="text-muted-foreground text-sm">
                      Kullanıcı geçici olarak sistemi kullanamaz
                    </p>
                  </div>
                </div>
                <Button variant="warning" onClick={handleSuspend}>
                  Askıya Al
                </Button>
              </div>
            )}

            {user.status === 'SUSPENDED' && (
              <div className="flex items-center justify-between rounded-lg border bg-orange-50 p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Askıyı Kaldır</p>
                    <p className="text-muted-foreground text-sm">
                      Kullanıcı tekrar sistemi kullanabilir
                    </p>
                  </div>
                </div>
                <Button variant="success" onClick={handleUnban}>
                  Aktifleştir
                </Button>
              </div>
            )}

            {/* Ban/Unban */}
            {user.status !== 'BANNED' && (
              <div className="flex items-center justify-between rounded-lg border border-red-200 p-4">
                <div className="flex items-center gap-3">
                  <Ban className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-600">Hesabı Engelle</p>
                    <p className="text-muted-foreground text-sm">
                      Kullanıcı kalıcı olarak engellenecek
                    </p>
                  </div>
                </div>
                <Button variant="destructive" onClick={handleBan}>
                  Engelle
                </Button>
              </div>
            )}

            {user.status === 'BANNED' && (
              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Engeli Kaldır</p>
                    <p className="text-muted-foreground text-sm">
                      Kullanıcının engeli kaldırılacak
                    </p>
                  </div>
                </div>
                <Button variant="success" onClick={handleUnban}>
                  Engeli Kaldır
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Links */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Hızlı Erişim</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/users/${userId}/wallet`)}
            >
              Cüzdan Görüntüle
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/users/${userId}/orders`)}
            >
              Siparişleri Görüntüle
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
