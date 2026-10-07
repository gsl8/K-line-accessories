import React, { useRef, useState } from 'react';
import { Plus, Trash2, ArrowUp, Upload, Star, RefreshCw } from 'lucide-react';
import type { Product, ProductStatus, Spec } from '../../types/product';
import { api } from '../../lib/api';
import { useStore } from '../../contexts/StoreContext';

const statusOptions: { value: ProductStatus; label: string; hint: string }[] = [
{ value: 'available', label: 'Available', hint: 'Shown in the store, ordering enabled' },
{ value: 'sold_out', label: 'Sold out', hint: 'Shown with a Sold out badge, ordering disabled' },
{ value: 'hidden', label: 'Hidden', hint: 'Not shown anywhere in the store' }];

const label = 'block text-[9px] uppercase tracking-[0.2em] text-ink/55 mb-1.5';
const field =
'w-full bg-white border border-ink/20 px-3 py-2 text-[12px] text-ink focus:outline-none focus:border-ink';

const MAX_FILE_MB = 8;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const WEBP_QUALITY = 0.85;
const MAX_DIMENSION = 2000;

async function toWebp(file: File): Promise<File> {
  if (file.type === 'image/webp') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY));
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], name, { type: 'image/webp' });
  } catch {
    return file;
  }
}

function slugify(value: string) {
  return value.
  toLowerCase().
  trim().
  replace(/[^a-z0-9]+/g, '-').
  replace(/^-|-$/g, '');
}

export const emptyProduct: Product = {
  id: '',
  name: '',
  reference: '',
  category: '',
  price: 0,
  compareAtPrice: null,
  material: '',
  shortDescription: '',
  description: '',
  highlights: [],
  specs: [],
  sizes: [],
  images: [],
  status: 'available',
  isNew: false,
  isBestseller: false
};

interface ProductFormProps {
  initial: Product;
  isNewRecord: boolean;
  onSave: (product: Product) => void | Promise<void>;
  onCancel: () => void;
}

