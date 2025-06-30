import findIndex from "lodash/findIndex";
import compact from "lodash/compact";

export interface ChangedOrderItem {
  id: string;
  serial: number;
}

export default function getChangedOrderItems<Type extends ChangedOrderItem>(
  original: Type[],
  reordered: Type[]
): ChangedOrderItem[] {
  const changedItems = compact(
    reordered.map((item, newIndex) => {
      const originalIndex = findIndex(original, { id: item.id } as any);
      if (originalIndex !== newIndex) {
        return { id: item.id, serial: newIndex };
      }
      return null;
    })
  );

  return changedItems;
}
