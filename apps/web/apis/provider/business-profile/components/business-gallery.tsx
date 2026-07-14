"use client";

export function BusinessGallery() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-semibold mb-4">Thư viện ảnh</h3>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-square bg-gray-100 rounded flex items-center justify-center"
          >
            <span className="text-gray-400">Image {i}</span>
          </div>
        ))}
      </div>
      <button className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
        Add Images
      </button>
    </div>
  );
}
