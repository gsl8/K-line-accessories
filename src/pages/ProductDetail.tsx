import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Truck, Sparkles, ShieldCheck } from 'lucide-react';
import { ProductGallery } from '../components/ProductGallery';
import { ContactActions } from '../components/ContactActions';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../contexts/StoreContext';
import { formatRwf } from '../utils/money';

const assurances = [
{
  icon: Truck,
  title: 'Delivery arranged personally',
  text: 'We confirm your address and timing over chat, then share tracking.'
},
{
  icon: Sparkles,
  title: 'Photos of your exact piece',
  text: 'Ask and we will send real shots before anything is packed.'
},
{
  icon: ShieldCheck,
  title: 'Personal service',
  text: 'Questions about sizing, care or delivery — we reply personally over chat.'
}];


export function ProductDetail() {
  const { id = '' } = useParams();
  const { products, getProduct, loading } = useStore();
  const product = getProduct(id);
  const [size, setSize] = useState<string>('');

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setSize('');
  }, [id]);

  if (loading) {
    return <main className="bg-paper min-h-screen px-6 md:px-14 py-32 text-center text-[10px] uppercase tracking-[0.2em] text-ink/50">Loading product…</main>;
  }

  if (!product) {
    return (
      <main className="bg-paper min-h-screen px-6 md:px-14 py-32 text-center">
        <h1 className="text-[22px] uppercase tracking-[0.14em] font-light text-ink">
          Product not found
        </h1>
        <p className="mt-3 text-[12px] text-ink/60">
          It may no longer be available.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-block text-[10px] uppercase tracking-[0.22em] border-b border-ink pb-0.5 text-ink">
          
          Back to shop
        </Link>
      </main>);

  }

  const related = products.
  filter((p) => p.id !== product.id && p.category === product.category).
  slice(0, 4);

  return (
    <main className="bg-paper min-h-screen">
      <nav
        aria-label="Breadcrumb"
        className="px-6 md:px-10 lg:px-14 pt-6 pb-4 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-ink/50">
        
        <Link to="/" className="hover:text-ink">
          Home
        </Link>
        <ChevronRight size={11} strokeWidth={1.3} />
        <Link to="/shop" className="hover:text-ink">
          Shop
        </Link>
        <ChevronRight size={11} strokeWidth={1.3} />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="px-6 md:px-10 lg:px-14 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 pb-16">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:pt-4">
          <p className="text-[9px] uppercase tracking-[0.24em] text-ink/45">
            {product.category}
          </p>
          <h1 className="mt-3 text-[24px] md:text-[32px] uppercase tracking-[0.08em] font-light text-ink leading-[1.2]">
            {product.name}
          </h1>
          <p className="mt-4 text-[16px] text-ink">{formatRwf(product.price)}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-ink/45">
            {product.material}
            {product.status === 'sold_out' ? ' · Sold out' : ' · Available'}
          </p>
          {product.status === 'sold_out' &&
          <p className="mt-3 inline-block bg-ink text-white text-[9px] uppercase tracking-[0.2em] px-3 py-1.5">
              Sold out
            </p>
          }

          <p className="mt-7 text-[12px] leading-[1.9] text-ink/75 max-w-prose">
            {product.description}
          </p>

          {product.highlights.length > 0 &&
          <ul className="mt-6 space-y-2">
              {product.highlights.map((item) =>
            <li
              key={item}
              className="flex gap-2.5 text-[11px] leading-[1.7] text-ink/70">
              
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/50" />
                  {item}
                </li>
            )}
            </ul>
          }

          {product.sizes.length > 0 &&
          <fieldset className="mt-8">
              <legend className="text-[9px] uppercase tracking-[0.22em] text-ink/50 mb-3">
                Size
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((option) =>
              <button
                key={option}
                type="button"
                onClick={() => setSize(option === size ? '' : option)}
                aria-pressed={option === size}
                className={`h-10 w-10 text-[11px] border transition-colors ${
                option === size ?
                'bg-ink text-white border-ink' :
                'border-ink/25 text-ink hover:border-ink'}`
                }>
                
                    {option}
                  </button>
              )}
              </div>
              <p className="mt-2 text-[10px] text-ink/45">
                Not sure? Ask us — we&rsquo;ll help you choose the right one.
              </p>
            </fieldset>
          }

          <div className="mt-9">
            <ContactActions product={product} size={size || undefined} />
            <p className="mt-3 text-[10px] leading-[1.7] text-ink/45">
              Your message arrives with the piece, size and reference already
              filled in. No account, no online payment — we arrange everything
              in chat.
            </p>
          </div>

          <dl className="mt-10 border-t border-ink/15">
            {product.specs.map((spec) =>
            <div
              key={spec.label}
              className="flex justify-between gap-6 border-b border-ink/15 py-3">
              
                <dt className="text-[10px] uppercase tracking-[0.16em] text-ink/50">
                  {spec.label}
                </dt>
                <dd className="text-[11px] text-ink text-right">{spec.value}</dd>
              </div>
            )}
          </dl>

          <ul className="mt-10 grid sm:grid-cols-3 gap-6">
            {assurances.map(({ icon: Icon, title, text }) =>
            <li key={title}>
                <Icon size={16} strokeWidth={1.2} className="text-ink" />
                <h2 className="mt-2.5 text-[10px] uppercase tracking-[0.16em] text-ink">
                  {title}
                </h2>
                <p className="mt-1 text-[10px] leading-[1.7] text-ink/55">
                  {text}
                </p>
              </li>
            )}
          </ul>
        </div>
      </div>

      {related.length > 0 &&
      <section className="px-6 md:px-10 lg:px-14 pb-24">
          <h2 className="text-[16px] md:text-[20px] uppercase tracking-[0.14em] font-light text-ink pb-8">
            More in {product.category}
            <span className="text-ink/40">//</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-9 md:gap-x-6">
            {related.map((item) =>
          <ProductCard key={item.id} product={item} />
          )}
          </div>
        </section>
      }
    </main>);

}