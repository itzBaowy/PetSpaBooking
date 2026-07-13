import { redirect } from "next/navigation";

export default function Page() {
  redirect("/admin/providers?providerStatus=PENDING_VERIFICATION");
}
