import { redirect } from "next/navigation";

export default function Verification() {
  redirect("/admin/providers?providerStatus=PENDING_VERIFICATION");
}
