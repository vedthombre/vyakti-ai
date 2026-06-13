import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vyakti — Voice Agent",
  description:
    "Vyakti (व्यक्ति) — your voice-first agentic commerce engine. Speak your order, Vyakti handles the rest.",
};

/**
 * Layout for the /app route — applies the dark glassmorphism theme
 * as a scoped wrapper div so it doesn't bleed into the landing page.
 */
export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="agent-shell">
      {children}
    </div>
  );
}
