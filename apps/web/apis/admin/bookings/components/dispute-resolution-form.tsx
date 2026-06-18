"use client";

export function DisputeResolutionForm() {
  return (
    <form className="bg-white p-6 rounded-lg shadow space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Resolution</label>
        <textarea
          className="w-full border rounded px-3 py-2 h-24"
          placeholder="Describe the resolution"
        ></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Refund Amount</label>
        <input type="number" className="w-full border rounded px-3 py-2" />
      </div>
      <button
        type="submit"
        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
      >
        Resolve Dispute
      </button>
    </form>
  );
}
