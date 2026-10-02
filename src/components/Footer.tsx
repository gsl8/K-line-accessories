import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MapPin } from 'lucide-react';
import { Logo } from './Logo';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useStore } from '../contexts/StoreContext';
import {
  generalWhatsappLink,
  instagramProfileLink } from
'../utils/contact';

export function Footer() {
  const { settings } = useStore();
  const categories = settings.categories.filter((c) => c.trim().length > 0);

  return (
    <footer className="bg-shell px-6 md:px-10 lg:px-14 pt-12 pb-8">
      <div className="pb-8">
        <Logo className="items-start" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        <nav aria-label="Shop">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink mb-3">
            Shop
          </h2>
          <ul className="space-y-1.5">
            <li>
              <Link to="/shop" className="text-[11px] text-ink/65 hover:text-ink transition-colors">
                All products
              </Link>
            </li>
            {categories.map((link) =>
            <li key={link}>
                <Link
                to={`/shop?category=${encodeURIComponent(link)}`}
                className="text-[11px] text-ink/65 hover:text-ink transition-colors">
                
                  {link}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink mb-3">
            Contact
          </h2>
          <ul className="space-y-2 text-[11px] text-ink/65">
            <li className="flex items-start gap-2">
              <WhatsAppIcon size={13} />
              <span>+{settings.whatsappNumber.replace(/\D/g, '')}</span>
            </li>
            <li className="flex items-start gap-2">
              <Instagram size={13} strokeWidth={1.3} className="mt-0.5 shrink-0" />
              <a href={instagramProfileLink(settings)} target="_blank" rel="noreferrer" className="hover:text-ink">
                @{settings.instagramHandle}
              </a>
            </li>
            {settings.location &&
            <li className="flex items-start gap-2">
                <MapPin size={13} strokeWidth={1.3} className="mt-0.5 shrink-0" />
                {settings.location}
              </li>
            }
          </ul>
        </div>

        <div className="col-span-2 md:col-span-2">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink mb-3">
            Ordering is a conversation
          </h2>
          <p className="text-[11px] leading-[1.7] text-ink/65">
            Tell us which piece caught your eye and we&rsquo;ll take care of the
            rest — availability, photos of the exact item, and delivery.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2 max-w-sm">
            <a
              href={generalWhatsappLink(settings)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-ink text-white text-[9px] uppercase tracking-[0.22em] py-3 px-6 hover:bg-ink/85 transition-colors">
              
              <WhatsAppIcon size={13} />
              WhatsApp
            </a>
            <a
              href={instagramProfileLink(settings)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-ink text-ink text-[9px] uppercase tracking-[0.22em] py-3 px-6 hover:bg-ink hover:text-white transition-colors">
              
              <Instagram size={13} strokeWidth={1.4} />
              @{settings.instagramHandle}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[9px] uppercase tracking-[0.16em] text-ink/45">
          &copy; All rights reserved. {settings.brandName}, {new Date().getFullYear()}
        </p>
        <Link
          to="/admin"
          className="text-[9px] uppercase tracking-[0.16em] text-ink/35 hover:text-ink transition-colors">
          
          Shop admin
        </Link>
      </div>
    </footer>
  );
}
