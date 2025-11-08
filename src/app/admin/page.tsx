import { prisma } from "@/lib/prisma";
import AdminApp from "./ui/AdminApp";

// optional: import shared admin button styles
import "@/styles/adminButtons.module.css";

export default async function AdminPage() {
  // You can type the Prisma query result directly
  const users = await prisma.user.findMany({
    select: { id: true, login: true, role: true, createdAt: true },
    orderBy: { id: "desc" },
  });

  // ✅ Fix TS: explicitly define type and map the result
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
