// import { cn } from "@/lib/utils";
// import { forwardRef } from "react";

// export type ContributorItem = {
//   id: string;
//   imageUrl: string;
// };

// export interface ItemProps
//   extends Omit<React.HTMLAttributes<HTMLDivElement>, "id">,
//     ContributorItem {}

// const Item = forwardRef<HTMLDivElement, ItemProps>(
//   ({ id, imageUrl, ...props }, ref) => {
//     return (
//       <div
//         {...props}
//         ref={ref}
//         className={cn(
//           "aspect-video rounded-lg border border-border bg-slate-700 grid place-items-center text-3xl font-bold text-red-600",
//           props.className
//         )}
//       >
//         <img src={imageUrl} alt="Random Image" className="rounded-inherit" />
//       </div>
//     );
//   }
// );
// Item.displayName = "ContributorItem";
// export default Item;
