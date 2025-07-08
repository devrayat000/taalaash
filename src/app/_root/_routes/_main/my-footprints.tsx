import { createFileRoute } from "@tanstack/react-router";
import {
	FootprintsIcon,
	EyeIcon,
	SearchIcon,
	BookmarkIcon,
	ClockIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Mock data for user activity
const recentActivity = [
	{
		id: 1,
		type: "search",
		action: "Searched for",
		content: "what is the power house of a cell?",
		timestamp: "2024-01-20T10:30:00Z",
		results: 45,
	},
	{
		id: 2,
		type: "bookmark",
		action: "Bookmarked",
		content: "Biology First Paper - Chapter 2",
		timestamp: "2024-01-20T09:15:00Z",
	},
	{
		id: 3,
		type: "view",
		action: "Viewed",
		content: "Formula of Nitric oxide",
		timestamp: "2024-01-19T16:45:00Z",
		duration: "3 min",
	},
	{
		id: 4,
		type: "search",
		action: "Searched for",
		content: "What is Ozonolysis?",
		timestamp: "2024-01-19T14:20:00Z",
		results: 23,
	},
	{
		id: 5,
		type: "view",
		action: "Viewed",
		content: "Chemistry Second Paper - Chapter 5",
		timestamp: "2024-01-19T11:10:00Z",
		duration: "7 min",
	},
];

const stats = [
	{ label: "Total Searches", value: 147, icon: SearchIcon },
	{ label: "Pages Viewed", value: 89, icon: EyeIcon },
	{ label: "Bookmarks", value: 23, icon: BookmarkIcon },
	{ label: "Study Time", value: "48h", icon: ClockIcon },
];

function getActivityIcon(type: string) {
	switch (type) {
		case "search":
			return SearchIcon;
		case "bookmark":
			return BookmarkIcon;
		case "view":
			return EyeIcon;
		default:
			return ClockIcon;
	}
}

function getActivityColor(type: string) {
	switch (type) {
		case "search":
			return "text-blue-500";
		case "bookmark":
			return "text-yellow-500";
		case "view":
			return "text-green-500";
		default:
			return "text-gray-500";
	}
}

function formatTimeAgo(timestamp: string) {
	const date = new Date(timestamp);
	const now = new Date();
	const diffInHours = Math.floor(
		(now.getTime() - date.getTime()) / (1000 * 60 * 60),
	);

	if (diffInHours < 1) {
		return "Just now";
	} else if (diffInHours < 24) {
		return `${diffInHours}h ago`;
	} else {
		const diffInDays = Math.floor(diffInHours / 24);
		return `${diffInDays}d ago`;
	}
}

function MyFootprintsPage() {
	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			<div className="space-y-6">
				{/* Page Header */}
				<div className="flex items-center gap-3">
					<FootprintsIcon className="h-6 w-6 text-[#00B894]" />
					<h1 className="text-2xl font-bold">My Footprints</h1>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{stats.map((stat) => {
						const Icon = stat.icon;
						return (
							<Card key={stat.label}>
								<CardContent className="p-4 text-center">
									<Icon className="h-6 w-6 text-[#00B894] mx-auto mb-2" />
									<div className="text-2xl font-bold">{stat.value}</div>
									<div className="text-xs text-muted-foreground">
										{stat.label}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Recent Activity */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ClockIcon className="h-5 w-5 text-[#00B894]" />
							Recent Activity
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{recentActivity.map((activity, index) => {
							const Icon = getActivityIcon(activity.type);
							const colorClass = getActivityColor(activity.type);

							return (
								<div key={activity.id}>
									<div className="flex items-start gap-3">
										<div className={`p-2 rounded-full bg-muted ${colorClass}`}>
											<Icon className="h-4 w-4" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<span className="text-sm font-medium">
													{activity.action}
												</span>
												<Badge variant="outline" className="text-xs capitalize">
													{activity.type}
												</Badge>
											</div>
											<p className="text-sm text-foreground mb-1 line-clamp-2">
												{activity.content}
											</p>
											<div className="flex items-center gap-4 text-xs text-muted-foreground">
												<span>{formatTimeAgo(activity.timestamp)}</span>
												{activity.results && (
													<span>{activity.results} results</span>
												)}
												{activity.duration && (
													<span>{activity.duration} reading time</span>
												)}
											</div>
										</div>
									</div>
									{index < recentActivity.length - 1 && (
										<Separator className="mt-4" />
									)}
								</div>
							);
						})}
					</CardContent>
				</Card>

				{/* Study Insights */}
				<Card>
					<CardHeader>
						<CardTitle>Study Insights</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<h4 className="font-medium text-sm">Most Searched Subjects</h4>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm">Biology</span>
										<Badge variant="secondary">45%</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Chemistry</span>
										<Badge variant="secondary">30%</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Physics</span>
										<Badge variant="secondary">25%</Badge>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="font-medium text-sm">Study Streak</h4>
								<div className="text-center py-4">
									<div className="text-3xl font-bold text-[#00B894]">7</div>
									<div className="text-sm text-muted-foreground">
										days in a row
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/_root/_routes/_main/my-footprints")({
	component: MyFootprintsPage,
});
