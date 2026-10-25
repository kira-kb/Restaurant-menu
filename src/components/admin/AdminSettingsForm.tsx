'use client';

import React, { useState } from 'react';
import { updateShopSettingsAction } from '@/lib/actions/settings';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/context';

interface SettingsData {
  cafeName: string;
  tagline: string | null;
  address: string | null;
  phone: string | null;
  currency: string;
  receiptHeader: string | null;
  receiptFooter: string | null;
  taxRatePercent: number;
}

export default function AdminSettingsForm({
  initialSettings,
}: {
  initialSettings: SettingsData;
}) {
  const { dict } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(false);

    const formData = new FormData(e.currentTarget);
    try {
      await updateShopSettingsAction(formData);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-medium text-[#F5F0EB]">
          {dict.settingsPageTitle}
        </h1>
        <p className="text-xs text-[#9E958C]">
          {dict.settingsPageSubtitle}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-6 space-y-6 shadow-xs"
      >
        {successMsg && (
          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{dict.settingsSavedSuccess}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl text-xs text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Brand & Store */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-[#9E958C]">
            {dict.adminSettings}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#F5F0EB] block">
                {dict.shopNameLabel}
              </label>
              <input
                type="text"
                name="cafeName"
                required
                defaultValue={initialSettings.cafeName}
                className="w-full bg-[#141210] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#F5F0EB] block">
                {dict.currencyLabel}
              </label>
              <input
                type="text"
                name="currency"
                required
                defaultValue={initialSettings.currency}
                className="w-full bg-[#141210] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#F5F0EB] block">
              {dict.taglineLabel}
            </label>
            <input
              type="text"
              name="tagline"
              defaultValue={initialSettings.tagline || ''}
              className="w-full bg-[#141210] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-4 pt-4 border-t border-[#2E2824]">
          <h3 className="text-xs font-medium text-[#9E958C]">
            {dict.addressLabel} & {dict.phoneLabel}
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#F5F0EB] block">
              {dict.addressLabel}
            </label>
            <input
              type="text"
              name="address"
              defaultValue={initialSettings.address || ''}
              className="w-full bg-[#141210] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#F5F0EB] block">
              {dict.phoneLabel}
            </label>
            <input
              type="text"
              name="phone"
              defaultValue={initialSettings.phone || ''}
              className="w-full bg-[#141210] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
            />
          </div>
        </div>

        {/* Receipt Messages */}
        <div className="space-y-4 pt-4 border-t border-[#2E2824]">
          <h3 className="text-xs font-medium text-[#9E958C]">
            {dict.receiptHeaderLabel} & {dict.receiptFooterLabel}
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#F5F0EB] block">
              {dict.receiptHeaderLabel}
            </label>
            <input
              type="text"
              name="receiptHeader"
              defaultValue={initialSettings.receiptHeader || ''}
              className="w-full bg-[#141210] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#F5F0EB] block">
              {dict.receiptFooterLabel}
            </label>
            <input
              type="text"
              name="receiptFooter"
              defaultValue={initialSettings.receiptFooter || ''}
              className="w-full bg-[#141210] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#2E2824] flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingText={dict.savingSettingsBtn}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            {dict.saveSettingsBtn}
          </Button>
        </div>
      </form>
    </div>
  );
}
