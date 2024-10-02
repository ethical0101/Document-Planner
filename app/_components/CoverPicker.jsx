import React, { useState } from "react";
 
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image";
import { set } from "mongoose";

const CoverPicker = ({ children, setNewCover }) => {
  const [selectedCover, setSelectedCover] = useState();
  const CoverOption = [
    { imageUrl: "/Assets/coverImages/cover1.jpg" },
    { imageUrl: "/Assets/coverImages/cover2.jpg" },
    { imageUrl: "/Assets/coverImages/cover3.jpg" },
    { imageUrl: "/Assets/coverImages/cover4.jpg" },
    { imageUrl: "/Assets/coverImages/cover5.jpg" },
  ];

  return (
    <Dialog>
      <DialogTrigger className="w-full">{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Cover</DialogTitle>
          <DialogDescription>
            <div className="grid grid-cols-2 gap-5 mt-3 md:grid-cols-3 lg:grid-cols-4">
              {CoverOption.map((cover, index) => (
                <div onClick={()=>{setSelectedCover(cover?.imageUrl)}}
                className={`${selectedCover == cover?.imageUrl&&'border-primary border-2 rounded-sm'}`}>
                  <Image
                    src={cover?.imageUrl}
                    width={200}
                    height={140}
                    className="w-full h-[70px] rounded-sm object-cover cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </DialogDescription>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="button" onClick={()=>setNewCover(selectedCover)}>
                Update
              </Button>
              
            </DialogClose>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CoverPicker;
