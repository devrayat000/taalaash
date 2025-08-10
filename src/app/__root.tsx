/// <reference types="vite/client" />

// declare umami with window so that I can access window.umami in the code
declare global {
	interface Window {
		umami: any;
	}
}

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
import { Context } from "@/router";
import { authClient } from "@/lib/auth-client";
import { getCurrentUser } from "@/server/middleware";
import { Toaster } from "@/components/ui/sonner";
import { seo } from "@/lib/seo";

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

export const Route = createRootRouteWithContext<Context>()({
	head: () => ({
		meta: [
			...seo({
				title: "Taalaash - তালাশ",
				url: "https://taalaash.com",
				siteName: "Taalaash",
				description: `প্রতিটা পরীক্ষার পর প্রশ্ন সলভ করতে হয়। প্রশ্ন, অপশন
				খুঁজতে আমাদের শত শত ঘন্টা অপচয় হয়। এই টুলস
				ব্যবহার করলে আপনি সেকেন্ডের মাঝেই রেফারেন্স
				খুঁজে পাবেন। বইয়ের কোথায় আছে, কীভাবে আছে,
				কোন বইতে আছে সবকিছু দেখতে পাবেন সেকেন্ডের
				মাঝে। বয়াকাডেমিকে অবশ্যই কাজে লাগাবে। ভর্তি
				পরীক্ষায় যেন এই টুলস তোমার ডে টু ডে ব্যবহারের
				সঙ্গী হয়।`.replace(/\s+/g, " "),
				keywords: [
					"বাংলা শিক্ষা",
					"পরীক্ষার প্রস্তুতি",
					"বই খোঁজা",
					"রেফারেন্স খোঁজা",
					"শিক্ষা সহায়ক",
					"ভর্তি পরীক্ষা",
					"question solver",
					"bangladesh education",
					"academic help",
				],
				author: {
					name: "Zul Ikram Musaddik Rayat",
					url: "https://twitter.com/zul_rayat",
				},
			}),
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
		scripts: [
			process.env.VITE_ANALYTICS === "1" ||
			import.meta.env.VITE_ANALYTICS === "1"
				? {
						src:
							process.env.VITE_ANALYTICS_SCRIPT ||
							import.meta.env.VITE_ANALYTICS_SCRIPT,
						defer: true,
						"data-website-id":
							process.env.VITE_ANALYTICS_ID ||
							import.meta.env.VITE_ANALYTICS_ID,
					}
				: {},
		],
	}),
	component: RootLayout,
	async beforeLoad({ abortController }) {
		const { data, error } = await getCurrentUser({
			signal: abortController.signal,
		});
		if (error) {
			return {
				user: null,
				isAuthenticated: false,
			};
		}
		return {
			user: data?.user,
			isAuthenticated: !!data?.user,
		};
	},
	loader() {
		return {
			dehydratedState: dehydrate(queryClient),
		};
	},
	wrapInSuspense: true,
});

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
				<Toaster />
				<Scripts />
			</body>
		</html>
	);
}
