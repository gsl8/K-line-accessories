import React from 'react';
import { Instagram } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useStore } from '../contexts/StoreContext';
import { generalWhatsappLink, instagramDmLink } from '../utils/contact';

export function ContactBanner() {
  const { settings } = useStore();

  return (
    <section className="bg-shell" aria-label="Talk to us">
      <div className="px-6 md:px-10 lg:px-14 py-16 md:py-24 max-w-lg">
        <h2 className="text-[20px] md:text-[28px] uppercase tracking-[0.1em] font-light text-ink">
          Let&rsquo;s talk pieces
        </h2>
        <p className="mt-3 text-[11px] leading-[1.8] text-ink/75 max-w-sm">
          No checkout, no accounts. Send us the piece you like on WhatsApp or
          Instagram and we&rsquo;ll confirm availability and delivery personally.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <a
            href={generalWhatsappLink(settings)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2.5 bg-ink text-white text-[10px] uppercase tracking-[0.24em] px-8 py-3.5 hover:bg-ink/85 transition-colors">
            
            <WhatsAppIcon size={15} />
            WhatsApp us
          </a>
          <a
            href={instagramDmLink(settings)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2.5 border border-ink text-ink text-[10px] uppercase tracking-[0.24em] px-8 py-3.5 hover:bg-ink hover:text-white transition-colors">
            
            <Instagram size={15} strokeWidth={1.4} />
            Instagram DM
          </a>
        </div>
      </div>
    </section>
  );
}
