import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getAdminUsersList } from "@/lib/admin-db";
import { getHouseholdById } from "@/lib/household-utils";
import { SidebarNavigation } from "@/components/navigation/sidebar-navigation";
import { AdminView } from "@/components/admin/admin-view";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
    return;
  }

  if (session.user.role !== "superadmin") {
    redirect("/");
    return;
  }

  const household = session.user.householdId
    ? await getHouseholdById(session.user.householdId)
    : null;

  const users = await getAdminUsersList();

  const handleLogout = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <>
      <SidebarNavigation
        householdName={household?.name || "Administration"}
        logoutAction={handleLogout}
        pageTitle="Benutzerverwaltung"
      />
      <div className="pageContainer" style={{ paddingTop: "var(--space-6)" }}>
        <AdminView users={users} currentUserId={session.user.id} />
      </div>
    </>
  );
}
