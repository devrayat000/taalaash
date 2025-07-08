import { createFileRoute } from "@tanstack/react-router";
import { HistoryIcon, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

// Mock data - in real app this would come from a store/database
const recentSearches = [
	"what is the power house of a cell?",
	"What is Ozonolysis?",
	"Formula of Nitric oxide",
	"Acid - Base Neutralisation",
	"Grasshopper",
];

const popularSearches = [
	"জিন কোনিং কাকে বলে?",
	"What is the structure of cellulose?",
	"মহাকাশীয় তুরণ কি?",
	"Kepler's law of planetary motion",
	"চন্দ্রগুপ্ত ব্যাসার্ক কাকে বলে?",
];

function SearchHistoryPage() {
	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			<div className="space-y-6">
				{/* Page Header */}
				<div className="flex items-center gap-3">
					<HistoryIcon className="h-6 w-6 text-[#00B894]" />
					<h1 className="text-2xl font-bold">Search History</h1>
				</div>

				{/* Recent Search Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Clock className="h-5 w-5 text-muted-foreground" />
							Recent Search
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{recentSearches.length > 0 ? (
							<div className="space-y-2">
								{recentSearches.map((search) => (
									<Link
										key={search}
										to="/search"
										search={{ query: search }}
										className="block"
									>
										<Button
											variant="ghost"
											className="w-full justify-start h-auto p-3 text-left hover:bg-muted/50"
										>
											<div className="flex items-center gap-3 w-full">
												<HistoryIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
												<span className="flex-1 text-sm">{search}</span>
											</div>
										</Button>
									</Link>
								))}
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground">
								<HistoryIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
								<p>No recent searches found</p>
								<p className="text-sm">
									Start searching to see your history here
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Popular Search Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<TrendingUp className="h-5 w-5 text-muted-foreground" />
							Popular Search
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{popularSearches.map((search) => (
								<Link
									key={search}
									to="/search"
									search={{ query: search }}
									className="block"
								>
									<Button
										variant="ghost"
										className="w-full justify-start h-auto p-3 text-left hover:bg-muted/50"
									>
										<div className="flex items-center gap-3 w-full">
											<TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
											<span className="flex-1 text-sm">{search}</span>
										</div>
									</Button>
								</Link>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Quick Action */}
				<div className="text-center">
					<Link to="/">
						<Button className="bg-[#00B894] hover:bg-[#00B894]/90">
							Start New Search
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/_root/_routes/_main/search-history")({
	component: SearchHistoryPage,
});
