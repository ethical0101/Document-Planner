"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const COVER_OPTIONS = [1, 2, 3, 4, 5, 6].map((n) => `/Assets/coverImages/cover${n}.jpg`);

function CoverPicker({ children, setNewCover }) {
  const [selectedCover, setSelectedCover] = useState();

  return (
    <Dialog>
      <DialogTrigger className="block w-full">{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Cover</DialogTitle>
          <DialogDescription>Choose a cover image.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {COVER_OPTIONS.map((imageUrl, index) => (
            <button
              type="button"
              key={imageUrl}
              onClick={() => setSelectedCover(imageUrl)}
              aria-pressed={selectedCover === imageUrl}
              className={`p-1 rounded-md border-2 ${
                selectedCover === imageUrl ? "border-primary" : "border-transparent"
              }`}
            >
              <Image
                src={imageUrl}
                width={200}
                height={140}
                className="w-full h-[70px] rounded-sm object-cover"
                alt={`Cover ${index + 1}`}
              />
            </button>
          ))}
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="button"
              disabled={!selectedCover}
              onClick={() => setNewCover(selectedCover)}
            >
              Update
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CoverPicker;
