// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import Item, { ContributorItem } from "./Item";

// export interface SortableItemProps extends ContributorItem {}

// export default function SortableItem(props: SortableItemProps) {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: props.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <Item
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//       {...props}
//     >
//       {props.id}
//     </Item>
//   );
// }
