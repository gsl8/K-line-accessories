import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SoldOutBadge } from './SoldOutBadge';

interface ProductGalleryProps {
  images: string[];
  name: string;
  soldOut?: boolean;
}

export function ProductGallery({ images, name, soldOut = false }: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] w-full bg-shell flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-ink/40">
        No image yet
      </div>);

  }

  const go = (next: number) =>
  setActive((next + images.length) % images.length);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <ul className="flex md:flex-col gap-3 md:w-20 shrink-0 overflow-x-auto">
        {images.map((image, i) =>
        <li key={image + i} className="shrink-0">
            <button
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1} of ${name}`}
            aria-current={i === active}
            className={`block w-16 md:w-20 aspect-square overflow-hidden border transition-colors ${
            i === active ? 'border-ink' : 'border-transparent hover:border-ink/30'}`
            }>
            
              <img
              src={image}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy" />
            
            </button>
          </li>
        )}
      </ul>

      <div className="relative flex-1 bg-white overflow-hidden">
        <img
          src={images[active]}
          alt={`${name} — view ${active + 1}`}
          className="w-full aspect-[4/5] object-cover" />
        {soldOut &&
        <SoldOutBadge className="absolute top-3 left-3" />
        }

        {images.length > 1 &&
        <>
            <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center bg-white/80 text-ink hover:bg-white transition-colors">
            
              <ChevronLeft size={16} strokeWidth={1.3} />
            </button>
            <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center bg-white/80 text-ink hover:bg-white transition-colors">
            
              <ChevronRight size={16} strokeWidth={1.3} />
            </button>
            <span className="absolute bottom-3 right-3 bg-white/85 text-ink text-[9px] tracking-[0.18em] px-2 py-1">
              {active + 1} / {images.length}
            </span>
          </>
        }
      </div>
    </div>);

}