import { redirect } from "next/navigation";

export default function PreferencesRedirect() {
  redirect("/console/settings?tab=preferences");
}
