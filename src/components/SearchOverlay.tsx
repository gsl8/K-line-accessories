import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { SoldOutBadge } from './SoldOutBadge';
import { useStore } from '../contexts/StoreContext';
import { formatRwf } from '../utils/money';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const { products } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.
    filter((p) =>
    [p.name, p.category, p.material, p.reference].some((field) =>
    field.toLowerCase().includes(q)
    )
    ).
    slice(0, 6);
  }, [products, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-ink/30 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      onClick={onClose}>
      
      <div
        className="bg-paper w-full px-6 md:px-10 lg:px-14 pt-8 pb-10"
        onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center gap-4 border-b border-ink/25 pb-3">
          <Search size={18} strokeWidth={1.2} className="text-ink/60" />
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <input
            id="site-search"
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="flex-1 bg-transparent text-[15px] md:text-[20px] font-light tracking-[0.04em] text-ink placeholder:text-ink/35 focus:outline-none" />
          
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="text-ink hover:opacity-60 transition-opacity">
            
            <X size={20} strokeWidth={1.2} />
          </button>
        </div>

        {query.trim() &&
        <div className="pt-6">
            {results.length === 0 ?
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink/50">
                No products match &ldquo;{query}&rdquo;
              </p> :

          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {results.map((product) =>
            <li key={product.id}>
                    <Link
                to={`/product/${product.id}`}
                onClick={onClose}
                className="group block">
                
                      <div className="relative">
                <img
                  src={product.images[0]}
                  alt=""
                  className="aspect-square w-full object-cover" />
                {product.status === 'sold_out' &&
                <SoldOutBadge className="absolute top-2 left-2" />
                }
                      </div>
                
                      <p className="pt-2 text-[10px] uppercase tracking-[0.14em] text-ink group-hover:opacity-60 transition-opacity">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-ink/45">{formatRwf(product.price)}</p>
                    </Link>
                  </li>
            )}
              </ul>
          }
          </div>
        }
      </div>
    </div>);

}