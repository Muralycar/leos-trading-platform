import type { Metadata } from "next";
import { signIn } from "./actions";

export const metadata: Metadata = {
  title: "Admin Login — Leos Trading FZE",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ error?: string; next?: string }>;
}

const labelClass = "font-mono text-[11px] uppercase tracking-[.06em] text-text-2";
const inputClass =
  "w-full rounded-s border border-line-strong bg-bg-1 px-3.5 py-3 text-[14px] text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none";

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { error, next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-0 px-5">
      <div className="w-full max-w-[400px] rounded-m border border-line bg-bg-1 p-8">
        <div className="eyebrow">Admin</div>
        <h1 className="mt-3.5 text-[28px]">Sign in</h1>

        {error ? (
          <p className="mt-4 rounded-s border border-warn/40 bg-warn/10 px-3.5 py-2.5 text-sm text-warn">{error}</p>
        ) : null}

        <form action={signIn} className="mt-6 flex flex-col gap-5">
          <input type="hidden" name="next" value={next ?? "/admin"} />
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Email</span>
            <input name="email" type="email" required autoComplete="email" className={inputClass} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Password</span>
            <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
          </label>
          <button type="submit" className="btn btn-primary w-full">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
