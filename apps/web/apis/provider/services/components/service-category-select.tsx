'use client';

export function ServiceCategorySelect() {
  return (
    <select className="w-full border rounded px-3 py-2">
      <option value="">Select category</option>
      <option value="grooming">Grooming</option>
      <option value="training">Training</option>
      <option value="boarding">Boarding</option>
      <option value="veterinary">Veterinary</option>
    </select>
  );
}
