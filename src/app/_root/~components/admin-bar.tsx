import { Link } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";

export default function AdminBar() {
	const { data } = useSession();

	// Check if user is admin (you'll need to adjust this based on your user structure)
	const isAdmin = data?.user?.role === "admin";

	if (!isAdmin) {
		return null;
	}

	return (
		<div className="bg-gray-900 text-white text-sm border-b border-gray-700">
			<div className="container max-w-screen-2xl mx-auto px-4">
				<div className="flex items-center h-8">
					<span className="text-gray-300">
						You are an admin, you can go to the{" "}
					</span>
					<Link
						to="/admin"
						className="text-white font-medium hover:text-gray-300 transition-colors ml-1"
					>
						dashboard
					</Link>
				</div>
			</div>
		</div>
	);
}
