"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PostTable } from "@/server/post/service";

import { create } from "zustand";

type PostInfo = {
  imageUrl: PostTable["imageUrl"];
  book: {
    name: PostTable["book"]["name"];
  };
  chapter: {
    name: PostTable["book"]["name"];
  };
};

type PopupState = {
  isOpen: boolean;
  open: (data: PostInfo) => void;
  close: () => void;
  onChange: (open: boolean) => void;
  popupData: PostInfo | null;
};

export const usePopup = create<PopupState>((set) => ({
  isOpen: false,
  popupData: null,
  open: (data) => set({ isOpen: true, popupData: data }),
  close: () => set({ isOpen: false, popupData: null }),
  onChange: (open) => set({ isOpen: open, popupData: null }),
}));

export const PopupProvider = () => {
  const popupStore = usePopup();
  const post = popupStore.popupData;

  return (
    <Dialog
      open={popupStore.isOpen}
      onOpenChange={(open) => !open && popupStore.close()}
      modal
      // modal
    >
      <DialogContent
        forceMount
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-[3/4]"
      >
        {popupStore.isOpen && !!post && (
          <img
            src={post.imageUrl!}
            alt={post.book.name}
            className="rounded-inherit object-cover"
            fill
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
