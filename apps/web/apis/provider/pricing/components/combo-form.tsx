"use client";

export function ComboForm() {
  return (
    <form className="bg-white p-6 rounded-lg shadow space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Combo Name</label>
        <input type="text" className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Services</label>
        <div className="border rounded p-3 space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Select services</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Combo Price</label>
        <input type="number" className="w-full border rounded px-3 py-2" />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Create Combo
      </button>
    </form>
  );
}
