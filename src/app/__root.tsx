/// <reference types="vite/client" />
import { ToastProvider } from "@/providers/toast-provider";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import logo from "@/assets/logo_sq.png?url";

import appCss from "./globals.css?url";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import Loading from "./~loading";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

// const inter = Inter({ subsets: ["latin"], variable: "--inter" });
// const tiroBangla = Tiro_Bangla({
//   weight: ["400"],
//   variable: "--tiro-bangla",
//   subsets: ["bengali"],
// });

// export const metadata: Metadata = {
//   title: "Taalaash",
//   description: `প্রতিটা পরীক্ষার পর প্রশ্ন সলভ করতে হয়। প্রশ্ন, অপশন
//   খুঁজতে আমাদের শত শত ঘন্টা অপচয় হয়। এই টুলস
//   ব্যবহার করলে আপনি সেকেন্ডের মাঝেই রেফারেন্স
//  খুঁজে পাবেন। বইয়ের কোথায় আছে, কীভাবে আছে,
//  কোন বইতে আছে সবকিছু দেখতে পাবেন সেকেন্ডের
//  মাঝে। বয়াকাডেমিকে অবশ্যই কাজে লাগাবে। ভর্তি
//   পরীক্ষায় যেন এই টুলস তোমার ডে টু ডে ব্যবহারের
//   সঙ্গী হয়।`.replace(/\s+/g, " "),
//   alternates: { canonical: "https://taalaash.com" },
//   appleWebApp: { capable: true, title: "Taalaash" },
//   applicationName: "Taalaash",
//   bookmarks: "https://taalaash.com/bookmarks",
//   category: "Education",
//   generator: "Next.js",
//   openGraph: {
//     description: `প্রতিটা পরীক্ষার পর প্রশ্ন সলভ করতে হয়। প্রশ্ন, অপশন
//   খুঁজতে আমাদের শত শত ঘন্টা অপচয় হয়। এই টুলস
//   ব্যবহার করলে আপনি সেকেন্ডের মাঝেই রেফারেন্স
//  খুঁজে পাবেন। বইয়ের কোথায় আছে, কীভাবে আছে,
//  কোন বইতে আছে সবকিছু দেখতে পাবেন সেকেন্ডের
//  মাঝে। বয়াকাডেমিকে অবশ্যই কাজে লাগাবে। ভর্তি
//   পরীক্ষায় যেন এই টুলস তোমার ডে টু ডে ব্যবহারের
//   সঙ্গী হয়।`.replace(/\s+/g, " "),
//   },
//   icons: [{ url: logo.src, rel: "icon" }],
//   metadataBase: new URL("https://taalaash.com"),
//   authors: {
//     name: "Zul Ikram Musaddik Rayat",
//     url: "https://twitter.com/zul_rayat",
//   },
// };

// export const dynamic = true;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        { title: "TanStack Start Starter" },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
    }),
    component: RootLayout,
    loader(ctx) {
      return {
        dehydratedState: dehydrate(queryClient),
      };
    },
  }
);

function RootLayout() {
  const { dehydratedState } = Route.useLoaderData();

  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="vZDtRk0Srm9iwSChDW5c4g8otPXyLw2YlSKTInirxrA"
        />
        <HeadContent />
      </head>
      <body
      // className={cn(inter.className, tiroBangla.className)}
      // className={cn(inter.variable, tiroBangla.variable)}
      >
        <ToastProvider />
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary state={dehydratedState}>
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </HydrationBoundary>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
