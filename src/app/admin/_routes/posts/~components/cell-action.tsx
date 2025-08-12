import { useState } from "react";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/modals/alert-modal";

import type { PostColumn } from "./columns";
import { deletePostFn } from "@/server/post/function";
import { useNavigate } from "@tanstack/react-router";

interface CellActionProps {
	data: PostColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const onConfirm = async () => {
		try {
			setLoading(true);
			await deletePostFn(data.id);
			toast.success("Success", { description: "Post deleted." });
			navigate({ reloadDocument: true });
		} catch (error) {
			toast.error("Error", {
				description:
					"Make sure you removed all products using this size first.",
			});
		} finally {
			setOpen(false);
			setLoading(false);
		}
	};

	const onCopy = (id: string) => {
		toast.promise(navigator.clipboard.writeText(id), {
			success: "Post ID copied to clipboard.",
		});
	};

	return (
		<>
			<AlertModal
				isOpen={open}
				onClose={() => setOpen(false)}
				onConfirm={onConfirm}
				loading={loading}
			/>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem onClick={() => onCopy(data.id)}>
						<Copy className="mr-2 h-4 w-4" /> Copy Id
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() =>
							navigate({
								to: `/admin/posts/$postId`,
								params: { postId: data.id },
							})
						}
					>
						<Edit className="mr-2 h-4 w-4" /> Update
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setOpen(true)}>
						<Trash className="mr-2 h-4 w-4" /> Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};
