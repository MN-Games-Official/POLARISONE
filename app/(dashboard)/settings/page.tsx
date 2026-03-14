'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Settings, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your application preferences
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Settings size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">General</h3>
              <p className="text-sm text-gray-400">Basic application settings</p>
            </div>
          </div>
          <div className="rounded-lg border border-[#2d3748] bg-[#0f1419] p-4">
            <p className="text-sm text-gray-500">
              General settings will be available in a future update.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Bell size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <p className="text-sm text-gray-400">Configure notification preferences</p>
            </div>
          </div>
          <div className="rounded-lg border border-[#2d3748] bg-[#0f1419] p-4">
            <p className="text-sm text-gray-500">
              Notification settings will be available in a future update.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Shield size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Security</h3>
              <p className="text-sm text-gray-400">Security and privacy settings</p>
            </div>
          </div>
          <div className="rounded-lg border border-[#2d3748] bg-[#0f1419] p-4">
            <p className="text-sm text-gray-500">
              Two-factor authentication and advanced security settings coming soon.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Palette size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Appearance</h3>
              <p className="text-sm text-gray-400">Theme and display preferences</p>
            </div>
          </div>
          <div className="rounded-lg border border-[#2d3748] bg-[#0f1419] p-4">
            <p className="text-sm text-gray-500">
              Theme customization will be available in a future update.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
