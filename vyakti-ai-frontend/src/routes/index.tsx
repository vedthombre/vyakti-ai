import { createFileRoute } from "@tanstack/react-router";
import {
  Mic,
  Search,
  LayoutGrid,
  ExternalLink,
  Accessibility,
  Languages,
  Zap,
  ShieldCheck,
  MonitorSmartphone,
  Heart,
  Menu,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vyakti — order anything, just say it" },
      {
        name: "description",
        content:
          "Vyakti lets anyone order from Blinkit, Zepto, and Swiggy with a single voice message. Built for parents, grandparents, and busy professionals.",
      },
      { property: "og:title", content: "Vyakti — order anything, just say it" },
      {
        property: "og:description",
        content: "Conversational commerce for everyone. Speak naturally in Hindi, Marathi, or English.",
      },
    ],
  }),
  component: Landing,
});

function Logo({ size = 18 }: { size?: number }) {
  return (
    <span style={{ fontSize: size }} className="font-medium tracking-tight text-[#444441]">
      vya<span className="text-[#1D9E75]">k</span>ti
    </span>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const links = ["How it works", "For families", "Integrations"];
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#e5e5e5] bg-white">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:px-16">
        <Logo />
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l} href="#" className="text-[13px] text-[#444441] hover:text-[#1D9E75]">
              {l}
            </a>
          ))}
        </div>
        <div className="hidden md:block">
          <a
            href="#"
            className="inline-flex items-center rounded-lg bg-[#1D9E75] px-[18px] py-2 text-[13px] text-white transition hover:bg-[#178a66]"
          >
            Try the demo
          </a>
        </div>
        <button
          aria-label="Menu"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <Menu size={20} className="text-[#444441]" />
        </button>
      </div>
      {open && (
        <div className="border-t border-[#e5e5e5] bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a key={l} href="#" className="text-[13px] text-[#444441]">
                {l}
              </a>
            ))}
            <a
              href="#"
              className="mt-2 inline-flex w-fit items-center rounded-lg bg-[#1D9E75] px-[18px] py-2 text-[13px] text-white"
            >
              Try the demo
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

