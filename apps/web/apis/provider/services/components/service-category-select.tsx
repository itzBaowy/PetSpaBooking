"use client";

export function ServiceCategorySelect() {
  return (
    <select className="w-full border rounded px-3 py-2">
      <option value="">Chọn danh mục</option>
      <option value="grooming">Chăm sóc và làm đẹp</option>
      <option value="training">Huấn luyện</option>
      <option value="boarding">Lưu trú</option>
      <option value="veterinary">Thú y</option>
    </select>
  );
}
