import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';

export function Hero() {
  const { settings, products } = useStore();
  const [first, ...rest] = settings.tagline.split('.');
  // Product-focused hero: real product covers, never stock or people photos.
  const covers = products.slice(0, 3);

  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2 bg-shell"
      aria-label={`${settings.brandName}`}>
      
      <div className="order-2 md:order-1 flex flex-col items-center justify-center text-center px-8 py-16 md:py-24">
        <svg
          width="92"
          height="62"
          viewBox="0 0 92 62"
          fill="none"
          aria-hidden="true"
          className="mb-8 text-gold">
          
          <ellipse cx="36" cy="31" rx="26" ry="29" stroke="currentColor" strokeWidth="1.6" />
          <ellipse cx="56" cy="31" rx="26" ry="29" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <h1 className="text-[26px] md:text-[34px] lg:text-[40px] leading-[1.15] tracking-[0.06em] uppercase font-light text-ink">
          {first}.
          <br />
          {rest.join('.').trim()}
        </h1>
        {settings.categories.length > 0 &&
        <p className="mt-6 max-w-xs text-[11px] leading-[1.9] text-ink/60 uppercase tracking-[0.14em]">
          {settings.categories.slice(0, 4).join(' · ')}
        </p>
        }
        <Link
          to="/shop"
          className="mt-9 inline-flex items-center justify-center bg-ink text-white text-[10px] uppercase tracking-[0.28em] px-14 py-3.5 hover:bg-ink/85 transition-colors">
          
          Shop now
        </Link>
      </div>

      <div className="order-1 md:order-2 relative min-h-[380px] md:min-h-[620px] bg-paper">
        {covers.length > 0 ?
          <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1">
            <div className="flex flex-col gap-1">
              {covers.slice(0, 2).map((product) =>
              <img
                key={product.id}
                src={product.images[0]}
                alt={product.name}
                className="min-h-0 w-full flex-1 object-cover"
                loading="eager" />
              
              )}
            </div>
            {covers[2] &&
            <img
              src={covers[2].images[0]}
              alt={covers[2].name}
              className="h-full w-full object-cover"
              loading="eager" />
            
            }
          </div> :
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              width="180"
              height="122"
              viewBox="0 0 92 62"
              fill="none"
              aria-hidden="true"
              className="text-gold/60">
              
              <ellipse cx="36" cy="31" rx="26" ry="29" stroke="currentColor" strokeWidth="0.8" />
              <ellipse cx="56" cy="31" rx="26" ry="29" stroke="currentColor" strokeWidth="0.8" />
            </svg>
          </div>
        }
      </div>
    </section>
  );
}
