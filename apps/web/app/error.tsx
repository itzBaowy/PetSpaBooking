"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Đã xảy ra lỗi</h1>
      <p className="text-gray-600 mb-6">
        Không thể xử lý yêu cầu của bạn. Vui lòng thử lại.
      </p>
      <button
        onClick={reset}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Thử lại
      </button>
    </div>
  );
}
