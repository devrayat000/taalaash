import { createFileRoute } from "@tanstack/react-router";
import { StarIcon, BookOpenIcon, TrendingUpIcon, BellIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Mock data for new features and updates
const newFeatures = [
	{
		id: 1,
		title: "Enhanced OCR Technology",
		description:
			"Improved image-to-text conversion with better accuracy for handwritten and printed text in Bengali and English.",
		date: "2024-01-15",
		type: "Feature",
		isNew: true,
	},
	{
		id: 2,
		title: "Advanced Search Filters",
		description:
			"New filtering options by subject, book edition, and chapter for more precise search results.",
		date: "2024-01-10",
		type: "Improvement",
		isNew: true,
	},
	{
		id: 3,
		title: "Dark Mode Support",
		description:
			"Switch between light and dark themes for a comfortable reading experience any time of day.",
		date: "2024-01-05",
		type: "Feature",
		isNew: false,
	},
	{
		id: 4,
		title: "Faster Search Results",
		description:
			"Optimized search algorithm delivers results 50% faster than before.",
		date: "2024-01-01",
		type: "Performance",
		isNew: false,
	},
];

const announcements = [
	{
		id: 1,
		title: "New Books Added",
		content:
			"We've added 50+ new academic books to our database, including the latest editions of popular science and mathematics textbooks.",
		date: "2024-01-20",
	},
	{
		id: 2,
		title: "Maintenance Schedule",
		content:
			"Scheduled maintenance on January 25th, 2024 from 2:00 AM to 4:00 AM. Service may be temporarily unavailable.",
		date: "2024-01-18",
	},
];

function WhatsNewPage() {
	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			<div className="space-y-6">
				{/* Page Header */}
				<div className="flex items-center gap-3">
					<StarIcon className="h-6 w-6 text-[#00B894]" />
					<h1 className="text-2xl font-bold">What's New?</h1>
				</div>

				{/* Announcements Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BellIcon className="h-5 w-5 text-[#00B894]" />
							Announcements
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{announcements.map((announcement) => (
							<div
								key={announcement.id}
								className="border-l-4 border-[#00B894] pl-4 py-2"
							>
								<h3 className="font-semibold text-sm">{announcement.title}</h3>
								<p className="text-sm text-muted-foreground mt-1">
									{announcement.content}
								</p>
								<span className="text-xs text-muted-foreground">
									{new Date(announcement.date).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</span>
							</div>
						))}
					</CardContent>
				</Card>

				{/* New Features Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUpIcon className="h-5 w-5 text-[#00B894]" />
							Recent Updates & Features
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{newFeatures.map((feature) => (
							<div
								key={feature.id}
								className="border rounded-lg p-4 hover:shadow-md transition-shadow"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<h3 className="font-semibold">{feature.title}</h3>
											{feature.isNew && (
												<Badge
													variant="secondary"
													className="bg-[#00B894]/10 text-[#00B894] text-xs"
												>
													NEW
												</Badge>
											)}
											<Badge variant="outline" className="text-xs">
												{feature.type}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground mb-2">
											{feature.description}
										</p>
										<span className="text-xs text-muted-foreground">
											{new Date(feature.date).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</span>
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				{/* Coming Soon Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpenIcon className="h-5 w-5 text-[#00B894]" />
							Coming Soon
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
								<div className="h-2 w-2 rounded-full bg-[#00B894]"></div>
								<span className="text-sm">Mobile app for iOS and Android</span>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
								<div className="h-2 w-2 rounded-full bg-[#00B894]"></div>
								<span className="text-sm">Advanced PDF annotation tools</span>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
								<div className="h-2 w-2 rounded-full bg-[#00B894]"></div>
								<span className="text-sm">Collaborative study groups</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Feedback Section */}
				<div className="text-center">
					<p className="text-sm text-muted-foreground mb-4">
						Have suggestions for new features or improvements?
					</p>
					<Button className="bg-[#00B894] hover:bg-[#00B894]/90">
						Send Feedback
					</Button>
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/_root/_routes/_main/whats-new")({
	component: WhatsNewPage,
});
