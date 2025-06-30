// "use client";

// import { useMemo, useState } from "react";
// import {
//   closestCenter,
//   DndContext,
//   DragEndEvent,
//   DragOverlay,
//   DragStartEvent,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   arraySwap,
//   SortableContext,
//   sortableKeyboardCoordinates,
//   rectSwappingStrategy,
// } from "@dnd-kit/sortable";
// import { restrictToWindowEdges } from "@dnd-kit/modifiers";
// import findIndex from "lodash/findIndex";

// import SortableItem from "./SortableItem";
// import Item, { ContributorItem } from "./Item";
// import getChangedOrderItems, {
//   ChangedOrderItem,
// } from "@/lib/get-changed-order-items";

// export interface SorterProps {
//   items: (ContributorItem & ChangedOrderItem)[];
// }

// export default function Sorter({ items: userItems }: SorterProps) {
//   const [activeId, setActiveId] = useState<string | null>(null);
//   const [items, setItems] = useState(userItems);
//   const sensors = useSensors(
//     useSensor(PointerSensor),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   );

//   const activeItem = useMemo(() => {
//     return items.find((item) => item.id === activeId);
//   }, [activeId, items]);

//   return (
//     <DndContext
//       sensors={sensors}
//       collisionDetection={closestCenter}
//       onDragStart={handleDragStart}
//       onDragEnd={handleDragEnd}
//       modifiers={[restrictToWindowEdges]}
//     >
//       <SortableContext items={items} strategy={rectSwappingStrategy}>
//         {items.map((item) => (
//           <SortableItem key={item.imageUrl} {...item} />
//         ))}
//       </SortableContext>
//       <DragOverlay modifiers={[restrictToWindowEdges]}>
//         {activeItem ? (
//           <Item
//             id={activeItem.id}
//             imageUrl={activeItem.imageUrl}
//             className="opacity-70"
//           />
//         ) : null}
//       </DragOverlay>
//     </DndContext>
//   );

//   function handleDragStart(event: DragStartEvent) {
//     const { active } = event;

//     setActiveId(active.id.toString());
//   }

//   function handleDragEnd(event: DragEndEvent) {
//     const { active, over } = event;

//     if (active.id !== over?.id) {
//       const oldIndex = findIndex(items, { id: active.id.toString() });
//       const newIndex = findIndex(items, { id: over!.id.toString() });

//       const swappedItems = arraySwap(items, oldIndex, newIndex);

//       const changed = getChangedOrderItems(items, swappedItems);

//       setItems(swappedItems);
//     }

//     setActiveId(null);
//   }
// }
