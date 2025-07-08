import { Link } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const popularSearches = [
	"what is the power house of a cell?",
	"What is Ozonolysis?",
	"Formula of Nitric oxide",
	"Acid - Base Neutralisation",
	"Grasshopper",
	"জিন কোনিং কাকে বলে?",
	"What is the structure of cellulose?",
	"মহাকাশীয় তুরণ কি?",
	"Kepler's law of planetary motion",
	"চন্দ্রগুপ্ত ব্যাসার্ক কাকে বলে?",
];

export default function PopularSearches() {
	return (
		<div className="w-full space-y-4">
			<div className="flex items-center gap-2 text-muted-foreground">
				<TrendingUp className="h-4 w-4" />
				<span className="text-sm font-medium">Popular Search</span>
			</div>

			<div className="flex flex-wrap gap-2">
				{popularSearches.map((search) => (
					<Link
						key={search}
						to="/search"
						search={{ query: search }}
						className="inline-block"
					>
						<Button
							variant="outline"
							size="sm"
							className="h-auto px-3 py-2 text-xs md:text-sm bg-background hover:bg-muted/50 border-muted-foreground/20 text-foreground/70 hover:text-foreground transition-colors"
						>
							{search}
						</Button>
					</Link>
				))}
			</div>
		</div>
	);
}
