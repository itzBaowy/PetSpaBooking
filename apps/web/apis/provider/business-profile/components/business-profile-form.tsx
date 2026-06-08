'use client';

export function BusinessProfileForm() {
  return (
    <form className="bg-white p-6 rounded-lg shadow space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Business Name</label>
        <input type="text" className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea className="w-full border rounded px-3 py-2 h-24"></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input type="text" className="w-full border rounded px-3 py-2" />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
        Save Profile
      </button>
    </form>
  );
}
