import { redirect } from "next/navigation";
export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) { const { bookingId } = await params; redirect(`/admin/bookings/${bookingId}`); }
