import { createFileRoute } from "@tanstack/react-router";
import {
	TrendingUp,
	MenuIcon,
	BookmarkIcon,
	HistoryIcon,
	StarIcon,
	FolderIcon,
	ActivityIcon,
	SearchIcon,
	HomeIcon,
} from "lucide-react";
import logoSq from "@/assets/logo.png?url";
import SearchForm from "../_search/search/~components/search-form";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navigationItems = [
	{ href: "/", label: "Home", icon: HomeIcon },
	{ href: "/search", label: "Search", icon: SearchIcon },
	{ href: "/bookmarks", label: "Bookmarks", icon: BookmarkIcon },
	{ href: "/search-history", label: "Search History", icon: HistoryIcon },
	{ href: "/whats-new", label: "What's New?", icon: StarIcon },
	{ href: "/subscriptions", label: "Subscriptions", icon: FolderIcon },
	{ href: "/content-gallery", label: "Content Gallery", icon: FolderIcon },
	{ href: "/my-footprints", label: "My Footprints", icon: ActivityIcon },
];

const popularSearches = [
	"what is the power house of a cell?",
	"What is Ozonolysis?",
	"Grasshopper",
	"Formula of Nitric oxide",
	"What is C",
];

const mostSearchedBooks = [
	{
		id: 1,
		title: "জীববিজ্ঞান",
		subject: "Biology",
		image: "/public/uploads/photo_2024-03-19_01-34-50.jpg",
		color: "bg-blue-100",
	},
	{
		id: 2,
		title: "রসায়ন",
		subject: "Chemistry",
		image: "/public/uploads/photo_2024-03-19_01-43-36.jpg",
		color: "bg-green-100",
	},
	{
		id: 3,
		title: "পদার্থবিদ্যা",
		subject: "Physics",
		image: "/public/uploads/photo_2024-03-19_01-44-38.jpg",
		color: "bg-purple-100",
	},
	{
		id: 4,
		title: "গণিত",
		subject: "Math",
		image: "/public/uploads/photo_2024-03-19_01-46-02.jpg",
		color: "bg-orange-100",
	},
];

const premiumUsers = [
	{
		id: 1,
		name: "Razib H Sarkar",
		avatar: "/api/placeholder/40/40",
		subtitle: "Don't Believe everything you see",
		verified: true,
	},
	{
		id: 2,
		name: "Mushfique Hussain",
		avatar: "/api/placeholder/40/40",
		subtitle: "I'm the designer",
		verified: true,
	},
	{
		id: 3,
		name: "Abrar",
		avatar: "/api/placeholder/40/40",
		subtitle: "I'm B",
		verified: false,
	},
];

function LandingPage() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<div className="min-h-screen bg-white">
			{/* Main Content */}
			<div className="px-4 py-6 space-y-8 mt-16">
				{/* Logo Section */}
				<div className="flex justify-center">
					<div className="w-24 h-24 rounded-lg flex items-center justify-center">
						<img src={logoSq} alt="Logo" />
					</div>
				</div>

				{/* Search Form */}
				<div className="max-w-4xl mx-auto">
					<SearchForm />
				</div>

				{/* Popular Search Section */}
				<div className="max-w-3xl mx-auto">
					<div className="space-y-3">
						<div className="flex items-center justify-center space-x-2 text-gray-600 text-center">
							<TrendingUp className="h-4 w-4" />
							<span className="text-sm font-medium">Popular Search</span>
						</div>
						<div className="flex justify-center flex-wrap gap-2">
							{popularSearches.map((search) => (
								<Link key={search} to="/search" search={{ query: search }}>
									<Button
										variant="outline"
										size="sm"
										className="text-xs bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
									>
										{search}
									</Button>
								</Link>
							))}
						</div>
					</div>
				</div>

				{/* Most Searched Books */}
				<div className="space-y-4">
					<h2 className="text-center text-gray-600 font-medium">
						Most Searched Books
					</h2>
					<div className="grid grid-cols-4 gap-3">
						{mostSearchedBooks.map((book) => (
							<div key={book.id} className="text-center space-y-2">
								<div className="text-xs text-gray-500 font-medium">
									{book.subject}
								</div>
								<div
									className={`w-full aspect-[3/4] ${book.color} rounded-lg flex items-center justify-center shadow-sm`}
								>
									<div className="text-xs font-bold text-gray-700 p-2 text-center leading-tight">
										{book.title}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Premium Users */}
				<div className="space-y-4">
					<div className="flex items-center justify-center space-x-2">
						<h2 className="text-gray-600 font-medium">Premium Users</h2>
						<div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
							<span className="text-xs text-white">✓</span>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						{premiumUsers.map((user) => (
							<div key={user.id} className="text-center space-y-2">
								<Avatar className="w-12 h-12 mx-auto">
									<AvatarImage src={user.avatar} alt={user.name} />
									<AvatarFallback>
										{user.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div className="space-y-1">
									<div className="flex items-center justify-center space-x-1">
										<span className="text-sm font-medium text-gray-900">
											{user.name}
										</span>
										{user.verified && (
											<div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
												<span className="text-xs text-white">✓</span>
											</div>
										)}
									</div>
									<p className="text-xs text-gray-500 leading-tight">
										{user.subtitle}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function DrawerNav() {
	return (
		<div className="flex flex-col space-y-3">
			{/* Mobile Logo */}
			<Link to="/" className="flex items-center space-x-2 pb-4 border-b">
				<span className="font-bold text-xl text-[#00B894]">Taalaash</span>
			</Link>

			{/* Mobile Navigation Links */}
			<div className="flex flex-col space-y-3">
				{navigationItems.map((item) => (
					<Link
						key={item.href}
						to={item.href}
						className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-foreground/60"
					>
						<item.icon className="h-5 w-5" />
						<span>{item.label}</span>
					</Link>
				))}
			</div>
		</div>
	);
}

export const Route = createFileRoute("/_root/_routes/_main/")({
	component: LandingPage,
});
