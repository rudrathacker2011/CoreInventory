"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Route,
  PackageOpen,
  Truck,
  ArrowLeftRight,
  BarChart3,
  Warehouse,
  Shield,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Bell,
  TrendingUp,
  Package,
  Eye,
  Zap,
} from "lucide-react";

/* ──────── Animated Counter ──────── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let val = 0;
    const step = Math.max(1, Math.floor(target / 60));
    const timer = setInterval(() => {
      val += step;
      if (val >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(val);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <div ref={ref}>
      {count}
      {suffix}
    </div>
  );
}

/* ──────── Scroll Reveal ──────── */
function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ──────── Logo Component ──────── */
function TrueRouteLogo({ size = "default" }: { size?: "default" | "small" }) {
  const s = size === "small" ? "size-7" : "size-9";
  const icon = size === "small" ? "size-3.5" : "size-4.5";
  return (
    <div
      className={`flex ${s} items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25`}
    >
      <Route className={`${icon} text-white`} />
    </div>
  );
}

/* ──────── Main Page ──────── */
export default function LandingPage() {
  return (
    <div className="dark">
      <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden selection:bg-indigo-500/30">
        <style jsx global>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-12px) rotate(1deg); }
          }
          @keyframes float-slow-reverse {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(12px) rotate(-1deg); }
          }
          .float-anim { animation: float-slow 6s ease-in-out infinite; }
          .float-anim-reverse { animation: float-slow-reverse 7s ease-in-out infinite; }
        `}</style>

        {/* ══════════ NAVBAR ══════════ */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="mx-auto max-w-6xl flex items-center justify-between h-16 px-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <TrueRouteLogo />
              <span className="text-lg font-bold tracking-tight">
                True Route
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {["Home","Features", "How It Works"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-[13px] font-medium text-white/40 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
  <Link
    href="/auth/login"
    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold h-9 px-5 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
  >
    Get Started
    <ArrowRight className="size-3.5" />
  </Link>
</div>
          </div>
        </nav>

        {/* ══════════ HERO ══════════ */}
        <section className="relative pt-32 pb-12 md:pt-44 md:pb-20">
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/[0.07] rounded-full blur-[120px]" />
            <div className="absolute top-60 left-1/4 w-[300px] h-[300px] bg-violet-600/[0.05] rounded-full blur-[100px]" />
            <div className="absolute top-40 right-1/4 w-[250px] h-[250px] bg-cyan-600/[0.04] rounded-full blur-[80px]" />
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-5xl px-6 text-center">
            {/* Badge */}
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-[13px] font-medium text-indigo-400 mb-8">
                <Zap className="size-3.5" />
                Trusted by professionals
              </div>
            </Reveal>

            {/* Headline */}
            <Reveal>
              <h1 className="text-4xl md:text-[56px] lg:text-[64px] font-bold tracking-tight leading-[1.1]">
                Smarter Inventory,
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Greater Precision
                </span>
              </h1>
            </Reveal>

            {/* Subtitle */}
            <Reveal>
              <p className="mt-6 text-base md:text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
                Track inventory in real time, manage warehouses, and automate
                restocking with precision. All from one clean dashboard.
              </p>
            </Reveal>

            {/* CTAs */}
            <Reveal>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold h-12 px-8 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
                >
                  Get Started Free
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-semibold h-12 px-8 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all"
                >
                  See Features
                </Link>
              </div>
            </Reveal>
          </div>

          {/* ── Hero Dashboard Preview ── */}
          <Reveal className="mt-16 md:mt-20 mx-auto max-w-5xl px-6">
            <div className="relative">
              {/* Gradient border glow */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-500/20 via-violet-500/10 to-transparent" />

              <div className="relative rounded-2xl bg-[#111113] border border-white/[0.06] shadow-2xl shadow-black/50 overflow-hidden p-6 md:p-8">
                <div className="grid md:grid-cols-5 gap-5">
                  {/* Left: Chart Card */}
                  <div className="md:col-span-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 float-anim">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-white/80">
                        Total Visitors
                      </p>
                      <span className="text-xs text-indigo-400 font-medium cursor-pointer hover:underline flex items-center gap-0.5">
                        See Details <ChevronRight className="size-3" />
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-3xl font-bold text-white">
                        2,465
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                        <TrendingUp className="size-3" /> +8.4%
                      </span>
                      <span className="text-xs text-white/25">
                        vs last week
                      </span>
                    </div>
                    {/* Bar chart */}
                    <div className="flex items-end gap-[5px] h-28">
                      {[14, 16, 15, 17, 18, 14, 20, 22, 21, 19, 17, 18].map(
                        (h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-t transition-all ${
                              i === 7
                                ? "bg-indigo-500 shadow-lg shadow-indigo-500/30"
                                : "bg-indigo-500/15"
                            }`}
                            style={{ height: `${(h / 22) * 100}%` }}
                          />
                        )
                      )}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-white/15">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                        <span key={m}>{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Notifications */}
                  <div className="md:col-span-2 space-y-3 float-anim-reverse">
                    {[
                      { text: "Video File", status: "On Way", accent: false, statusBg: "bg-white/[0.04] text-white/30 border-white/[0.06]" },
                      { text: "New Stock Coming", status: "Confirmed", accent: true, statusBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
                      { text: "Image Stock", status: "Need Action", accent: false, statusBg: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
                      { text: "Other Stock", status: "Need Action", accent: false, statusBg: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
                    ].map((n, i) => (
                      <div
                        key={i}
                        className={`rounded-xl border p-4 flex items-center justify-between ${
                          n.accent
                            ? "bg-emerald-500/[0.04] border-emerald-500/10"
                            : "bg-white/[0.02] border-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`size-8 rounded-full flex items-center justify-center ${
                              n.accent
                                ? "bg-emerald-500/15"
                                : "bg-white/[0.04]"
                            }`}
                          >
                            <Bell
                              className={`size-3.5 ${
                                n.accent
                                  ? "text-emerald-400"
                                  : "text-white/25"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="text-[11px] text-white/25">
                              Notification
                            </p>
                            <p className="text-sm font-medium text-white/70">
                              {n.text}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${n.statusBg}`}
                        >
                          {n.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Labels */}
                <div className="grid md:grid-cols-5 gap-5 mt-5">
                  <div className="md:col-span-3">
                    <p className="text-sm font-semibold text-white/80">
                      Live Inventory Monitoring
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      Monitor inventory live across every channel and location.
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-white/80">
                      Smart Auto-Restocking
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      Automatically detect low stock and trigger restocking.
                    </p>
                  </div>
                </div>
              </div>
              {/* Glow */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-indigo-500/[0.08] blur-[60px] rounded-full" />
            </div>
          </Reveal>
        </section>

        {/* ══════════ STATS ══════════ */}
        <section className="py-16 border-y border-white/[0.04]">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { val: 100, suffix: "%", label: "Open Source" },
                { val: 6, suffix: "+", label: "Core Modules" },
                { val: 5, suffix: "min", label: "Setup Time" },
                { val: 99, suffix: "%", label: "Uptime" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    <Counter target={s.val} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-white/25 mt-1 uppercase tracking-wider font-medium">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <section id="features" className="py-24 md:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-600/[0.02] to-transparent pointer-events-none" />
          <div className="relative mx-auto max-w-6xl px-6">
            <Reveal>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-4">
                  <Eye className="size-3" /> Features
                </div>
                <h2 className="text-3xl md:text-[44px] font-bold tracking-tight leading-tight">
                  Everything You Need to
                  <br />
                  <span className="text-indigo-400">Manage Inventory</span>
                </h2>
                <p className="mt-4 text-white/35 max-w-lg mx-auto">
                  From receiving goods to shipping orders — True Route covers
                  the entire supply chain.
                </p>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: PackageOpen,
                  title: "Receipts Management",
                  desc: "Track incoming goods with supplier info, scheduled dates, and multi-line product entries.",
                  color: "#34d399",
                  bg: "rgba(52,211,153,0.08)",
                },
                {
                  icon: Truck,
                  title: "Delivery Orders",
                  desc: "Manage outgoing shipments with delivery addresses and automatic stock deduction.",
                  color: "#a78bfa",
                  bg: "rgba(167,139,250,0.08)",
                },
                {
                  icon: ArrowLeftRight,
                  title: "Internal Transfers",
                  desc: "Move stock between warehouses and locations with full audit trail tracking.",
                  color: "#60a5fa",
                  bg: "rgba(96,165,250,0.08)",
                },
                {
                  icon: BarChart3,
                  title: "Real-Time Dashboard",
                  desc: "KPIs, bar charts, and donut charts showing real-time inventory health at a glance.",
                  color: "#fbbf24",
                  bg: "rgba(251,191,36,0.08)",
                },
                {
                  icon: Warehouse,
                  title: "Multi-Warehouse",
                  desc: "Organize stock across multiple warehouses with sub-locations and per-location tracking.",
                  color: "#22d3ee",
                  bg: "rgba(34,211,238,0.08)",
                },
                {
                  icon: Shield,
                  title: "Secure Authentication",
                  desc: "Login ID based auth, email verification, password reset with bcrypt hashing.",
                  color: "#f472b6",
                  bg: "rgba(244,114,182,0.08)",
                },
              ].map((f) => (
                <Reveal key={f.title}>
                  <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.1] hover:bg-white/[0.04] hover:-translate-y-1 transition-all duration-300 h-full">
                    <div
                      className="inline-flex items-center justify-center size-11 rounded-xl mb-5"
                      style={{ backgroundColor: f.bg }}
                    >
                      <f.icon className="size-5" style={{ color: f.color }} />
                    </div>
                    <h3 className="font-semibold text-[15px] text-white/90 mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-white/35 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <section id="how-it-works" className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/[0.03] via-violet-600/[0.02] to-transparent pointer-events-none" />

          <div className="relative mx-auto max-w-5xl px-6">
            <Reveal>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-4">
                  <Zap className="size-3" /> Process
                </div>
                <h2 className="text-3xl md:text-[44px] font-bold tracking-tight leading-tight">
                  Get Started in{" "}
                  <span className="text-indigo-400">3 Simple Steps</span>
                </h2>
                <p className="mt-4 text-white/35 max-w-md mx-auto">
                  Sign up in minutes and start automating your entire inventory
                  workflow.
                </p>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  step: "01",
                  title: "Create Your Warehouse",
                  desc: "Set up warehouses and sub-locations to match your physical inventory layout.",
                  icon: Warehouse,
                },
                {
                  step: "02",
                  title: "Add Your Products",
                  desc: "Register products with SKUs, categories, costs, and automatic reorder rules.",
                  icon: Package,
                },
                {
                  step: "03",
                  title: "Start Operating",
                  desc: "Process receipts, deliveries, and transfers — stock updates automatically.",
                  icon: TrendingUp,
                },
              ].map((item) => (
                <Reveal key={item.step}>
                  <div className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-7 text-center hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-300 h-full">
                    <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-indigo-500/10 mb-5">
                      <item.icon className="size-6 text-indigo-400" />
                    </div>
                    <div className="absolute top-5 right-5 text-xs font-bold text-white/[0.08]">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-base text-white/90 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/35 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

    
        {/* ══════════ CTA BANNER ══════════ */}
        <section className="py-24">
          <div className="mx-auto max-w-4xl px-6">
            <Reveal>
              <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 md:p-16 text-center shadow-2xl shadow-indigo-500/10 relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

                <div className="relative">
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                    Ready to Take Control
                    <br />
                    of Your Inventory?
                  </h2>
                  <p className="mt-4 text-indigo-100/60 max-w-md mx-auto">
                    Free to use, open source, and built with the latest web
                    technologies. Get started in under 5 minutes.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                    <Link
                      href="/auth/signup"
                      className="inline-flex items-center gap-2 rounded-xl bg-white text-indigo-700 text-sm font-bold h-12 px-8 hover:bg-indigo-50 transition-all shadow-lg"
                    >
                      Create Free Account
                      <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/20 text-sm font-semibold h-12 px-8 text-white hover:bg-white/10 transition-all"
                    >
                      Sign In
                    </Link>
                  </div>
                  <p className="mt-5 text-xs text-indigo-200/40">
                    No credit card required · Free forever
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer className="border-t border-white/[0.04] py-10">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <TrueRouteLogo size="small" />
                <span className="text-sm font-bold">True Route</span>
              </div>
              <div className="flex items-center gap-6 text-[13px] text-white/25">
                <a href="#features" className="hover:text-white/60 transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="hover:text-white/60 transition-colors">
                  Process
                </a>
                <a href="#tech-stack" className="hover:text-white/60 transition-colors">
                  Tech
                </a>
                <Link href="/auth/login" className="hover:text-white/60 transition-colors">
                  Login
                </Link>
              </div>
              <p className="text-xs text-white/15">
                © 2026 True Route · Odoo Hackathon
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
