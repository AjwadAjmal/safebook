"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import { type AdminUserListItem } from "@/lib/admin-db";
import { AdminUserForm } from "./admin-user-form";
import { AdminUserList } from "./admin-user-list";
import { DeleteUserModal } from "./delete-user-modal";
import { Toast } from "@/components/ui/toast";
import { deleteUserAction } from "@/lib/actions/admin";

export interface AdminViewProps {
  users: AdminUserListItem[];
  currentUserId: string;
}

export function AdminView({ users, currentUserId }: AdminViewProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdminUserListItem | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const handleUserCreated = () => {
    router.refresh();
  };

  const handleRequestDelete = (user: AdminUserListItem) => {
    setDeleteTarget(user);
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeleteTarget(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const result = await deleteUserAction(deleteTarget.id);
      if (!result.success) {
        showToast(result.error || "Fehler beim Löschen des Benutzers.", "error");
      } else {
        showToast("Benutzer erfolgreich gelöscht.", "success");
        router.refresh();
      }
    } catch {
      showToast("Ein unerwarteter Fehler ist aufgetreten.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className={styles.adminContainer}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <AdminUserForm
        onUserCreated={handleUserCreated}
        showToast={showToast}
      />

      <AdminUserList
        users={users}
        currentUserId={currentUserId}
        onRequestDelete={handleRequestDelete}
      />

      <DeleteUserModal
        isOpen={!!deleteTarget}
        targetUser={deleteTarget}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
