'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { User, Camera, Save, Lock, Eye, EyeOff } from 'lucide-react';

interface ProfileData {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await api.get<{ success: boolean; user: ProfileData }>('/users/profile');
        setProfile(data.user);
        setFullName(data.user.full_name ?? '');
        setAvatarUrl(data.user.avatar_url ?? '');
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put('/users/profile', {
        full_name: fullName || undefined,
        avatar_url: avatarUrl || undefined,
      });
      setSuccess('Profile updated successfully');
    } catch {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setError(message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading variant="spinner" size="lg" />
      </div>
    );
  }

  const userInitials = (profile?.full_name ?? profile?.username ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-gray-400">Manage your account information</p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}
      {success && (
        <div className="mb-6">
          <Alert type="success" dismissible onDismiss={() => setSuccess(null)}>
            {success}
          </Alert>
        </div>
      )}

      <div className="space-y-6">
        {/* Avatar section */}
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full border-2 border-[#2d3748] object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#ff4b6e] to-[#ff6b8a] text-2xl font-bold text-white">
                  {userInitials}
                </div>
              )}
              <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#ff4b6e] text-white shadow-lg transition-colors hover:bg-[#e8435f]">
                <Camera size={14} />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {profile?.full_name ?? profile?.username}
              </h2>
              <p className="text-sm text-gray-400">@{profile?.username}</p>
              <p className="text-sm text-gray-500">{profile?.email}</p>
            </div>
          </div>
        </Card>

        {/* Profile form */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Profile Information</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Username"
                value={profile?.username ?? ''}
                disabled
                iconLeft={<User size={18} />}
              />
              <Input
                label="Email"
                value={profile?.email ?? ''}
                disabled
              />
            </div>
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
            <Input
              label="Avatar URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
            />
            <div className="flex justify-end">
              <Button type="submit" loading={saving} iconLeft={<Save size={16} />}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Password section */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Password</h3>
              <p className="text-sm text-gray-400">Change your account password</p>
            </div>
            {!showPasswordForm && (
              <Button
                variant="outline"
                onClick={() => setShowPasswordForm(true)}
                iconLeft={<Lock size={16} />}
              >
                Change Password
              </Button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  iconRight={
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-gray-400 hover:text-white"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>
              <div className="relative">
                <Input
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  iconRight={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={changingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Account info */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Account Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Email Verified</span>
              <span className={profile?.email_verified ? 'text-emerald-400' : 'text-amber-400'}>
                {profile?.email_verified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Member Since</span>
              <span className="text-gray-300">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
