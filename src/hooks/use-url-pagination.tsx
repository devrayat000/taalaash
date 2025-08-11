import { searchParamsSchema } from "@/lib/schemas";
import { useLocation, useSearch, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { z } from "zod/mini";

export default function useUrlPagination() {
	const searchParams = useSearch({
		shouldThrow: false,
		strict: false,
	});
	const navigate = useNavigate();

	const states = useMemo(
		() => searchParamsSchema.parse(searchParams),
		[searchParams],
	);

	const setPage = useCallback(
		(page: number) => {
			const newParams = {
				...states,
				page: page.toString(),
			};
			navigate({ search: newParams });
		},
		[navigate, states],
	);

	const setLimit = useCallback(
		(limit: number) => {
			const newParams = {
				...searchParams,
				limit: limit.toString(),
			};
			navigate({ search: newParams });
		},
		[navigate, searchParams],
	);

	const setQuery = useCallback(
		(query: string) => {
			const newParams = {
				...searchParams,
				query: query,
			};
			navigate({ search: newParams });
		},
		[navigate, searchParams],
	);

	return {
		...states,
		setPage,
		setLimit,
		setQuery,
	};
}
