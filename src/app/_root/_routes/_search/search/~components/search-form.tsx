import { motion } from "framer-motion";
import { Camera, Mic } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useClickAway } from "@uidotdev/usehooks";

import { Button, buttonVariants } from "@/components/ui/button";
import { useSearchStore, useStore } from "@/hooks/use-search-history";
import { cn } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";

async function getOCR(formData: FormData) {
	const url = new URL("/image-to-text", process.env.NEXT_PUBLIC_OCR_URL);
	const response = await fetch(url, {
		method: "POST",
		body: formData,
	});
	const { text } = await response.json();
	return text as string;
}

export default function SearchForm() {
	const searchParams = useSearch({
		from: "/_root/_routes/_search/search/",
		shouldThrow: false,
	});
	const [inputValue, setInputValue] = useState(searchParams?.query ?? "");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const history = useStore(useSearchStore, (store) => store.history);
	const navigate = useNavigate();
	const inputRef = useRef<HTMLInputElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const popupRef = useClickAway<HTMLUListElement>(() => {
		setShowSuggestions(false);
	});

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	const handleSuggestionClick = (suggestion: string) => {
		console.log("clicked suggestion", suggestion);
		setInputValue(suggestion);
		navigate({ to: `/search?query=${suggestion}` });
	};

	const onImageSearch = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const { files } = event.target;
			if (files && files.length > 0) {
				const file = files[0];
				const formData = new FormData();
				formData.append("file", file);
				const text = await getOCR(formData);
				const query = text.replace(/\n/g, " ").slice(0, 128);
				setInputValue(query);
				navigate({ to: `/search?query=${encodeURIComponent(query)}` });
			}
		},
		[navigate],
	);

	const filteredHistory = useMemo(
		() =>
			history?.filter((suggestion) =>
				suggestion.toLowerCase().includes(inputValue.toLowerCase()),
			),
		[inputValue, history],
	);

	const onSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			console.log(event.isDefaultPrevented());

			const { action } = event.currentTarget;
			// useSearchStore.getState().saveHistory(inputValue);
			console.log("Submitting search with input:", action);

			navigate({ to: "/search", search: { query: inputValue } });
		},
		[inputValue, navigate],
	);

	return (
		<form method="get" action="/search" onSubmit={onSubmit}>
			<div className="relative w-full mx-auto">
				<div className="relative flex items-center w-full h-12 rounded-full bg-white border border-gray-300 focus-within:border-gray-400 transition-colors">
					<input
						placeholder="Search..."
						autoComplete="off"
						aria-autocomplete="none"
						className="flex-1 bg-transparent text-sm px-4 py-3 placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						type="search"
						name="query"
						value={inputValue}
						onChange={handleChange}
						ref={inputRef}
						onFocus={() => setShowSuggestions(true)}
					/>

					{/* Microphone Button */}
					<Button
						size="icon"
						variant="ghost"
						className="w-10 h-10 rounded-full mr-1 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
						type="button"
						title="Voice search"
					>
						<Mic className="h-5 w-5" />
					</Button>

					{/* Camera Button */}
					<Button
						size="icon"
						variant="ghost"
						className="w-10 h-10 rounded-full mr-2 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
						type="button"
						onClick={() => fileInputRef.current?.click()}
						title="Search by image"
					>
						<Camera className="h-5 w-5" />
						<input
							type="file"
							id="image-search"
							ref={fileInputRef}
							accept="image/jpeg,image/png"
							className="hidden"
							multiple={false}
							onChange={onImageSearch}
						/>
					</Button>
				</div>

				{showSuggestions && filteredHistory && filteredHistory.length > 0 && (
					<motion.ul
						ref={popupRef}
						className="absolute top-full left-0 mt-2 w-full border border-gray-200 bg-white rounded-xl z-[1200]"
					>
						{filteredHistory.map((suggestion) => (
							<motion.li
								key={suggestion}
								className={cn(
									buttonVariants({
										size: "lg",
										variant: "ghost",
										className:
											"w-full cursor-pointer text-left justify-stretch rounded-none first:rounded-t-xl last:rounded-b-xl hover:bg-gray-50",
									}),
								)}
								onClick={() => handleSuggestionClick(suggestion)}
							>
								{suggestion}
							</motion.li>
						))}
					</motion.ul>
				)}
			</div>
		</form>
	);
}
