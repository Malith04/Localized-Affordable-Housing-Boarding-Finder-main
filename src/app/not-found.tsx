import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      <h2 className="text-4xl font-extrabold text-emerald-600 mb-2">404</h2>
      <p className="text-lg font-semibold mb-4">Boarding Room Page Not Found</p>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        The bodim listing or page you are looking for might have been removed or is temporarily unavailable.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition"
      >
        Return to Home
      </Link>
    </div>
  );
}
