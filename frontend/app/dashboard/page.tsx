import { redirect } from "next/navigation";

/** Legacy route — the console/marketing IA moved. Kept so old links resolve. */
export default function Page() {
  redirect("/console");
}
