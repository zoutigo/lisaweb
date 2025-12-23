"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";

type PartnerItem = {
  id: number;
  name: string;
  logoUrl: string | null;
  url: string | null;
  createdAt: string;
};

type PartnersClientProps = {
  partners: PartnerItem[];
  placeholderLogo: string;
};

export function PartnersClient({
  partners,
  placeholderLogo,
}: PartnersClientProps) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const paged = useMemo(
    () => partners.slice((page - 1) * pageSize, page * pageSize),
    [partners, page, pageSize],
  );

  return (
    <>
      {/* Mobile cards */}
      <div className="mt-6 grid gap-4 md:hidden">
        {paged.map((p) => (
          <Card
            key={p.id}
            className="border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Image
                  src={p.logoUrl || placeholderLogo}
                  alt={p.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(p.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div>
                <p className="text-gray-500">Site web</p>
                <p className="font-medium text-gray-900 break-words">
                  {p.url ? (
                    <Link
                      href={p.url}
                      className="text-blue-600 hover:underline"
                    >
                      {p.url}
                    </Link>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/dashboard/partners/${p.id}`}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800 hover:border-blue-300 hover:text-blue-700"
              >
                Voir
              </Link>
              <Link
                href={`/dashboard/partners/${p.id}/edit`}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Modifier
              </Link>
            </div>
          </Card>
        ))}
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalCount={partners.length}
          onPageChange={setPage}
        />
      </div>

      {/* Desktop table */}
      <Card className="mt-6 hidden overflow-hidden border border-gray-200 bg-white shadow-sm md:block p-0">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 text-sm font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Site</th>
              <th className="px-4 py-3 text-left">Créé le</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
            {paged.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    <Image
                      src={p.logoUrl || placeholderLogo}
                      alt={p.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span>{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {p.url ? (
                    <Link
                      href={p.url}
                      className="text-blue-600 hover:underline"
                    >
                      {p.url}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/partners/${p.id}`}
                      className="inline-flex items-center justify-center rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 hover:border-blue-300 hover:text-blue-700"
                    >
                      Voir
                    </Link>
                    <Link
                      href={`/dashboard/partners/${p.id}/edit`}
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
            totalCount={partners.length}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </>
  );
}
