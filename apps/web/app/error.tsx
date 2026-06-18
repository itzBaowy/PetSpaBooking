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
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="text-gray-600 mb-6">
        An error occurred while processing your request
      </p>
      <button
        onClick={reset}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
