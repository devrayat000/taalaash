import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import logoSingle from "@/assets/logo_single.png?url";
import home from "@/assets/og/home.png?url";
import { Link } from "@tanstack/react-router";

function HomePage() {
	return (
		<div className="min-h-[calc(100vh-72px)] flex flex-col">
			<Link to="/">
				<div className="flex justify-center">
					<img src={logoSingle} alt="logo" width={240} />
				</div>
			</Link>
			{/* <div className="flex-1" /> */}
			<div className="p-6 lg:w-1/2 mx-auto">
				<div>
					<h2 className="text-3xl font-bangla font-bold text-center">
						নয়শো ঘন্টার অপচয় রোধ
					</h2>
				</div>
				<div className="mt-4">
					<p className="font-bangla text-lg text-center">
						প্রতিটা পরীক্ষার পর প্রশ্ন সলভ করতে হয়। প্রশ্ন, অপশন খুঁজতে আমাদের শত শত ঘন্টা
						অপচয় হয়। এই টুলস ব্যবহার করলে আপনি সেকেন্ডের মাঝেই রেফারেন্স খুঁজে পাবেন।
						বইয়ের কোথায় আছে, কীভাবে আছে, কোন বইতে আছে সবকিছু দেখতে পাবেন সেকেন্ডের
						মাঝে। বয়াকাডেমিকে অবশ্যই কাজে লাগাবে। ভর্তি পরীক্ষায় যেন এই টুলস তোমার ডে টু ডে
						ব্যবহারের সঙ্গী হয়।{" "}
					</p>
				</div>
				<div className="mt-14">
					<Button
						size="lg"
						asChild
						className="w-full font-bangla text-2xl h-16 bg-card-result hover:bg-card-result/90"
					>
						<Link to="/">তথ্যের জগতে যাত্রা শুরু হোক!</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}

// export const metadata: Metadata = {
//   openGraph: {
//     type: "website",
//     countryName: "Bangladesh",
//     images: [{ url: home }],
//     title: "Taalaash",
//     url: "https://taalaash.com",
//   },
//   twitter: {
//     card: "summary_large_image",
//     site: "@taalaash",
//     creator: "@zul_rayat",
//     images: [{ url: home }],
//   },
// };

export const Route = createFileRoute("/_root/_routes/_main/about")({
	component: HomePage,
	head: () => ({
		meta: [
			{
				title: "Taalaash - About",
			},
			{
				name: "description",
				content:
					"Taalaash is a tool to quickly find references for exam questions, saving you hundreds of hours.",
			},
			{
				property: "og:title",
				content: "Taalaash - About",
			},
			{
				property: "og:description",
				content:
					"Taalaash is a tool to quickly find references for exam questions, saving you hundreds of hours.",
			},
			{
				property: "og:image",
				content: home,
			},
			{
				property: "og:url",
				content: "https://taalaash.com/about",
			},
		],
	}),
});
