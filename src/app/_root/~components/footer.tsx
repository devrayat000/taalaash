import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Footer(
  props: React.ComponentPropsWithoutRef<"footer">
) {
  return (
    <footer
      {...props}
      className={cn(
        "w-full px-4 md:px-16 grid place-items-center h-10 md:h-16 bg-background text-slate-500",
        props.className
      )}
    >
      <div className="flex justify-between items-center w-full">
        <p className="text-xs">&copy; 2024 | Biology Haters</p>
        <p className="text-xs">
          Developed by{" "}
          <a
            href="https://www.facebook.com/rayat.ass"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({
                variant: "link",
                className: "text-slate-500 text-xs p-0 underline",
              })
            )}
          >
            @Zul Ikram
          </a>
        </p>
      </div>
    </footer>
  );
}
