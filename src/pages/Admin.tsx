import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft, Lock, LogOut, Copy, Search } from 'lucide-react';
import { ProductForm, emptyProduct } from '../components/admin/ProductForm';
import { SettingsForm } from '../components/admin/SettingsForm';
import { ChangePasswordForm } from '../components/admin/ChangePasswordForm';
import { useStore } from '../contexts/StoreContext';
import { api } from '../lib/api';
import { formatRwf } from '../utils/money';
import type { Product, ProductStatus } from '../types/product';

type Tab = 'products' | 'settings';
type StatusFilter = 'all' | ProductStatus;
type SortKey = 'newest' | 'name' | 'price-asc' | 'price-desc';

const statusMeta: Record<ProductStatus, { label: string; badge: string; hint: string }> = {
  available: { label: 'Available', badge: 'border border-ink/35 text-ink/70', hint: 'Live in the store — ordering enabled' },
  sold_out: { label: 'Sold out', badge: 'bg-ink text-white', hint: 'Visible with a Sold out badge — ordering disabled' },
  hidden: { label: 'Hidden', badge: 'border border-dashed border-ink/40 text-ink/50', hint: 'Not visible anywhere in the store' }
};



export function Admin() {
  const { settings, updateSettings } = useStore();
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState<Tab>('products');

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('newest');

  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    api.me().then((me) => setAuthenticated(me.authenticated)).catch(() => setAuthenticated(false)).finally(() => setAuthLoading(false));
  }, []);

  const refreshList = useCallback(async () => {
    try {
      setAllProducts(await api.adminProducts());
      setActionError('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not load products');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) void refreshList();
  }, [authenticated, refreshList]);

  const visible = useMemo(() => {
    let list = [...allProducts];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.name, p.reference, p.category, p.material, p.id].some((v) => v?.toLowerCase().includes(q))
      );
    }
    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter);
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter);
    if (sortKey === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortKey === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sortKey === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [allProducts, query, categoryFilter, statusFilter, sortKey]);

  async function runAction(action: () => Promise<unknown>, notice: string) {
    setActionError(''); setActionNotice('');
    try {
      await action();
      await refreshList();
      setActionNotice(notice);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed');
    }
  }

  if (authLoading) return <main className="min-h-screen bg-paper flex items-center justify-center text-[11px] uppercase tracking-[0.2em] text-ink/55">Checking session…</main>;

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center px-6">
        <form onSubmit={async (e) => {
          e.preventDefault(); setAuthError('');
          try { await api.login(email, password); setAuthenticated(true); setPassword(''); }
          catch (err) { setAuthError(err instanceof Error ? err.message : 'Could not sign in'); }
        }} className="w-full max-w-sm border border-ink/15 bg-shell/60 p-8">
          <Lock size={18} strokeWidth={1.2} className="text-ink" />
          <h1 className="mt-4 text-[16px] uppercase tracking-[0.16em] font-light text-ink">Shop admin</h1>
          <p className="mt-2 text-[11px] text-ink/55 leading-[1.7]">Sign in to manage products and store contact details.</p>
          <label htmlFor="admin-email" className="block mt-6 text-[9px] uppercase tracking-[0.2em] text-ink/55 mb-1.5">Email or username</label>
          <input id="admin-email" type="text" autoComplete="username" required value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-white border border-ink/20 px-3 py-2 text-[12px] text-ink focus:outline-none focus:border-ink" />
          <label htmlFor="admin-password" className="block mt-4 text-[9px] uppercase tracking-[0.2em] text-ink/55 mb-1.5">Password</label>
          <input id="admin-password" type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full bg-white border border-ink/20 px-3 py-2 text-[12px] text-ink focus:outline-none focus:border-ink" />
          {authError && <p role="alert" className="mt-2 text-[11px] text-red-700">{authError}</p>}
          <button type="submit" className="mt-6 w-full bg-ink text-white text-[10px] uppercase tracking-[0.22em] py-3 hover:bg-ink/85 transition-colors">Sign in</button>
          <Link to="/" className="mt-5 inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-ink/50 hover:text-ink"><ArrowLeft size={12} />Back to store</Link>
        </form>
      </main>
    );
  }

  const formOpen = creating || editing !== null;
  const counts = {
    total: allProducts.length,
    available: allProducts.filter((p) => p.status === 'available').length,
    soldOut: allProducts.filter((p) => p.status === 'sold_out').length,
    hidden: allProducts.filter((p) => p.status === 'hidden').length
  };

  return (
    <main className="min-h-screen bg-paper px-6 md:px-10 lg:px-14 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-ink/15">
        <div>
          <h1 className="text-[22px] md:text-[28px] uppercase tracking-[0.12em] font-light text-ink">Shop admin <span className="text-ink/40">//</span></h1>
          <p className="mt-2 text-[11px] text-ink/55">
            {listLoading ? 'Loading products…' : `${counts.total} products · ${counts.available} available · ${counts.soldOut} sold out · ${counts.hidden} hidden`}
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-ink border-b border-ink pb-0.5"><ArrowLeft size={12}/>View store</Link>
          <button onClick={async()=>{await api.logout(); setAuthenticated(false);}} className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-ink/60"><LogOut size={12}/>Sign out</button>
        </div>
      </header>

      <nav className="flex gap-2 py-6">
        {([['products','Products'],['settings','Store settings']] as const).map(([value,text]) =>
          <button key={value} onClick={()=>setTab(value)} className={`text-[9px] uppercase tracking-[0.2em] px-5 py-2.5 border ${tab===value?'bg-ink text-white border-ink':'border-ink/25 text-ink/70'}`}>{text}</button>
        )}
      </nav>

      {(actionError || actionNotice) &&
        <p className={`mb-4 text-[11px] ${actionError ? 'text-red-700' : 'text-ink/70'}`} role={actionError ? 'alert' : 'status'}>
          {actionError || actionNotice}
        </p>
      }

      {tab === 'settings' ?
        <>
          <SettingsForm settings={settings} onSave={async (next)=>{setActionError('');try{await updateSettings(next);setActionNotice('Store settings saved.');}catch(e){setActionError(e instanceof Error?e.message:'Could not save settings');throw e}}} />
          <ChangePasswordForm />
        </> :
        formOpen ?
        <ProductForm
          initial={editing ?? emptyProduct}
          isNewRecord={creating}
          onSave={async (product)=>{
            setActionError('');
            try {
              const existing = allProducts.some((p) => p.id === product.id);
              if (existing) await api.updateProduct(product.id, product, []);
              else await api.createProduct(product);
              await refreshList();
              setEditing(null); setCreating(false);
              setActionNotice(existing ? `Saved “${product.name}”.` : `Created “${product.name}”.`);
            } catch (e) {
              setActionError(e instanceof Error ? e.message : 'Could not save product');
              throw e;
            }
          }}
          onCancel={()=>{setEditing(null);setCreating(false)}} /> :
        <ProductsPanel
          products={visible}
          total={allProducts.length}
          loading={listLoading}
          query={query} onQuery={setQuery}
          categoryFilter={categoryFilter} onCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter} onStatusFilter={setStatusFilter}
          sortKey={sortKey} onSortKey={setSortKey}
          onCreate={()=>{setCreating(true);setEditing(null)}}
          onEdit={(p)=>{setEditing(p);setCreating(false)}}
          onDuplicate={(p)=>runAction(()=>api.duplicateProduct(p.id), `Duplicated “${p.name}” — the copy is hidden until you publish it.`)}
          onStatus={(p, status)=>runAction(()=>api.setProductStatus(p.id, status), `“${p.name}” is now ${statusMeta[status].label.toLowerCase()}.`)}
          onDelete={(p)=>runAction(async()=>{await api.deleteProduct(p.id); setConfirmId(null);}, `Deleted “${p.name}”.`)}
          confirmId={confirmId} onConfirmId={setConfirmId}
        />}
    </main>
  );
}

