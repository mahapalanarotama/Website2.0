import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import React from "react";

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  alt?: string;
}

export default function ImagePreviewDialog({ open, onOpenChange, imageUrl, alt }: ImagePreviewDialogProps) {
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Fullscreen API
  const handleFullscreen = () => {
    if (imgRef.current && imgRef.current.requestFullscreen) {
      imgRef.current.requestFullscreen();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0 rounded-xl bg-black/90 flex flex-col items-center relative">
        <button
          className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow"
          onClick={() => onOpenChange(false)}
          aria-label="Tutup"
        >
          <X size={24} />
        </button>
        <div className="flex flex-col items-center w-full">
          <img
            ref={imgRef}
            src={imageUrl}
            alt={alt || "Preview"}
            className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain bg-black cursor-zoom-in"
            onClick={handleFullscreen}
            style={{ margin: 'auto' }}
          />
          <button
            className="mt-4 px-4 py-2 rounded bg-white/80 hover:bg-white text-black font-semibold shadow"
            onClick={handleFullscreen}
          >
            Perbesar / Fullscreen
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
