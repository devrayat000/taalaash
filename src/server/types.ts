import { SQL } from "drizzle-orm";
import type { AnyPgSelect, PgSelectPrepare } from "drizzle-orm/pg-core";

export interface GetParams {
  page?: number;
  limit?: number;
  query?: string;
  orderBy?: (SQL | SQL.Aliased)[];
}

export type GetResults<T> = Promise<{
  data: T[];
  count: number;
}>;

export type TableData<Prepare extends PgSelectPrepare<AnyPgSelect>> = Awaited<
  ReturnType<Prepare["execute"]>
>[number];