function PhoneMock() {
  return (
    <div
      className="mx-auto w-[180px] rounded-3xl bg-[#F1EFE8] px-3 pt-[14px] pb-[18px]"
      style={{ borderRadius: 24 }}
    >
      <div className="flex items-center justify-between text-[9px] text-[#888780]">
        <span>9:41</span>
        <span>• • •</span>
      </div>
      <div className="mt-4">
        <p className="text-[13px] font-medium text-[#444441]">Good morning, Aai</p>
        <p className="mt-0.5 text-[10px] text-[#888780]">What do you need today?</p>
      </div>
      <div className="mt-6 flex justify-center">
        <div
          className="flex items-center justify-center rounded-full bg-[#1D9E75]"
          style={{ width: 64, height: 64 }}
        >
          <Mic size={26} className="text-white" strokeWidth={1.75} />
        </div>
      </div>
      <p className="mt-2 text-center text-[9px] text-[#888780]">Tap and speak</p>
      <div className="mt-5 flex justify-center gap-1.5">
        {["Milk", "Eggs", "Bread"].map((x) => (
          <span
            key={x}
            className="rounded-full border border-[#e5e5e5] bg-white px-2 py-1 text-[8px] text-[#444441]"
          >
            {x}
          </span>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto flex min-h-screen max-w-[1200px] flex-col items-center justify-center px-6 pb-20 pt-14 md:px-16 md:py-20">
      <div className="grid w-full grid-cols-1 items-center gap-12 md:grid-cols-[60%_40%] md:gap-8">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E1F5EE] px-3 py-1 text-[11px] text-[#0F6E56]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1D9E75]" />
            Conversational commerce
          </span>
          <h1
            className="mt-5 text-[40px] leading-[1.05] text-[#444441]"
            style={{ letterSpacing: "-0.03em", fontWeight: 500 }}
          >
            Order anything.
            <br />
            <span className="italic text-[#1D9E75]">Just say it.</span>
          </h1>
          <p className="mt-5 max-w-[420px] text-[14px] leading-[1.6] text-[#888780]">
            Vyakti lets anyone — parents, grandparents, busy professionals — order from Blinkit, Zepto,
            and Swiggy with a single voice message. No app navigation needed.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#1D9E75] px-[22px] py-3 text-[13px] text-white transition hover:bg-[#178a66]"
            >
              <Mic size={16} strokeWidth={1.75} />
              Try it now
            </a>
            <a
              href="#"
              className="inline-flex items-center rounded-[10px] border border-[#e5e5e5] bg-white px-[22px] py-3 text-[13px] text-[#444441] hover:border-[#888780]"
              style={{ borderWidth: "0.5px" }}
            >
              Watch demo
            </a>
          </div>
          <p className="mt-4 text-[11px] text-[#888780]">
            Works in Hindi, Marathi, and English · No account needed
          </p>
        </div>
        <div className="flex items-center justify-center">
          <PhoneMock />
        </div>
      </div>
    </section>
  );
}

function Divider() {
  return <div className="mx-6 h-px bg-[#e5e5e5] md:mx-16" />;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <span
      className="text-[11px] text-[#1D9E75]"
      style={{ letterSpacing: "0.06em", fontWeight: 500 }}
    >
      {children}
    </span>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Mic, title: "Speak naturally", desc: "Say what you need in any language. No commands, no keywords." },
    { icon: Search, title: "Vyakti searches", desc: "Checks Blinkit, Zepto and Swiggy instantly for your items." },
    { icon: LayoutGrid, title: "See options clearly", desc: "Price, ETA, and merchant — all in one scannable card." },
    { icon: ExternalLink, title: "Open and confirm", desc: "One tap opens the merchant app with your cart ready." },
  ];
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-12 md:px-16 md:py-12">
      <SectionLabel>HOW IT WORKS</SectionLabel>
      <h2 className="mt-3 text-[28px] text-[#444441]" style={{ fontWeight: 500, letterSpacing: "-0.02em" }}>
        Four steps. Zero confusion.
      </h2>
      <p className="mt-2 text-[14px] text-[#888780]">Built for people who just want to get things done.</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="rounded-xl bg-[#F1EFE8] px-4 py-5">
              <div
                className="flex items-center justify-center rounded-full bg-[#E1F5EE] text-[11px] text-[#0F6E56]"
                style={{ width: 26, height: 26, fontWeight: 500 }}
              >
                {i + 1}
              </div>
              <Icon size={24} strokeWidth={1.5} className="mt-4 text-[#1D9E75]" />
              <h3 className="mt-3 text-[13px] text-[#444441]" style={{ fontWeight: 500 }}>
                {s.title}
              </h3>
              <p className="mt-1.5 text-[12px] leading-[1.55] text-[#888780]">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Why() {
  const cards = [
    { icon: Accessibility, title: "Elderly-first design", desc: "Large touch targets, high contrast, and zero small print. No surprises." },
    { icon: Languages, title: "Speaks your language", desc: "Hindi, Marathi, English — mix them freely. Vyakti understands." },
    { icon: Zap, title: "Instant results", desc: "Live availability and ETA from multiple merchants, compared in seconds." },
    { icon: ShieldCheck, title: "No account required", desc: "Vyakti never stores your order history. Nothing to sign up for." },
    { icon: MonitorSmartphone, title: "Works everywhere", desc: "Browser, phone, WhatsApp — same experience across every surface." },
    { icon: Heart, title: "Built with care", desc: "Made by someone who watched their parents struggle with apps." },
  ];
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-12 md:px-16 md:py-12">
      <SectionLabel>WHY VYAKTI</SectionLabel>
      <h2 className="mt-3 text-[28px] text-[#444441]" style={{ fontWeight: 500, letterSpacing: "-0.02em" }}>
        Designed for real people
      </h2>
      <p className="mt-2 text-[14px] text-[#888780]">Not for power users. For everyone else.</p>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="rounded-xl border bg-white px-4 py-5"
              style={{ borderColor: "#e5e5e5", borderWidth: "0.5px" }}
            >
              <div
                className="flex items-center justify-center rounded-[10px] bg-[#E1F5EE]"
                style={{ width: 36, height: 36 }}
              >
                <Icon size={18} strokeWidth={1.5} className="text-[#1D9E75]" />
              </div>
              <h3 className="mt-4 text-[13px] text-[#444441]" style={{ fontWeight: 500 }}>
                {c.title}
              </h3>
              <p className="mt-1.5 text-[12px] leading-[1.55] text-[#888780]">{c.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { n: "3", l: "merchants" },
    { n: "3", l: "languages" },
    { n: "1", l: "tap to order" },
  ];
  return (
    <section className="bg-[#F1EFE8] px-6 py-8 md:px-16">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h3 className="text-[16px] text-[#444441]" style={{ fontWeight: 500 }}>
            Built in public
          </h3>
          <p className="mt-1 text-[13px] text-[#888780]">
            Follow the build journey on Twitter and LinkedIn
          </p>
        </div>
        <div className="flex gap-8">
          {stats.map((s) => (
            <div key={s.l}>
              <div className="text-[20px] text-[#1D9E75]" style={{ fontWeight: 500 }}>
                {s.n}
              </div>
              <div className="mt-0.5 text-[10px] text-[#888780]">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#e5e5e5] bg-white px-6 py-5 md:px-16">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <Logo size={13} />
        <div className="flex gap-4">
          {["Privacy", "Contact", "Twitter"].map((l) => (
            <a key={l} href="#" className="text-[11px] text-[#888780] hover:text-[#444441]">
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Divider />
        <HowItWorks />
        <Divider />
        <Why />
        <Stats />
      </main>
      <Footer />
    </div>
  );
}
