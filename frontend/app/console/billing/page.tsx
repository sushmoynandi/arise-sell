import { redirect } from "next/navigation";

export default function BillingRedirect() {
  redirect("/console/settings?tab=billing");
}
