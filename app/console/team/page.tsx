import { redirect } from "next/navigation";

export default function TeamRedirect() {
  redirect("/console/settings?tab=team");
}
