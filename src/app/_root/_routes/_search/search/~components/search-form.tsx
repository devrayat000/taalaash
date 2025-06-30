import { motion } from "framer-motion";
import { Camera, Search } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useClickAway } from "@uidotdev/usehooks";

import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    document.activeElement !== inputRef.current && setShowSuggestions(false);
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
    [navigate]
  );

  const filteredHistory = useMemo(
    () =>
      history?.filter((suggestion) =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase())
      ),
    [inputValue, history]
  );

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const { action } = event.currentTarget;
      useSearchStore.getState().saveHistory(inputValue);
      navigate({ to: `${action}?query=${inputValue}` });
    },
    [inputValue, navigate]
  );

  return (
    <form role="search" method="get" action="/search" onSubmit={onSubmit}>
      <div className="flex items-center gap-2 px-2">
        <div className="relative z-[1200] isolate px-4 flex flex-1 h-12 w-full rounded-full border border-input bg-input py-2 text-sm items-center justify-between gap-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Questions or keywords..."
            autoComplete="off"
            aria-autocomplete="none"
            className="flex-1 bg-transparent text-sm p-0 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            type="search"
            name="query"
            value={inputValue}
            onChange={handleChange}
            ref={inputRef}
            onFocus={() => setShowSuggestions(true)}
          />

          <Button
            size="icon"
            variant="ghost"
            className="w-9 h-9 rounded-full -mr-2"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-5 w-5 text-muted-foreground" />
            {/* <input {...getInputProps()} /> */}
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

          {showSuggestions && filteredHistory && filteredHistory.length > 0 && (
            <motion.ul
              ref={popupRef}
              className="absolute top-full left-0 mt-1 w-full shadow z-[1200] rounded-lg border border-border bg-background"
            >
              {filteredHistory.map((suggestion, index) => (
                <motion.li
                  key={index}
                  className={cn(
                    buttonVariants({
                      size: "lg",
                      variant: "ghost",
                      className:
                        "w-full cursor-pointer text-left justify-stretch",
                    })
                  )}
                  role="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>

        <Button
          type="submit"
          size="icon"
          className="hidden md:inline-flex w-12 h-12 rounded-full bg-card-result hover:bg-card-result/90"
          variant="default"
          title="Search"
        >
          <span className="sr-only">Search</span>
          <Search className="h-6 w-6 text-white" />
        </Button>
      </div>
    </form>
  );
}
