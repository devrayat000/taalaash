"use client";

import { useState } from "react";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/modals/alert-modal";
import { toast } from "@/components/ui/use-toast";

import type { ChapterColumn } from "./columns";
import { deleteChapter } from "@/server/chapter/action/chapter";

interface CellActionProps {
	data: ChapterColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);

	const deleteMutation = useMutation({
		mutationFn: () => deleteChapter({ data: { id: data.id } }),
		onSuccess: () => {
			toast({ description: "Chapter deleted." });
			queryClient.invalidateQueries({ queryKey: ["chapters"] });
			setOpen(false);
		},
		onError: () => {
			toast({
				description:
					"Make sure you removed all products using this chapter first.",
				variant: "destructive",
			});
		},
	});

	const onConfirm = () => {
		deleteMutation.mutate();
	};

	const onCopy = (id: string) => {
		navigator.clipboard.writeText(id);
		toast({ description: "Chapter ID copied to clipboard." });
	};

	return (
		<>
			<AlertModal
				isOpen={open}
				onClose={() => setOpen(false)}
				onConfirm={onConfirm}
				loading={deleteMutation.isPending}
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
						onClick={() => navigate({ to: `/admin/chapters/${data.id}` })}
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
