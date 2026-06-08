import { BusinessProfileForm } from '@/apis/provider/business-profile/components/business-profile-form';

export default function BusinessProfile() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Business Profile</h1>
      <BusinessProfileForm />
    </div>
  );
}
