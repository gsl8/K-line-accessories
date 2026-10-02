import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search, Menu, X, Instagram, Lock } from 'lucide-react';
import { Logo } from './Logo';
import { SearchOverlay } from './SearchOverlay';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useStore } from '../contexts/StoreContext';
import { generalWhatsappLink, instagramProfileLink } from '../utils/contact';

const navLinks = [
{ label: 'Shop', to: '/shop' },
{ label: 'New in', to: '/shop' }];


export function Header() {
  const { settings } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-shell border-b border-ink/10">
        <div className="relative flex items-center justify-between h-16 md:h-20 px-5 md:px-10 lg:px-14">
          <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
              `text-[10px] uppercase tracking-[0.2em] transition-colors ${
              isActive ? 'text-ink' : 'text-ink/70 hover:text-ink'}`

              }>
              
                {link.label}
              </NavLink>
            )}
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden text-ink"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}>
            
            {menuOpen ? <X size={20} strokeWidth={1.2} /> : <Menu size={20} strokeWidth={1.2} />}
          </button>

          <div className="absolute left-1/2 -translate-x-1/2">
            <Logo />
          </div>

          <div className="flex items-center gap-4 md:gap-6 text-ink">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hover:opacity-55 transition-opacity">
              
              <Search size={17} strokeWidth={1.2} />
            </button>
            <a
              href={instagramProfileLink(settings)}
              target="_blank"
              rel="noreferrer"
              aria-label="K-Line Accessories on Instagram"
              className="hidden md:block hover:opacity-55 transition-opacity">
              
              <Instagram size={17} strokeWidth={1.2} />
            </a>
            <a
              href={generalWhatsappLink(settings)}
              target="_blank"
              rel="noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="hover:opacity-55 transition-opacity">
              
              <WhatsAppIcon size={17} />
            </a>
            <Link
              to="/admin"
              aria-label="Admin login"
              title="Admin login"
              className="hover:opacity-55 transition-opacity">
              
              <Lock size={16} strokeWidth={1.2} />
            </Link>
          </div>
        </div>

        {menuOpen &&
        <nav
          aria-label="Mobile"
          className="md:hidden border-t border-ink/10 bg-shell px-5 py-5 flex flex-col gap-4">
          
            <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="text-[11px] uppercase tracking-[0.2em] text-ink">
            
              Home
            </Link>
            <Link
            to="/shop"
            onClick={() => setMenuOpen(false)}
            className="text-[11px] uppercase tracking-[0.2em] text-ink">
            
              Shop
            </Link>
            <a
            href={instagramProfileLink(settings)}
            target="_blank"
            rel="noreferrer"
            onClick={() => setMenuOpen(false)}
            className="text-[11px] uppercase tracking-[0.2em] text-ink">
            
              Instagram
            </a>
            <Link
            to="/admin"
            onClick={() => setMenuOpen(false)}
            className="text-[11px] uppercase tracking-[0.2em] text-ink/60">
            
              Admin login
            </Link>
          </nav>
        }
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>);

}