export function ProductForm({
  initial,
  isNewRecord,
  onSave,
  onCancel
}: ProductFormProps) {
  const { settings } = useStore();
  const [draft, setDraft] = useState<Product>(initial);
  const [pending, setPending] = useState<File[]>([]); // chosen files, uploaded on save
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<number | null>(null);

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function updateSpec(index: number, next: Partial<Spec>) {
    setDraft((prev) => {
      const specs = [...prev.specs];
      specs[index] = { ...specs[index], ...next };
      return { ...prev, specs };
    });
  }

  function pickFiles(replaceAt: number | null) {
    replaceTargetRef.current = replaceAt;
    fileInputRef.current?.click();
  }

  async function onFilesChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (chosen.length === 0) return;
    const bad: string[] = [];
    for (const file of chosen) {
      if (!ACCEPTED.includes(file.type)) bad.push(`${file.name}: unsupported type`);
      else if (file.size > MAX_FILE_MB * 1024 * 1024) bad.push(`${file.name}: larger than ${MAX_FILE_MB} MB`);
    }
    if (bad.length) {
      setError(bad.join(' · '));
      return;
    }
    const files = await Promise.all(chosen.map(toWebp));
    setError('');
    const target = replaceTargetRef.current;
    replaceTargetRef.current = null;
    if (target !== null) {
      // Replace an existing image slot with the first chosen file
      const file = files[0];
      setDraft((prev) => {
        const images = [...prev.images];
        images[target] = URL.createObjectURL(file);
        return { ...prev, images };
      });
      setPending((prev) => [...prev, file]);
      return;
    }
    setDraft((prev) => ({ ...prev, images: [...prev.images, ...files.map((f) => URL.createObjectURL(f))] }));
    setPending((prev) => [...prev, ...files]);
  }

  function removeImage(index: number) {
    setDraft((prev) => {
      const removed = prev.images[index];
      if (removed?.startsWith('blob:')) {
        URL.revokeObjectURL(removed);
        setPending((files) => files.slice(0, -1)); // drop its not-yet-uploaded file
      }
      return { ...prev, images: prev.images.filter((_, i) => i !== index) };
    });
  }

  function moveImage(index: number) {
    setDraft((prev) => {
      const images = [...prev.images];
      [images[index - 1], images[index]] = [images[index], images[index - 1]];
      return { ...prev, images };
    });
  }

  function setCover(index: number) {
    setDraft((prev) => {
      const images = [...prev.images];
      const [img] = images.splice(index, 1);
      images.unshift(img);
      return { ...prev, images };
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError('A product name is required.');
      return;
    }
    if (!draft.category.trim()) {
      setError('A category is required — pick one or type a new one.');
      return;
    }
    if (draft.images.length === 0) {
      setError('Upload at least one product image.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      // 1. Upload each new file, pairing it with its blob-url slot in order.
      const blobToStored = new Map<string, string>();
      const blobSlots = draft.images.filter((src) => src.startsWith('blob:'));
      for (let k = 0; k < blobSlots.length && k < pending.length; k++) {
        const single = new FormData();
        single.append('images', pending[k]);
        const { images } = await api.uploadImages(single);
        if (images[0]) blobToStored.set(blobSlots[k], images[0]);
      }
      // 2. Rewrite the image list: blob urls -> stored paths; existing uploads stay put.
      const finalImages = draft.images.map((src) =>
      src.startsWith('blob:') ? blobToStored.get(src) ?? src : src
      );
      if (finalImages.some((src) => src.startsWith('blob:'))) {
        throw new Error('Some images could not be uploaded. Please try again.');
      }
      // 3. Drop specification rows the user left completely blank.
      const cleanSpecs = draft.specs.filter((s) => s.label.trim() || s.value.trim());
      const id = draft.id || slugify(draft.name);
      await onSave({
        ...draft,
        id,
        category: draft.category.trim(),
        specs: cleanSpecs,
        price: Number(draft.price) || 0,
        compareAtPrice: draft.compareAtPrice ? Number(draft.compareAtPrice) : null,
        images: finalImages
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-shell/60 border border-ink/15 p-6 md:p-8">
      <h2 className="text-[14px] uppercase tracking-[0.16em] font-light text-ink pb-6">
        {isNewRecord ? 'New product' : `Editing — ${initial.name}`}
      </h2>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className={label} htmlFor="pf-name">
            Product name
          </label>
          <input
            id="pf-name"
            className={field}
            value={draft.name}
            onChange={(e) => set('name', e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="pf-reference">
            Product reference / SKU (optional)
          </label>
          <input
            id="pf-reference"
            className={field}
            placeholder="e.g. KL-BAG-01"
            value={draft.reference}
            onChange={(e) => set('reference', e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="pf-price">
            Price (RWF)
          </label>
          <input
            id="pf-price"
            type="number"
            min={0}
            step={1}
            className={field}
            placeholder="e.g. 25000"
            value={draft.price}
            onChange={(e) => set('price', Math.round(Number(e.target.value)) || 0)} />
        </div>
        <div>
          <label className={label} htmlFor="pf-compare">
            Compare-at price (optional, RWF)
          </label>
          <input
            id="pf-compare"
            type="number"
            min={0}
            step={1}
            className={field}
            value={draft.compareAtPrice ?? ''}
            onChange={(e) => set('compareAtPrice', e.target.value ? Math.round(Number(e.target.value)) : null)} />
        </div>
        <div>
          <label className={label} htmlFor="pf-category">
            Category
          </label>
          <input
            id="pf-category"
            className={field}
            list="pf-category-options"
            placeholder="Pick one or type a new category"
            value={draft.category}
            onChange={(e) => set('category', e.target.value)} />
          <datalist id="pf-category-options">
            {settings.categories.map((c) =>
            <option key={c} value={c} />
            )}
          </datalist>
          <p className="mt-1.5 text-[10px] text-ink/45">
            Categories are managed in Store settings — type a new one here to add
            it to this product.
          </p>
        </div>
        <div>
          <label className={label} htmlFor="pf-material">
            Material / details (optional)
          </label>
          <input
            id="pf-material"
            className={field}
            placeholder="e.g. Leather, stainless steel, gold plated"
            value={draft.material}
            onChange={(e) => set('material', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={label} htmlFor="pf-sizes">
            Sizes / options (optional, comma separated)
          </label>
          <input
            id="pf-sizes"
            className={field}
            placeholder="e.g. S, M, L — or 6, 7, 8 — or 45 cm, 50 cm"
            value={draft.sizes.join(', ')}
            onChange={(e) =>
            set(
              'sizes',
              e.target.value.
              split(',').
              map((s) => s.trim()).
              filter(Boolean)
            )
            } />
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className={label}>Status</legend>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) =>
          <button
            key={option.value}
            type="button"
            onClick={() => set('status', option.value)}
            aria-pressed={draft.status === option.value}
            className={`text-[10px] uppercase tracking-[0.14em] px-4 py-2 border transition-colors ${
            draft.status === option.value ?
            'bg-ink text-white border-ink' :
            'border-ink/25 text-ink/70 hover:border-ink hover:text-ink'}`}>

            {option.label}
          </button>
          )}
        </div>
        <p className="mt-2 text-[10px] text-ink/50">
          {statusOptions.find((o) => o.value === draft.status)?.hint}
        </p>
      </fieldset>

      <div className="mt-5">
        <label className={label} htmlFor="pf-short">
          Short description (shown in listings)
        </label>
        <input
          id="pf-short"
          className={field}
          value={draft.shortDescription}
          onChange={(e) => set('shortDescription', e.target.value)} />
      </div>

      <div className="mt-5">
        <label className={label} htmlFor="pf-desc">
          Full description
        </label>
        <textarea
          id="pf-desc"
          rows={4}
          className={field}
          value={draft.description}
          onChange={(e) => set('description', e.target.value)} />
      </div>

      <div className="mt-5">
        <label className={label} htmlFor="pf-highlights">
          Highlights (one per line, optional)
        </label>
        <textarea
          id="pf-highlights"
          rows={3}
          className={field}
          value={draft.highlights.join('\n')}
          onChange={(e) =>
          set(
            'highlights',
            e.target.value.split('\n').map((l) => l.trim()).filter(Boolean)
          )
          } />
      </div>

      <fieldset className="mt-7">
        <legend className={label}>Specifications (optional)</legend>
        <div className="space-y-2">
          {draft.specs.map((spec, i) =>
          <div key={i} className="flex gap-2">
              <input
              aria-label={`Specification ${i + 1} label`}
              className={`${field} md:w-56`}
              placeholder="Label"
              value={spec.label}
              onChange={(e) => updateSpec(i, { label: e.target.value })} />

              <input
              aria-label={`Specification ${i + 1} value`}
              className={field}
              placeholder="Value"
              value={spec.value}
              onChange={(e) => updateSpec(i, { value: e.target.value })} />

              <button
              type="button"
              aria-label={`Remove specification ${i + 1}`}
              onClick={() =>
              set(
                'specs',
                draft.specs.filter((_, index) => index !== i)
              )
              }
              className="shrink-0 px-3 border border-ink/20 text-ink/60 hover:text-ink hover:border-ink transition-colors">

                <Trash2 size={14} strokeWidth={1.3} />
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => set('specs', [...draft.specs, { label: '', value: '' }])}
          className="mt-3 inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-ink border-b border-ink pb-0.5">

          <Plus size={12} strokeWidth={1.4} />
          Add specification
        </button>
      </fieldset>

      <fieldset className="mt-8">
        <legend className={label}>Product images</legend>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          aria-label="Upload product images"
          onChange={onFilesChosen} />

        {draft.images.length > 0 &&
        <ul className="flex flex-wrap gap-3 mb-3">
            {draft.images.map((image, i) =>
          <li key={image + i} className="relative w-24">
                <img
              src={image}
              alt={`Product image ${i + 1}`}
              className="aspect-square w-full object-cover border border-ink/15 bg-white" />

                {i === 0 &&
            <span className="absolute top-1 left-1 bg-ink text-white text-[7px] uppercase tracking-[0.16em] px-1.5 py-0.5">
                    Cover
                  </span>
            }
                <div className="flex">
                  {i > 0 &&
              <button
                type="button"
                aria-label={`Move image ${i + 1} earlier`}
                onClick={() => moveImage(i)}
                className="flex-1 py-1.5 text-ink/60 hover:text-ink border border-ink/15 flex justify-center">

                        <ArrowUp size={12} strokeWidth={1.4} />
                      </button>
              }
                  <button
              type="button"
              aria-label={`Set image ${i + 1} as cover`}
              onClick={() => setCover(i)}
              className="flex-1 py-1.5 text-ink/60 hover:text-ink border border-ink/15 flex justify-center">

                      <Star size={12} strokeWidth={1.4} />
                    </button>
                  <button
              type="button"
              aria-label={`Replace image ${i + 1}`}
              onClick={() => pickFiles(i)}
              className="flex-1 py-1.5 text-ink/60 hover:text-ink border border-ink/15 flex justify-center">

                      <RefreshCw size={12} strokeWidth={1.4} />
                    </button>
                  <button
              type="button"
              aria-label={`Remove image ${i + 1}`}
              onClick={() => removeImage(i)}
              className="flex-1 py-1.5 text-ink/60 hover:text-ink border border-ink/15 flex justify-center">

                      <Trash2 size={12} strokeWidth={1.4} />
                    </button>
                </div>
              </li>
          )}
          </ul>
        }
        <button
          type="button"
          onClick={() => pickFiles(null)}
          className="inline-flex items-center gap-2 border border-ink text-ink text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 hover:bg-ink hover:text-white transition-colors">

          <Upload size={13} strokeWidth={1.4} />
          Upload images
        </button>
        <p className="mt-2 text-[10px] text-ink/45">
          JPG, PNG or WebP · up to {MAX_FILE_MB} MB each · the first image is the cover
        </p>
      </fieldset>

      <fieldset className="mt-7 flex flex-wrap gap-6">
        <legend className="sr-only">Visibility</legend>
        {(
        [
        ['isNew', 'Show in New arrivals'],
        ['isBestseller', 'Show in Bestsellers']] as
        const).
        map(([key, text]) =>
        <label key={key} className="flex items-center gap-2 text-[11px] text-ink">
            <input
          type="checkbox"
          checked={draft[key]}
          onChange={(e) => set(key, e.target.checked)}
          className="h-3.5 w-3.5 accent-black" />

            {text}
          </label>
        )}
      </fieldset>

      {error &&
      <p role="alert" className="mt-5 text-[11px] text-red-700">
          {error}
        </p>
      }

      <div className="mt-8 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-white text-[10px] uppercase tracking-[0.22em] px-8 py-3 hover:bg-ink/85 transition-colors disabled:opacity-50">

          {saving ? 'Saving…' : isNewRecord ? 'Create product' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-ink text-ink text-[10px] uppercase tracking-[0.22em] px-8 py-3 hover:bg-ink hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </form>);

}
