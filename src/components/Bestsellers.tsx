import React from 'react';
import { SectionHeading } from './SectionHeading';
import { ProductCard } from './ProductCard';
import { useStore } from '../contexts/StoreContext';
import { bestsellersBlurb } from '../data/products';

export function Bestsellers() {
  const { products } = useStore();
  const items = products.filter((p) => p.isBestseller && p.status !== 'hidden').slice(0, 4);

  if (items.length === 0) return null;

  if (items.length < 4) {
    return (
      <section className="bg-paper">
        <SectionHeading title="Bestsellers" to="/shop" />
        <div className="px-6 md:px-10 lg:px-14 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-9 md:gap-x-6">
          {items.map((product) =>
          <ProductCard key={product.id} product={product} />
          )}
        </div>
      </section>);

  }

  const [first, second, third, fourth] = items;

  return (
    <section className="bg-paper">
      <SectionHeading title="Bestsellers" to="/shop" />
      <div className="px-6 md:px-10 lg:px-14 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-9 md:gap-x-6 items-start">
        <ProductCard product={first} aspect="aspect-[4/5]" />
        <ProductCard product={second} aspect="aspect-[3/4]" />
        <div className="flex flex-col gap-6">
          <p className="text-[11px] leading-[1.7] text-ink/70 max-w-[26ch]">
            {bestsellersBlurb}
          </p>
          <ProductCard product={third} aspect="aspect-[4/3]" />
        </div>
        <ProductCard product={fourth} aspect="aspect-[4/5]" />
      </div>
    </section>);

}
