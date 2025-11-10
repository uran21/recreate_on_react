import { prisma } from "@/lib/prisma";
import AdminApp from "./ui/AdminApp";

import "@/styles/adminButtons.module.css";

export default async function AdminPage() {
  const users = await prisma.user.findMany({
    select: { id: true, login: true, role: true, createdAt: true },
    orderBy: { id: "desc" },
  });

  const initialUsers = users.map(
    (u: { id: number; login: string; role: string; createdAt: Date }) => ({
      id: u.id,
      login: u.login,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    })
  );

  return <AdminApp initialUsers={initialUsers} />;
}
