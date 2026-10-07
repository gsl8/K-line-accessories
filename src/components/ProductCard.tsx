import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { formatRwf } from '../utils/money';
import { SoldOutBadge } from './SoldOutBadge';

interface ProductCardProps {
  product: Product;
  aspect?: string;
}

const statusBadge: Record<Product['status'], { label: string; className: string } | null> = {
  available: null,
  sold_out: null,
  hidden: { label: 'Hidden', className: 'bg-ink/60 text-white' }
};

export function ProductCard({
  product,
  aspect = 'aspect-[4/5]'
}: ProductCardProps) {
  const badge = statusBadge[product.status];
  const soldOut = product.status === 'sold_out';

  return (
    <article className="group">
      <Link to={`/product/${product.id}`} className="block">
        <div className={`relative overflow-hidden bg-white ${aspect}`}>
          {product.images[0] ?
          <img
            src={product.images[0]}
            alt={product.name}
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${soldOut ? 'opacity-70' : ''}`}
            loading="lazy" /> :

          <div className="flex h-full w-full items-center justify-center bg-shell text-[9px] uppercase tracking-[0.2em] text-ink/35">
            No image
          </div>
          }

          {soldOut ?
          <SoldOutBadge className="absolute top-3 left-3" /> :
          badge &&
          <span className={`absolute top-3 left-3 text-[8px] uppercase tracking-[0.2em] px-2 py-1 ${badge.className}`}>
              {badge.label}
            </span>
          }
          {!soldOut &&
          <span className="absolute inset-x-0 bottom-0 bg-ink text-white text-[9px] uppercase tracking-[0.26em] py-3 text-center translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0 transition-transform duration-300">
              View details
            </span>
          }
        </div>

        <div className="pt-3">
          <h3 className="text-[10px] uppercase tracking-[0.16em] text-ink">
            {product.name}
          </h3>
          <p className="text-[10px] text-ink/45 mt-1">{product.material || product.category}</p>
          <p className="text-[11px] text-ink mt-2">
            {soldOut ? <span className="text-ink/45">{formatRwf(product.price)} — Sold out</span> : <>{formatRwf(product.price)}</>}
          </p>
        </div>
      </Link>
    </article>
  );
}
