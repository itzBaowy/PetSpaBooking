import { RegisterProviderForm } from '@/apis/auth/components/register-provider-form';

export default function RegisterProvider() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Register as Provider</h1>
        <RegisterProviderForm />
      </div>
    </div>
  );
}
