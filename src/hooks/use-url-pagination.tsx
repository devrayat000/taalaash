"use client";

import { searchParamsSchema } from "@/lib/schemas";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { z } from "zod";

const searchParamsSchema2 = z.preprocess(
  (searchParams) =>
    searchParams instanceof URLSearchParams &&
    Object.fromEntries(searchParams.entries()),
  searchParamsSchema
);

export default function useUrlPagination() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const states = useMemo(
    () => searchParamsSchema2.parse(searchParams),
    [searchParams]
  );

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      router.push(`${pathname}?${params}`);
    },
    [pathname, router, searchParams]
  );

  const setLimit = useCallback(
    (limit: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("limit", limit.toString());
      router.push(`${pathname}?${params}`);
    },
    [pathname, router, searchParams]
  );

  const setQuery = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("query", query);
      router.push(`${pathname}?${params}`);
    },
    [pathname, router, searchParams]
  );

  return {
    ...states,
    setPage,
    setLimit,
    setQuery,
  };
}
