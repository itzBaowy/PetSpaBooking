import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Page not found</p>
      <Link href="/" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
        Go back home
      </Link>
    </div>
  );
}
