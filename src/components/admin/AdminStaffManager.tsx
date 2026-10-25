'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  KeyRound,
  Edit2,
  X,
  AlertCircle,
  CheckCircle2,
  Shield,
  Coffee,
} from 'lucide-react';
import {
  createStaffMember,
  updateStaffMember,
  changeStaffPassword,
} from '@/lib/actions/staff';
import { Role } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/context';

interface StaffRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    paymentsRecorded: number;
    closedTableSessions: number;
  };
}

export default function AdminStaffManager({
  initialStaff,
  currentUserId,
}: {
  initialStaff: StaffRecord[];
  currentUserId: string;
}) {
  const { dict } = useLanguage();
  const [staff, setStaff] = useState<StaffRecord[]>(initialStaff);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open Handlers
  const openCreateModal = () => {
    setFormError(null);
    setCreateModalOpen(true);
  };

  const openEditModal = (member: StaffRecord) => {
    setSelectedStaff(member);
    setFormError(null);
    setEditModalOpen(true);
  };

  const openPasswordModal = (member: StaffRecord) => {
    setSelectedStaff(member);
    setFormError(null);
    setPasswordModalOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const created = await createStaffMember(formData);
      setStaff((prev) => [
        ...prev,
        {
          id: created.id,
          name: created.name,
          email: created.email,
          role: created.role,
          isActive: created.isActive,
          createdAt: created.createdAt,
          updatedAt: created.createdAt,
          _count: { paymentsRecorded: 0, closedTableSessions: 0 },
        },
      ]);
      setFeedbackMessage(`Account created for ${created.name}`);
      setTimeout(() => setFeedbackMessage(null), 4000);
      setCreateModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const updated = await updateStaffMember(formData);
      setStaff((prev) =>
        prev.map((s) =>
          s.id === selectedStaff.id
            ? {
                ...s,
                name: updated.name,
                role: updated.role,
                isActive: updated.isActive,
                updatedAt: updated.updatedAt,
              }
            : s
        )
      );
      setFeedbackMessage(`Updated ${updated.name}`);
      setTimeout(() => setFeedbackMessage(null), 4000);
      setEditModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Password Change
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    try {
      await changeStaffPassword(formData);
      setPasswordModalOpen(false);
      setFeedbackMessage(`Password updated for ${selectedStaff.name}. All existing sessions were invalidated.`);
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-medium text-[#F5F0EB]">
          {dict.staffPageTitle}
        </h1>
        <p className="text-xs text-[#9E958C]">
          {dict.staffPageSubtitle}
        </p>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4">
        <div>
          <h2 className="text-sm font-medium text-[#F5F0EB]">{dict.staffPageTitle}</h2>
          <p className="text-xs text-[#9E958C]">
            {dict.staffPageSubtitle}
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          variant="primary"
          icon={<UserPlus className="w-4 h-4" />}
        >
          {dict.addStaffBtn}
        </Button>
      </div>

      {/* Staff Table */}
      <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#241F1C] text-[#9E958C] border-b border-[#2E2824]">
              <tr>
                <th className="px-4 py-3 font-medium">{dict.thStaffName} / {dict.thStaffEmail}</th>
                <th className="px-4 py-3 font-medium">{dict.thStaffRole}</th>
                <th className="px-4 py-3 font-medium">{dict.thTotal}</th>
                <th className="px-4 py-3 font-medium">{dict.thStatus}</th>
                <th className="px-4 py-3 font-medium text-right">{dict.thActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2824]">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-[#241F1C]/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <span className="font-medium text-[#F5F0EB] block">
                        {member.name} {member.id === currentUserId && '(You)'}
                      </span>
                      <span className="text-[11px] text-[#9E958C] block">
                        {member.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md font-medium ${
                        member.role === Role.ADMIN
                          ? 'bg-[#2E2824] text-[#F5F0EB] border border-[#3D3530]'
                          : 'bg-[#241F1C] text-[#9E958C] border border-[#2E2824]'
                      }`}
                    >
                      {member.role === Role.ADMIN ? (
                        <Shield className="w-3 h-3 text-[#10B981]" />
                      ) : (
                        <Coffee className="w-3 h-3 text-[#9E958C]" />
                      )}
                      <span>{member.role === Role.ADMIN ? dict.roleAdmin : dict.roleBarista}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#9E958C]">
                    {member._count.paymentsRecorded} payments recorded
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                        member.isActive
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                          : 'bg-[#241F1C] text-[#9E958C] border border-[#2E2824]'
                      }`}
                    >
                      {member.isActive ? dict.statusActive : dict.statusInactive}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        onClick={() => openPasswordModal(member)}
                        variant="secondary"
                        size="sm"
                        icon={<KeyRound className="w-3 h-3 text-[#9E958C]" />}
                        title={dict.resetPasswordModalTitle}
                      >
                        {dict.resetPasswordModalTitle}
                      </Button>

                      <button
                        onClick={() => openEditModal(member)}
                        className="p-1.5 text-[#9E958C] hover:text-[#F5F0EB] rounded-lg hover:bg-[#2E2824] transition-colors"
                        title={dict.editProduct}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#1E1A17] border border-[#2E2824] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-[#241F1C] border-b border-[#2E2824] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F5F0EB]">
                {dict.createStaffModalTitle}
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#2E2824] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mx-5 mt-4 p-3 bg-red-950/30 border border-red-800/40 rounded-xl text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  {dict.staffFullNameField}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Almaz Kebede"
                  className="w-full bg-[#141210] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder:text-[#9E958C]/50 focus:outline-hidden focus:border-[#10B981]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  {dict.staffEmailField}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="barista2@barchcoffee.com"
                  className="w-full bg-[#141210] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder:text-[#9E958C]/50 focus:outline-hidden focus:border-[#10B981]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  {dict.staffPasswordField}
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  className="w-full bg-[#141210] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] placeholder:text-[#9E958C]/50 focus:outline-hidden focus:border-[#10B981]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  {dict.staffRoleField}
                </label>
                <select
                  name="role"
                  defaultValue={Role.BARISTA}
                  className="w-full bg-[#141210] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
                >
                  <option value={Role.BARISTA}>{dict.roleBarista}</option>
                  <option value={Role.ADMIN}>{dict.roleAdmin}</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#2E2824] flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateModalOpen(false)}
                >
                  {dict.cancelBtn}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  loadingText={dict.savingStaff}
                >
                  {dict.saveStaff}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#1E1A17] border border-[#2E2824] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-[#241F1C] border-b border-[#2E2824] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F5F0EB]">
                Edit staff member
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#2E2824] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mx-5 mt-4 p-3 bg-red-950/30 border border-red-800/40 rounded-xl text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5">
              <input type="hidden" name="userId" value={selectedStaff.id} />

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  Staff member name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={selectedStaff.name}
                  className="w-full bg-[#141210] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  Role
                </label>
                <select
                  name="role"
                  defaultValue={selectedStaff.role}
                  className="w-full bg-[#141210] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
                >
                  <option value={Role.BARISTA}>Barista</option>
                  <option value={Role.ADMIN}>Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked={selectedStaff.isActive}
                  className="rounded border-[#2E2824] bg-[#141210] text-[#10B981] focus:ring-[#10B981]"
                />
                <label htmlFor="isActive" className="text-xs text-[#F5F0EB] cursor-pointer">
                  Account is active (can sign in)
                </label>
              </div>

              <div className="pt-3 border-t border-[#2E2824] flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  loadingText="Saving..."
                >
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {passwordModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#1E1A17] border border-[#2E2824] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-[#241F1C] border-b border-[#2E2824] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F5F0EB]">
                  Change password
                </h3>
                <p className="text-xs text-[#9E958C]">For {selectedStaff.name}</p>
              </div>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="p-1.5 rounded-lg text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#2E2824] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mx-5 mt-4 p-3 bg-red-950/30 border border-red-800/40 rounded-xl text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="p-5 space-y-3.5">
              <input type="hidden" name="userId" value={selectedStaff.id} />

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F0EB] block">
                  New password (min. 8 characters)
                </label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  className="w-full bg-[#141210] border border-[#2E2824] rounded-xl px-3 py-2 text-xs text-[#F5F0EB] focus:outline-hidden focus:border-[#10B981]"
                />
              </div>

              <p className="text-[11px] text-[#9E958C] leading-relaxed">
                Setting a new password will securely hash it with Argon2id and automatically invalidate all existing sessions for this user.
              </p>

              <div className="pt-3 border-t border-[#2E2824] flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPasswordModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  loadingText="Updating..."
                >
                  Update password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
