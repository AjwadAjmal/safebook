"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPageTitleByPathname } from "@/lib/navigation-utils";
import styles from "./sidebar-navigation.module.css";

export interface SidebarNavigationProps {
  householdName: string;
  logoutAction?: () => Promise<void>;
  pageTitle?: string;
  role?: "superadmin" | "admin" | "member";
}

export function SidebarNavigation({
  householdName,
  logoutAction,
  pageTitle,
  role,
}: SidebarNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const activeTitle = pageTitle || getPageTitleByPathname(pathname);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const toggleDrawer = () => setIsOpen((prev) => !prev);
  const closeDrawer = () => setIsOpen(false);

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/accounts", label: "Kontenübersicht" },
    { href: "/transactions/new", label: "Neue Transaktion" },
    ...(role === "superadmin"
      ? [{ href: "/admin", label: "Benutzerverwaltung" }]
      : []),
  ];

  return (
    <>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={toggleDrawer}
            aria-label="Menü öffnen"
            aria-expanded={isOpen}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className={styles.pageTitle}>{activeTitle}</span>
        </div>
      </header>

      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ""}`}
        onClick={closeDrawer}
        aria-hidden="true"
        data-testid="sidebar-backdrop"
      />

      <aside
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}
        aria-label="Hauptnavigation"
      >
        <div className={styles.drawerHeader}>
          <div>
            <div className={styles.drawerTitle}>Safebook</div>
            <div className={styles.drawerSubtitle}>{householdName}</div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={closeDrawer}
            aria-label="Menü schließen"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className={styles.navBody}>
          <ul className={styles.navList}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeDrawer}
                    className={`${styles.navItemLink} ${
                      isActive ? styles.activeLink : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.drawerFooter}>
          <form
            action={async () => {
              if (logoutAction) {
                await logoutAction();
              }
            }}
          >
            <button type="submit" className={styles.logoutButton}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Abmelden
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
