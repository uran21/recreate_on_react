// src/app/admin/ui/AdminApp.tsx
"use client";

import { useState } from "react";
import styles from "./AdminApp.module.css";

type UserRow = { id: number; login: string; role: string; createdAt: string };

export default function AdminApp({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users] = useState<UserRow[]>(initialUsers);

  return (
    <div className={styles.wrap}>
      <header className={styles.topbar}>
        <h1>Admin</h1>
        <nav className={styles.nav}>
          <a href="/admin/orders">Orders</a>
          <a href="/admin/users">Users</a>
          <a href="/menu">Back to Menu</a>
        </nav>
      </header>

      <section className={styles.card}>
        <h2>Latest users</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Login</th>
              <th>Role</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.login}</td>
                <td>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
