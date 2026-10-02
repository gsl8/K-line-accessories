import React, { useState } from 'react';
import { api } from '../../lib/api';

const label = 'block text-[9px] uppercase tracking-[0.2em] text-ink/55 mb-1.5';
const field =
'w-full bg-white border border-ink/20 px-3 py-2 text-[12px] text-ink focus:outline-none focus:border-ink';

export function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSaved(false);
    if (next !== confirm) {
      setError('The new passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await api.changePassword(current, next);
      setSaved(true);
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change the password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-shell/60 border border-ink/15 p-6 md:p-8 max-w-3xl mt-8">
      <h2 className="text-[14px] uppercase tracking-[0.16em] font-light text-ink pb-2">
        Admin password
      </h2>
      <p className="text-[11px] text-ink/55 pb-6 max-w-md leading-[1.7]">
        Change the password used to sign in to this dashboard. Minimum 10
        characters. It is stored only as a secure hash.
      </p>

      <div className="grid md:grid-cols-3 gap-5">
        <div>
          <label className={label} htmlFor="cp-current">
            Current password
          </label>
          <input
            id="cp-current"
            type="password"
            autoComplete="current-password"
            required
            className={field}
            value={current}
            onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="cp-next">
            New password
          </label>
          <input
            id="cp-next"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            className={field}
            value={next}
            onChange={(e) => setNext(e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="cp-confirm">
            Repeat new password
          </label>
          <input
            id="cp-confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            className={field}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)} />
        </div>
      </div>

      {error &&
      <p role="alert" className="mt-4 text-[11px] text-red-700">
          {error}
        </p>
      }
      {saved &&
      <p role="status" className="mt-4 text-[11px] text-ink/70">
          Password updated.
        </p>
      }

      <button
        type="submit"
        disabled={saving}
        className="mt-6 bg-ink text-white text-[10px] uppercase tracking-[0.22em] px-8 py-3 hover:bg-ink/85 transition-colors disabled:opacity-50">
        {saving ? 'Saving…' : 'Change password'}
      </button>
    </form>);

}
