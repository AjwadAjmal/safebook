"use client";

import React from "react";
import styles from "./admin.module.css";
import { type AdminUserListItem } from "@/lib/admin-db";

export interface AdminUserListProps {
  users: AdminUserListItem[];
  currentUserId: string;
  onRequestDelete: (user: AdminUserListItem) => void;
}

export function AdminUserList({
  users,
  currentUserId,
  onRequestDelete,
}: AdminUserListProps) {
  const getRoleLabel = (role: "superadmin" | "admin" | "member") => {
    switch (role) {
      case "superadmin":
        return "Superadmin";
      case "admin":
        return "Admin";
      case "member":
        return "Mitglied";
      default:
        return role;
    }
  };

  const getRoleStyleClass = (role: "superadmin" | "admin" | "member") => {
    switch (role) {
      case "superadmin":
        return styles.roleSuperadmin;
      case "admin":
        return styles.roleAdmin;
      case "member":
        return styles.roleMember;
      default:
        return "";
    }
  };

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Registrierte Benutzer</h2>
      {users.length === 0 ? (
        <div className={styles.emptyUsers}>Keine Benutzer registriert.</div>
      ) : (
        <div className={styles.userList}>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const householdDisplay = user.householdName || "Kein Haushalt";
            const accountsDisplay =
              user.accountsCount === 1 ? "1 Konto" : `${user.accountsCount} Konten`;

            return (
              <div key={user.id} className={styles.userCard} data-testid={`user-card-${user.id}`}>
                <div className={styles.userHeader}>
                  <div className={styles.userTitleGroup}>
                    <span className={styles.username}>{user.username}</span>
                    <span
                      className={`${styles.roleBadge} ${getRoleStyleClass(
                        user.role
                      )}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => onRequestDelete(user)}
                    disabled={isSelf}
                    title={
                      isSelf
                        ? "Eigenes Superadmin-Konto kann nicht gelöscht werden"
                        : "Benutzer löschen"
                    }
                    aria-label={`Benutzer ${user.username} löschen`}
                  >
                    Löschen
                  </button>
                </div>

                <div className={styles.userDetails}>
                  <div className={styles.userMeta}>
                    <span>{householdDisplay}</span>
                  </div>
                  <span>{accountsDisplay}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
