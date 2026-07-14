"use client";

export function ForgotPasswordForm() {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Địa chỉ email</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder="your@email.com"
        />
      </div>
      <p className="text-sm text-gray-600">
        We'll send you an email to reset your password
      </p>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Send Reset Link
      </button>
    </form>
  );
}
