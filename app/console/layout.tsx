import type { Metadata } from "next";
import ConsoleShell from "@/components/console/ConsoleShell";

export const metadata: Metadata = {
  title: "Console",
  description: "Live operations console — threads, pipeline, fulfilment and signals.",
};

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <ConsoleShell>{children}</ConsoleShell>;
}
