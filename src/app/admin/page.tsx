// src/app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import AdminApp from "./ui/AdminApp";

export default async function AdminPage() {
  const users = await prisma.user.findMany({
    select: { id: true, login: true, role: true, createdAt: true },
    orderBy: { id: "desc" },
  });

  const initialUsers = users.map((u) => ({
    id: u.id,
    login: u.login,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }));

  return <AdminApp initialUsers={initialUsers} />;
}
