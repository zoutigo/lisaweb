"use client";
import { useEffect, useState } from "react";

type UserRow = {
  id: string;
  email: string | null;
  name: string | null;
  isAdmin: boolean;
};

export default function UsersAdminClient() {
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard/users");
        if (!res.ok) return;
        const data = (await res.json()) as UserRow[];
        setUsers(data);
      } catch {
        // ignore client admin demo errors
      }
    };
    load();
  }, []);

  const toggleAdmin = async (id: string, isAdmin: boolean) => {
    await fetch(`/api/dashboard/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: !isAdmin }),
    });
    setUsers((u) =>
      u.map((x) => (x.id === id ? { ...x, isAdmin: !isAdmin } : x)),
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Utilisateurs (client)</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Nom</th>
            <th className="px-4 py-2">Admin</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.name}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => toggleAdmin(u.id, u.isAdmin)}
                  className="px-2 py-1 border rounded"
                >
                  {u.isAdmin ? "Retirer" : "Promouvoir"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
