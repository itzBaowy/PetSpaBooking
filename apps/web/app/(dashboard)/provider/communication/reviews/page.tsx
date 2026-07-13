import { ProviderReviewsPage as ProviderReviewsScreen } from "@/apis/provider/reviews/components/provider-reviews-page";

export default function ProviderReviewsPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <ProviderReviewsScreen />
      </div>
    </main>
  );
}