interface ProductsPanelProps {
  products: Product[];
  total: number;
  loading: boolean;
  query: string; onQuery: (v: string) => void;
  categoryFilter: string; onCategoryFilter: (v: string) => void;
  statusFilter: StatusFilter; onStatusFilter: (v: StatusFilter) => void;
  sortKey: SortKey; onSortKey: (v: SortKey) => void;
  onCreate: () => void;
  onEdit: (p: Product) => void;
  onDuplicate: (p: Product) => void;
  onStatus: (p: Product, status: ProductStatus) => void;
  onDelete: (p: Product) => void;
  confirmId: string | null;
  onConfirmId: (id: string | null) => void;
}

function ProductsPanel({
  products, total, loading, query, onQuery, categoryFilter, onCategoryFilter,
  statusFilter, onStatusFilter, sortKey, onSortKey,
  onCreate, onEdit, onDuplicate, onStatus, onDelete, confirmId, onConfirmId
}: ProductsPanelProps) {
  const selectCls = 'bg-white border border-ink/20 px-2.5 py-2 text-[10px] uppercase tracking-[0.12em] text-ink focus:outline-none focus:border-ink';
  const { settings } = useStore();
  // Editable settings categories plus any category already used on a product.
  const categories = Array.from(new Set([
    ...settings.categories.filter(Boolean),
    ...products.map((p) => p.category).filter(Boolean)
  ]));

  return (
    <section>
      <div className="flex flex-wrap items-center gap-3 pb-5">
        <button onClick={onCreate} className="inline-flex items-center gap-2 bg-ink text-white text-[10px] uppercase tracking-[0.22em] px-6 py-3 hover:bg-ink/85 transition-colors"><Plus size={14}/>Add product</button>

        <label className="relative ml-auto">
          <span className="sr-only">Search products</span>
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={query}
            onChange={(e)=>onQuery(e.target.value)}
            placeholder="Search name, SKU, category…"
            className="w-56 bg-white border border-ink/20 pl-8 pr-3 py-2 text-[11px] text-ink placeholder:text-ink/35 focus:outline-none focus:border-ink" />
        </label>

        <select aria-label="Filter by category" value={categoryFilter} onChange={(e)=>onCategoryFilter(e.target.value)} className={selectCls}>
          {categories.map((c) => <option key={c || 'all'} value={c}>{c || 'All categories'}</option>)}
        </select>

        <select aria-label="Filter by status" value={statusFilter} onChange={(e)=>onStatusFilter(e.target.value as StatusFilter)} className={selectCls}>
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="sold_out">Sold out</option>
          <option value="hidden">Hidden</option>
        </select>

        <select aria-label="Sort products" value={sortKey} onChange={(e)=>onSortKey(e.target.value as SortKey)} className={selectCls}>
          <option value="newest">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="price-asc">Price low–high</option>
          <option value="price-desc">Price high–low</option>
        </select>
      </div>

      {loading ?
        <p className="py-10 text-[12px] text-ink/55">Loading products…</p> :
        products.length === 0 ?
        <div className="border border-dashed border-ink/25 py-16 text-center">
          <p className="text-[12px] uppercase tracking-[0.18em] text-ink/60">{total === 0 ? 'No products yet' : 'No products match these filters'}</p>
          {total === 0 && <p className="mt-2 text-[11px] text-ink/45">Use “Add product” to create your first item with photos, price and category.</p>}
        </div> :
        <ul className="border-t border-ink/15">
          {products.map((product) => {
            const meta = statusMeta[product.status];
            return (
              <li key={product.id} className="flex flex-wrap items-center gap-4 border-b border-ink/15 py-4">
                {product.images[0] ?
                  <img src={product.images[0]} alt="" className="h-16 w-16 object-cover shrink-0 bg-shell border border-ink/10" /> :
                  <div className="h-16 w-16 shrink-0 bg-shell border border-ink/10 flex items-center justify-center text-[8px] uppercase tracking-[0.14em] text-ink/35">No image</div>
                }
                <div className="min-w-0 flex-1 basis-52">
                  <h2 className="text-[11px] uppercase tracking-[0.14em] text-ink truncate">{product.name}</h2>
                  <p className="text-[10px] text-ink/50 mt-1 truncate">
                    {product.category} · {formatRwf(product.price)}
                    {product.compareAtPrice ? <span className="ml-1 line-through text-ink/35">{formatRwf(product.compareAtPrice)}</span> : null}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className={`text-[8px] uppercase tracking-[0.15em] px-1.5 py-0.5 ${meta.badge}`}>{meta.label}</span>
                    {product.isNew && <Tag>New arrival</Tag>}
                    {product.isBestseller && <Tag>Bestseller</Tag>}
                    <Tag>{product.images.length} {product.images.length === 1 ? 'photo' : 'photos'}</Tag>
                  </div>
                </div>
                {confirmId === product.id ?
                  <div className="flex gap-2">
                    <button onClick={()=>onDelete(product)} className="text-[9px] uppercase tracking-[0.18em] bg-ink text-white px-4 py-2">Delete</button>
                    <button onClick={()=>onConfirmId(null)} className="text-[9px] uppercase tracking-[0.18em] border border-ink/25 px-4 py-2">Keep</button>
                  </div> :
                  <div className="flex flex-wrap items-center gap-2">
                    {product.status !== 'available' &&
                      <button onClick={()=>onStatus(product, 'available')} className="text-[8px] uppercase tracking-[0.15em] border border-ink/20 px-2.5 py-1.5 text-ink/70 hover:border-ink hover:text-ink transition-colors">Mark available</button>}
                    {product.status !== 'sold_out' &&
                      <button onClick={()=>onStatus(product, 'sold_out')} className="text-[8px] uppercase tracking-[0.15em] border border-ink/20 px-2.5 py-1.5 text-ink/70 hover:border-ink hover:text-ink transition-colors">Sold out</button>}
                    {product.status !== 'hidden' &&
                      <button onClick={()=>onStatus(product, 'hidden')} className="text-[8px] uppercase tracking-[0.15em] border border-ink/20 px-2.5 py-1.5 text-ink/70 hover:border-ink hover:text-ink transition-colors">Hide</button>}
                    <button aria-label={`Edit ${product.name}`} onClick={()=>onEdit(product)} className="h-8 w-8 flex items-center justify-center border border-ink/20 text-ink/70 hover:text-ink hover:border-ink"><Pencil size={13}/></button>
                    <button aria-label={`Duplicate ${product.name}`} onClick={()=>onDuplicate(product)} className="h-8 w-8 flex items-center justify-center border border-ink/20 text-ink/70 hover:text-ink hover:border-ink"><Copy size={13}/></button>
                    <button aria-label={`Delete ${product.name}`} onClick={()=>onConfirmId(product.id)} className="h-8 w-8 flex items-center justify-center border border-ink/20 text-ink/70 hover:text-ink hover:border-ink"><Trash2 size={13}/></button>
                  </div>
                }
              </li>
            );
          })}
        </ul>}
    </section>
  );
}

function Tag({children}:{children:React.ReactNode}) { return <span className="text-[8px] uppercase tracking-[0.15em] border border-ink/15 px-1.5 py-0.5 text-ink/50">{children}</span>; }
