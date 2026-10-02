import React from 'react';
import { SectionHeading } from './SectionHeading';
import { ProductCard } from './ProductCard';
import { useStore } from '../contexts/StoreContext';

export function NewArrivals() {
  const { products } = useStore();
  const items = products.filter((p) => p.isNew).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section id="new-arrivals" className="bg-paper">
      <SectionHeading title="New arrivals" to="/shop" />
      <div className="px-6 md:px-10 lg:px-14 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-9 md:gap-x-6">
        {items.map((product) =>
        <ProductCard key={product.id} product={product} />
        )}
      </div>
    </section>);

}