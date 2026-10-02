import React from 'react';
import { Instagram } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useStore } from '../contexts/StoreContext';
import type { Product } from '../types/product';
import {
  buildEnquiryMessage,
  instagramDmLink,
  whatsappLink } from
'../utils/contact';

interface ContactActionsProps {
  product: Product;
  size?: string;
  layout?: 'stacked' | 'row';
}

export function ContactActions({
  product,
  size,
  layout = 'stacked'
}: ContactActionsProps) {
  const { settings } = useStore();
  const soldOut = product.status === 'sold_out';

  if (soldOut) {
    return (
      <div className="flex flex-col gap-3">
        <p className="inline-flex items-center justify-center bg-ink/90 text-white text-[10px] uppercase tracking-[0.24em] py-4 px-6">
          Sold out — message us to be notified when it returns
        </p>
        <a
          href={instagramDmLink(settings)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2.5 border border-ink text-ink text-[10px] uppercase tracking-[0.24em] py-4 px-6 hover:bg-ink hover:text-white transition-colors">

          <Instagram size={15} strokeWidth={1.4} />
          Message on Instagram
        </a>
      </div>);

  }

  const message = buildEnquiryMessage(product, settings, size);

  return (
    <div
      className={
      layout === 'row' ?
      'flex flex-col sm:flex-row gap-3' :
      'flex flex-col gap-3'
      }>

      <a
        href={whatsappLink(settings, message)}
        target="_blank"
        rel="noreferrer"
        className="flex-1 inline-flex items-center justify-center gap-2.5 bg-ink text-white text-[10px] uppercase tracking-[0.24em] py-4 px-6 hover:bg-ink/85 transition-colors">

        <WhatsAppIcon size={15} />
        Order on WhatsApp
      </a>
      <a
        href={instagramDmLink(settings)}
        target="_blank"
        rel="noreferrer"
        className="flex-1 inline-flex items-center justify-center gap-2.5 border border-ink text-ink text-[10px] uppercase tracking-[0.24em] py-4 px-6 hover:bg-ink hover:text-white transition-colors">

        <Instagram size={15} strokeWidth={1.4} />
        Message on Instagram
      </a>
    </div>);

}
