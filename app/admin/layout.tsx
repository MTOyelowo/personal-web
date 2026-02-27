import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/admin-shell";

export const metadata = {
  title: "Admin Dashboard — TMOyelowo",
  description: "Manage your posts, daily words, categories, and collections.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Verify admin role from DB
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, avatar: true, email: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <AdminShell
      user={{
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }}
    >
      {children}
    </AdminShell>
  );
}
