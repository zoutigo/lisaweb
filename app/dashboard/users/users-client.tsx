"use client";

import Link from "next/link";
import { useState } from "react";
import { Pagination } from "@/components/ui/pagination";

type UserItem = {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  isAdmin: boolean;
  createdAt: string;
};

type UsersClientProps = {
  users: UserItem[];
};

export function UsersClient({ users }: UsersClientProps) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const paged = users.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      {/* Mobile-first cards */}
      <div className="mt-6 grid gap-4 md:hidden">
        {paged.map((u) => (
          <div
            key={u.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Prénom</p>
                <p className="font-semibold text-gray-900">{u.firstName}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  u.isAdmin
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {u.isAdmin ? "Admin" : "Utilisateur"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <p className="text-gray-500">Nom</p>
                <p className="font-medium text-gray-800">{u.lastName}</p>
              </div>
              <div>
                <p className="text-gray-500">Nom complet</p>
                <p className="font-medium text-gray-800">{u.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Téléphone</p>
                <p className="font-medium text-gray-800">{u.phone || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-800 break-words">
                  {u.email}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                href={`/dashboard/users/${u.id}`}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800 hover:border-blue-300 hover:text-blue-700"
              >
                Voir
              </Link>
              <Link
                href={`/dashboard/users/${u.id}/edit`}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Modifier
              </Link>
            </div>
          </div>
        ))}
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalCount={users.length}
          onPageChange={setPage}
        />
      </div>

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 text-sm font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Prénom</th>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Nom complet</th>
              <th className="px-4 py-3 text-left">Téléphone</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Admin</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
            {paged.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {u.firstName}
                </td>
                <td className="px-4 py-3">{u.lastName}</td>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.phone || "—"}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      u.isAdmin
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {u.isAdmin ? "Admin" : "Utilisateur"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/users/${u.id}`}
                      className="inline-flex items-center justify-center rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 hover:border-blue-300 hover:text-blue-700"
                    >
                      Voir
                    </Link>
                    <Link
                      href={`/dashboard/users/${u.id}/edit`}
                      className="inline-flex items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Modifier
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-gray-200 p-3">
          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalCount={users.length}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  );
}
