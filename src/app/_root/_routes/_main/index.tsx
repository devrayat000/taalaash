import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, MicIcon, CameraIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png?url";

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
		image:
			"https://images.unsplash.com/photo-1576086213369-97a306d36557?w=150&h=200&fit=crop&auto=format",
	},
	{
		id: 2,
		title: "রসায়ন",
		subject: "Chemistry",
		image:
			"https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=150&h=200&fit=crop&auto=format",
	},
	{
		id: 3,
		title: "পদার্থবিদ্যা",
		subject: "Physics",
		image:
			"https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=150&h=200&fit=crop&auto=format",
	},
	{
		id: 4,
		title: "উচ্চতর গণিত",
		subject: "Math",
		image:
			"https://images.unsplash.com/photo-1509228468518-180dd4864904?w=150&h=200&fit=crop&auto=format",
	},
];

const premiumUsers = [
	{
		id: 1,
		name: "Razib H Sarkar",
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face&auto=format",
		subtitle: "Don't Believe everything you see",
		verified: true,
	},
	{
		id: 2,
		name: "Mushfique Hussain",
		avatar:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face&auto=format",
		subtitle: "I'm the designer 😎",
		verified: true,
	},
	{
		id: 3,
		name: "Abrar",
		avatar:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face&auto=format",
		subtitle: "I'm B",
		verified: false,
	},
];

function LandingPage() {
	return (
		<div className="min-h-screen bg-white">
			{/* Main Content */}
			<div className="px-4 pb-20">
				{/* Logo Section */}
				<div className="flex justify-center pt-6 pb-4">
					<img src={logo} alt="Taalaash Logo" className="w-16 h-16" />
				</div>

				{/* Search Form */}
				<div className="max-w-sm mx-auto mb-6">
					<div className="relative">
						<Input
							placeholder="Search..."
							className="w-full h-11 rounded-full border-gray-300 pl-4 pr-16 text-sm"
						/>
						<div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
							<Button variant="ghost" size="sm" className="p-1 h-7 w-7">
								<MicIcon className="h-4 w-4 text-gray-400" />
							</Button>
							<Button variant="ghost" size="sm" className="p-1 h-7 w-7">
								<CameraIcon className="h-4 w-4 text-gray-400" />
							</Button>
						</div>
					</div>
				</div>

				{/* Popular Search Section */}
				<div className="max-w-sm mx-auto mb-6">
					<div className="space-y-3">
						<div className="flex items-center justify-center space-x-2 text-gray-500">
							<TrendingUp className="h-4 w-4" />
							<span className="text-sm">Popular Search</span>
						</div>
						<div className="flex flex-wrap gap-2 justify-center">
							{popularSearches.slice(0, 2).map((search) => (
								<Button
									key={search}
									variant="outline"
									size="sm"
									className="text-xs bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 h-7 rounded-full px-3 font-normal"
									asChild
								>
									<Link to="/search" search={{ query: search }}>
										{search}
									</Link>
								</Button>
							))}
						</div>
						<div className="flex justify-center">
							<Button
								variant="outline"
								size="sm"
								className="text-xs bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 h-7 rounded-full px-3 font-normal"
								asChild
							>
								<Link to="/search" search={{ query: popularSearches[2] }}>
									{popularSearches[2]}
								</Link>
							</Button>
						</div>
						<div className="flex flex-wrap gap-2 justify-center">
							{popularSearches.slice(3).map((search) => (
								<Button
									key={search}
									variant="outline"
									size="sm"
									className="text-xs bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 h-7 rounded-full px-3 font-normal"
									asChild
								>
									<Link to="/search" search={{ query: search }}>
										{search}
									</Link>
								</Button>
							))}
						</div>
					</div>
				</div>

				{/* Most Searched Books */}
				<div className="mb-6">
					<h2 className="text-center text-gray-500 text-sm mb-3">
						Most Searched Books
					</h2>
					<div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
						{mostSearchedBooks.map((book) => (
							<div key={book.id} className="text-center">
								<div className="text-xs text-gray-500 mb-1 font-normal">
									{book.subject}
								</div>
								<div className="w-full aspect-[3/4] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
									<img
										src={book.image}
										alt={book.title}
										className="w-full h-full object-cover"
									/>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Premium Users */}
				<div>
					<div className="flex items-center justify-center space-x-2 mb-3">
						<h2 className="text-gray-500 text-sm">Premium Users</h2>
						<div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
							<span className="text-xs text-white font-bold">✓</span>
						</div>
					</div>
					<div className="flex justify-center space-x-6 max-w-xs mx-auto">
						{premiumUsers.map((user) => (
							<div key={user.id} className="text-center flex-1">
								<Avatar className="w-14 h-14 mx-auto mb-1">
									<AvatarImage src={user.avatar} alt={user.name} />
									<AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
										{user.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div className="flex items-center justify-center space-x-1 mb-1">
									<span className="text-xs font-semibold text-gray-900 truncate max-w-16">
										{user.name.split(" ")[0]}
									</span>
									{user.verified && (
										<div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
											<span className="text-xs text-white font-bold">✓</span>
										</div>
									)}
								</div>
								<p className="text-xs text-gray-500 leading-tight max-w-20 mx-auto">
									{user.subtitle}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/_root/_routes/_main/")({
	component: LandingPage,
});
