import { createFileRoute } from "@tanstack/react-router";
import {
	FolderIcon,
	BookIcon,
	ImageIcon,
	FileTextIcon,
	DownloadIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for content
const books = [
	{
		id: 1,
		title: "জীববিজ্ঞান",
		subject: "Biology",
		edition: "First Paper",
		thumbnail: "/uploads/photo_2024-03-19_01-34-50.jpg",
		pages: 164,
		downloadCount: 1250,
	},
	{
		id: 2,
		title: "রসায়ন",
		subject: "Chemistry",
		edition: "Second Paper",
		thumbnail: "/uploads/photo_2024-03-19_01-43-36.jpg",
		pages: 198,
		downloadCount: 980,
	},
	{
		id: 3,
		title: "পদার্থবিজ্ঞান",
		subject: "Physics",
		edition: "First Paper",
		thumbnail: "/uploads/photo_2024-03-19_01-44-38.jpg",
		pages: 224,
		downloadCount: 1100,
	},
	{
		id: 4,
		title: "উচ্চতর গণিত",
		subject: "Math",
		edition: "First Paper",
		thumbnail: "/uploads/photo_2024-03-19_01-46-02.jpg",
		pages: 312,
		downloadCount: 1450,
	},
];

const subjects = ["All", "Biology", "Chemistry", "Physics", "Math"];

function ContentGalleryPage() {
	return (
		<div className="container mx-auto px-4 py-6 max-w-6xl">
			<div className="space-y-6">
				{/* Page Header */}
				<div className="flex items-center gap-3">
					<FolderIcon className="h-6 w-6 text-[#00B894]" />
					<h1 className="text-2xl font-bold">Content Gallery</h1>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-4 text-center">
							<BookIcon className="h-8 w-8 text-[#00B894] mx-auto mb-2" />
							<div className="text-2xl font-bold">150+</div>
							<div className="text-sm text-muted-foreground">Books</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4 text-center">
							<FileTextIcon className="h-8 w-8 text-[#00B894] mx-auto mb-2" />
							<div className="text-2xl font-bold">5,000+</div>
							<div className="text-sm text-muted-foreground">Pages</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4 text-center">
							<ImageIcon className="h-8 w-8 text-[#00B894] mx-auto mb-2" />
							<div className="text-2xl font-bold">25,000+</div>
							<div className="text-sm text-muted-foreground">Images</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4 text-center">
							<DownloadIcon className="h-8 w-8 text-[#00B894] mx-auto mb-2" />
							<div className="text-2xl font-bold">50,000+</div>
							<div className="text-sm text-muted-foreground">Downloads</div>
						</CardContent>
					</Card>
				</div>

				{/* Content Tabs */}
				<Tabs defaultValue="books" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="books">Books</TabsTrigger>
						<TabsTrigger value="recent">Recently Added</TabsTrigger>
						<TabsTrigger value="popular">Most Popular</TabsTrigger>
					</TabsList>

					<TabsContent value="books" className="space-y-4">
						{/* Subject Filter */}
						<div className="flex flex-wrap gap-2">
							{subjects.map((subject) => (
								<Button
									key={subject}
									variant={subject === "All" ? "default" : "outline"}
									size="sm"
									className={
										subject === "All"
											? "bg-[#00B894] hover:bg-[#00B894]/90"
											: ""
									}
								>
									{subject}
								</Button>
							))}
						</div>

						{/* Books Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{books.map((book) => (
								<Card
									key={book.id}
									className="hover:shadow-lg transition-shadow"
								>
									<div className="aspect-[3/4] bg-muted rounded-t-lg overflow-hidden">
										<img
											src={book.thumbnail}
											alt={book.title}
											className="w-full h-full object-cover"
										/>
									</div>
									<CardContent className="p-4">
										<div className="space-y-2">
											<Badge variant="secondary" className="text-xs">
												{book.subject}
											</Badge>
											<h3 className="font-semibold text-sm line-clamp-2">
												{book.title}
											</h3>
											<p className="text-xs text-muted-foreground">
												{book.edition}
											</p>
											<div className="flex justify-between items-center text-xs text-muted-foreground">
												<span>{book.pages} pages</span>
												<span>
													{book.downloadCount.toLocaleString()} downloads
												</span>
											</div>
											<Button
												size="sm"
												className="w-full bg-[#00B894] hover:bg-[#00B894]/90"
											>
												<DownloadIcon className="h-4 w-4 mr-2" />
												Download
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					<TabsContent value="recent" className="space-y-4">
						<div className="text-center py-12">
							<BookIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">
								Recently Added Content
							</h3>
							<p className="text-muted-foreground">
								New books and materials are added regularly. Check back soon!
							</p>
						</div>
					</TabsContent>

					<TabsContent value="popular" className="space-y-4">
						<div className="text-center py-12">
							<BookIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">
								Most Popular Content
							</h3>
							<p className="text-muted-foreground">
								Discover the most downloaded and viewed academic materials.
							</p>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/_root/_routes/_main/content-gallery")({
	component: ContentGalleryPage,
});
