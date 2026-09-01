import type { Metadata } from "next";
import ConsoleShell from "@/components/console/ConsoleShell";
import FloatingSupportAssistant from "@/components/marketing/FloatingSupportAssistant";

export const metadata: Metadata = {
  title: "Console",
  description:
    "Live operations console — threads, pipeline, fulfilment and signals.",
};

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ConsoleShell>{children}</ConsoleShell>
      <FloatingSupportAssistant />
    </>
  );
}
