'use client';

export function LoginForm() {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" className="w-full border rounded px-3 py-2" placeholder="your@email.com" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input type="password" className="w-full border rounded px-3 py-2" placeholder="••••••" />
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Login
      </button>
    </form>
  );
}
