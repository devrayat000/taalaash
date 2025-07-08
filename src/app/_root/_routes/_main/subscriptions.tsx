import { createFileRoute } from "@tanstack/react-router";
import { CreditCardIcon, CheckIcon, CrownIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock subscription plans
const plans = [
	{
		id: "free",
		name: "Free",
		price: 0,
		currency: "৳",
		period: "month",
		description: "Perfect for getting started",
		features: [
			"50 searches per month",
			"Basic search results",
			"Limited bookmarks (10)",
			"Standard support",
		],
		limitations: [
			"No OCR image search",
			"No advanced filters",
			"No priority support",
		],
		current: true,
		popular: false,
	},
	{
		id: "premium",
		name: "Premium",
		price: 299,
		currency: "৳",
		period: "month",
		description: "Most popular for serious students",
		features: [
			"Unlimited searches",
			"Advanced search results",
			"Unlimited bookmarks",
			"OCR image search",
			"Advanced filters",
			"Priority support",
			"Download PDFs",
			"Study analytics",
		],
		limitations: [],
		current: false,
		popular: true,
	},
	{
		id: "student",
		name: "Student Plus",
		price: 199,
		currency: "৳",
		period: "month",
		description: "Special price for students",
		features: [
			"Unlimited searches",
			"Advanced search results",
			"Unlimited bookmarks",
			"OCR image search",
			"Advanced filters",
			"Study groups access",
			"Offline downloads",
		],
		limitations: [],
		current: false,
		popular: false,
		badge: "50% OFF",
	},
];

const currentUsage = {
	searches: 34,
	maxSearches: 50,
	bookmarks: 7,
	maxBookmarks: 10,
};

function SubscriptionsPage() {
	return (
		<div className="container mx-auto px-4 py-6 max-w-6xl">
			<div className="space-y-8">
				{/* Page Header */}
				<div className="text-center space-y-4">
					<div className="flex items-center justify-center gap-3">
						<CreditCardIcon className="h-6 w-6 text-[#00B894]" />
						<h1 className="text-2xl font-bold">Subscriptions</h1>
					</div>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						Choose the plan that fits your study needs. Upgrade anytime to
						unlock more features.
					</p>
				</div>

				{/* Current Usage (for free users) */}
				<Card>
					<CardHeader>
						<CardTitle>Current Usage</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div>
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm">Monthly Searches</span>
									<span className="text-sm font-medium">
										{currentUsage.searches}/{currentUsage.maxSearches}
									</span>
								</div>
								<div className="w-full bg-muted rounded-full h-2">
									<div
										className="bg-[#00B894] h-2 rounded-full"
										style={{
											width: `${(currentUsage.searches / currentUsage.maxSearches) * 100}%`,
										}}
									></div>
								</div>
							</div>

							<div>
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm">Bookmarks</span>
									<span className="text-sm font-medium">
										{currentUsage.bookmarks}/{currentUsage.maxBookmarks}
									</span>
								</div>
								<div className="w-full bg-muted rounded-full h-2">
									<div
										className="bg-[#00B894] h-2 rounded-full"
										style={{
											width: `${(currentUsage.bookmarks / currentUsage.maxBookmarks) * 100}%`,
										}}
									></div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Subscription Plans */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{plans.map((plan) => (
						<Card
							key={plan.id}
							className={`relative ${plan.popular ? "ring-2 ring-[#00B894]" : ""} ${plan.current ? "bg-muted/20" : ""}`}
						>
							{plan.popular && (
								<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
									<Badge className="bg-[#00B894] text-white">
										Most Popular
									</Badge>
								</div>
							)}

							{plan.badge && (
								<div className="absolute -top-3 right-4">
									<Badge variant="destructive">{plan.badge}</Badge>
								</div>
							)}

							<CardHeader className="text-center pb-4">
								<div className="space-y-2">
									{plan.id === "premium" && (
										<CrownIcon className="h-8 w-8 text-[#00B894] mx-auto" />
									)}
									<CardTitle className="text-xl">{plan.name}</CardTitle>
									<div className="space-y-1">
										<div className="text-3xl font-bold">
											{plan.currency}
											{plan.price}
											{plan.price > 0 && (
												<span className="text-lg font-normal text-muted-foreground">
													/{plan.period}
												</span>
											)}
										</div>
										<p className="text-sm text-muted-foreground">
											{plan.description}
										</p>
									</div>
								</div>
							</CardHeader>

							<CardContent className="space-y-4">
								<div className="space-y-3">
									{plan.features.map((feature) => (
										<div key={feature} className="flex items-center gap-3">
											<CheckIcon className="h-4 w-4 text-[#00B894] flex-shrink-0" />
											<span className="text-sm">{feature}</span>
										</div>
									))}
								</div>

								{plan.current ? (
									<Button className="w-full" variant="secondary" disabled>
										Current Plan
									</Button>
								) : (
									<Button
										className={`w-full ${plan.popular ? "bg-[#00B894] hover:bg-[#00B894]/90" : ""}`}
										variant={plan.popular ? "default" : "outline"}
									>
										{plan.price === 0 ? "Downgrade" : "Upgrade"}
									</Button>
								)}
							</CardContent>
						</Card>
					))}
				</div>

				{/* FAQ Section */}
				<Card>
					<CardHeader>
						<CardTitle>Frequently Asked Questions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-4">
							<div>
								<h4 className="font-medium text-sm mb-2">
									Can I change my plan anytime?
								</h4>
								<p className="text-sm text-muted-foreground">
									Yes, you can upgrade or downgrade your plan at any time.
									Changes will be reflected in your next billing cycle.
								</p>
							</div>

							<div>
								<h4 className="font-medium text-sm mb-2">
									What payment methods do you accept?
								</h4>
								<p className="text-sm text-muted-foreground">
									We accept bKash, Nagad, Rocket, and all major credit/debit
									cards.
								</p>
							</div>

							<div>
								<h4 className="font-medium text-sm mb-2">
									Is there a student discount?
								</h4>
								<p className="text-sm text-muted-foreground">
									Yes! Our Student Plus plan offers 50% off the Premium features
									for verified students.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/_root/_routes/_main/subscriptions")({
	component: SubscriptionsPage,
});
