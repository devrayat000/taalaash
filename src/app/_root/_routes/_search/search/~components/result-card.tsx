"use client";

import { PostHit } from "@/server/post/service";
import BookmarkButton from "./bookmark";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePopup } from "@/providers/popup-provider";
import { useSearch } from "@tanstack/react-router";

export type ResultCardProps = Omit<PostHit, "text" | "keywords">;

export default function ResultCard(post: ResultCardProps) {
  const searchParams = useSearch({ from: "/_root/_routes/_search/search/" });
  return (
    <article className="rounded-2xl overflow-hidden shadow-lg">
      <div className="relative isolate aspect-[3/4] rounded-t-inherit border-border border">
        <img
          src={post.imageUrl!}
          alt={post.book.name}
          fill
          className="rounded-inherit object-cover"
        />
        {/* <BookmarkButton postId={post.objectID} /> */}
      </div>
      <div className="text-white bg-card-result px-3 py-2">
        <div className="grid grid-cols-2 gap-x-2 h-full">
          <div>
            <span className="block text-[0.5rem] leading-none">
              {post.book.edition} - Edition
            </span>
            <h6 className="text-xs leading-none mt-px">{post.book.name}</h6>
          </div>

          <p className="text-xs rounded-full leading-none justify-self-end">
            {post.chapter.name}
          </p>
        </div>
        <div className="mt-1 flex gap-x-2">
          <Button
            size="sm"
            variant="secondary"
            className="text-xs h-7 py-0.5 leading-none rounded-full w-full"
            title="Result image"
            onClick={() => usePopup.getState().open(post)}
          >
            Full Page
          </Button>
          <Button
            size="sm"
            variant="default"
            className="text-xs h-7 py-0.5 leading-none rounded-full w-full"
            title="Marked image"
            onClick={() =>
              usePopup.getState().open({
                ...post,
                imageUrl: `${
                  process.env.NEXT_PUBLIC_OCR_URL
                }/marked-image?q=${searchParams.get("query")}&post_id=${
                  post.objectID
                }`,
              })
            }
          >
            Highlighted
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ResultSkeleton() {
  return (
    <section className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
      {Array.from(new Array(12).keys()).map((index) => (
        <article key={index} className="rounded-2xl overflow-hidden shadow-lg">
          <Skeleton className="aspect-[3/4] rounded-t-inherit border-border border" />
          <div className="grid grid-cols-3 gap-x-2 h-full text-white bg-card-result px-3 py-2">
            <div>
              <Skeleton className="h-2" />
              <Skeleton className="h-6 mt-px" />
            </div>
            <Skeleton className="h-7 py-0.5 rounded-full" />
            <div>
              <Skeleton className="h-3 rounded-full" />
              <Skeleton className="h-3 rounded-full" />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
