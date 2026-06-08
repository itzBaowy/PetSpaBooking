'use client';

export function BusinessHoursForm() {
  return (
    <form className="bg-white p-6 rounded-lg shadow space-y-4">
      <h3 className="font-semibold mb-4">Business Hours</h3>
      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
        <div key={day} className="flex gap-4 items-center">
          <label className="w-24">{day}</label>
          <input type="time" className="border rounded px-3 py-2" />
          <span>to</span>
          <input type="time" className="border rounded px-3 py-2" />
        </div>
      ))}
      <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mt-4">
        Save Hours
      </button>
    </form>
  );
}
