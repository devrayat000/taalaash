import createClient from "algoliasearch";
import { env } from "./utils";

export const algoliaClient = createClient(
  env("NEXT_PUBLIC_ALGOLIA_APP_ID")!,
  env("ALGOLIA_ADMIN_API_KEY")!
);

export const postIndex = algoliaClient.initIndex("posts");
