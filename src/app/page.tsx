'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Marquee from 'react-fast-marquee';
import { Button } from '@/components/ui/Button';

// ── Data ─────────────────────────────────────────────────────────────────────
const testimonials = [
  {
    name: 'Md. Rafiqul Islam',
    role: 'Principal, Dhaka Polytechnic Institute',
    text: 'NEXUS COMPLETELY TRANSFORMED HOW WE MANAGE OUR INSTITUTE. ATTENDANCE, RESULTS, AND COMMUNICATION — ALL IN ONE PLACE.',
  },
  {
    name: 'Engr. Kamal Hossain',
    role: 'Principal, Chittagong Polytechnic Institute',
    text: 'BTEB-ALIGNED REPORTING AND SEMESTER MANAGEMENT IS NOW EFFORTLESS. NEXUS REDUCED OUR ADMINISTRATIVE WORKLOAD BY 60%.',
  },
  {
    name: 'Engr. Nasrin Akter',
    role: 'Head of Department, Khulna Polytechnic Institute',
    text: 'INDUSTRIAL TRAINING TRACKING AND STUDENT PORTFOLIO MANAGEMENT IS SEAMLESS. NEXUS IS GENUINELY BUILT FOR THE POLYTECHNIC SYSTEM.',
  },
];

const features = [
  {
    title: 'MULTI-INSTITUTE MANAGEMENT',
    desc: 'Manage all polytechnic campuses under one dashboard with role-based access for each principal and department head.',
  },
  {
    title: 'BTEB-ALIGNED RESULTS',
    desc: 'Semester-wise result processing, grade sheets, and transcript generation fully aligned with BTEB standards.',
  },
  {
    title: 'DEPARTMENT & TRADE MANAGEMENT',
    desc: 'Manage Civil, Electrical, Mechanical, Computer, and all other technology departments with dedicated workflows.',
  },
  {
    title: 'INDUSTRIAL TRAINING TRACKING',
    desc: 'Monitor student industrial attachments, supervisor feedback, and completion status in real time.',
  },
  {
    title: 'SMART CLASS SCHEDULING',
    desc: 'Auto-generate conflict-free class routines and lab schedules across all semesters and shifts.',
  },
  {
    title: 'FEE & STIPEND MANAGEMENT',
    desc: 'Automate tuition fee collection, government stipend tracking, and overdue payment reminders.',
  },
];

const plans = [
  {
    name: 'BASIC',
    price: '৳2,499',
    period: '/MONTH',
    features: [
      'UP TO 500 STUDENTS',
      '1 INSTITUTE CAMPUS',
      'ATTENDANCE & RESULTS',
      'BTEB GRADE SHEET EXPORT',
      'EMAIL SUPPORT',
    ],
  },
  {
    name: 'STANDARD',
    price: '৳5,999',
    period: '/MONTH',
    features: [
      'UP TO 2,000 STUDENTS',
      '3 CAMPUSES',
      'ALL BASIC FEATURES',
      'INDUSTRIAL TRAINING TRACKING',
      'FEE & STIPEND MANAGEMENT',
      'PRIORITY SUPPORT',
    ],
    highlight: true,
  },
  {
    name: 'INSTITUTE NETWORK',
    price: 'CUSTOM',
    period: '',
    features: [
      'UNLIMITED STUDENTS',
      'UNLIMITED CAMPUSES',
      'ALL STANDARD FEATURES',
      'DEDICATED ACCOUNT MANAGER',
      'CUSTOM BTEB INTEGRATIONS',
      'SLA GUARANTEE',
    ],
  },
];

const steps = [
  {
    number: '01',
    title: 'REGISTER YOUR CAMPUS',
    desc: 'Create your institute profile, set your campus code, and assign a principal account in under 5 minutes.',
  },
  {
    number: '02',
    title: 'ADD DEPARTMENTS & STAFF',
    desc: 'Onboard your technology departments — Civil, Electrical, Computer, Mechanical — and invite teachers and HODs.',
  },
  {
    number: '03',
    title: 'ENROL STUDENTS',
    desc: 'Import or manually add students by semester, session, and shift. Roll numbers and BTEB IDs are tracked automatically.',
  },
  {
    number: '04',
    title: 'RUN YOUR INSTITUTE',
    desc: 'Submit marks, generate BTEB-aligned grade sheets, track industrial training, and manage fees — all from one dashboard.',
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[--background] text-[--foreground] overflow-x-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[--background] border-b-2 border-[--border]">
        <div className="max-w-[95vw] mx-auto px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[--accent] flex items-center justify-center">
              <span className="text-2xl font-bold text-[--accent-foreground]">N</span>
            </div>
            <span className="text-2xl font-bold uppercase tracking-tighter">NEXUS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {['FEATURES', 'HOW IT WORKS', 'TESTIMONIALS', 'PRICING'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm font-bold uppercase tracking-wide text-[--muted-foreground] hover:text-[--accent] transition-colors duration-200"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-bold uppercase tracking-wide text-[--muted-foreground] hover:text-[--foreground] transition-colors duration-200"
            >
              SIGN IN
            </Link>
            <Button>
              <Link href="/campus/create">CREATE CAMPUS</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[95vw] mx-auto px-8 py-32">
        <div 
          className="relative"
          style={{
            transform: `scale(${1 + scrollY * 0.0002})`,
            opacity: Math.max(0, 1 - scrollY * 0.002),
          }}
        >
          <div className="mb-8">
            <span className="inline-block px-4 py-2 border-2 border-[--accent] text-xs font-mono uppercase tracking-widest text-[--accent]">
              BUILT FOR BANGLADESH POLYTECHNICS
            </span>
          </div>

          <h1 className="text-[clamp(3rem,12vw,14rem)] font-bold uppercase leading-[0.8] tracking-tighter mb-12">
            MANAGE YOUR
            <br />
            <span className="text-[--accent]">POLYTECHNIC</span>
            <br />
            INSTITUTE
          </h1>

          <p className="text-xl md:text-2xl text-[--muted-foreground] leading-tight max-w-2xl mb-12">
            Nexus is the all-in-one management platform built specifically for Bangladesh's polytechnic institutes — BTEB-aligned, department-aware, and designed for how you actually work.
          </p>

          <div className="flex flex-wrap gap-4 mb-16">
            <Button size="large">
              <Link href="/campus/create">CREATE CAMPUS →</Link>
            </Button>
            <Button variant="secondary" size="large">
              <Link href="#how-it-works">SEE HOW IT WORKS</Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-8 text-sm font-bold uppercase tracking-wide text-[--muted-foreground]">
            <span>✓ NO CREDIT CARD REQUIRED</span>
            <span>✓ 14-DAY FREE TRIAL</span>
            <span>✓ BTEB-COMPLIANT</span>
          </div>
        </div>
      </section>

      {/* ── Stats Marquee ─────────────────────────────────────────────────── */}
      <section className="bg-[--accent] py-12 border-y-2 border-[--accent]">
        <Marquee speed={80} gradient={false}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-16 mx-16">
              <div className="flex items-center gap-4">
                <span className="text-[8rem] font-bold text-[--accent-foreground] leading-none">120+</span>
                <span className="text-xl font-bold uppercase tracking-wide text-[--accent-foreground]">INSTITUTES</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[8rem] font-bold text-[--accent-foreground] leading-none">80K+</span>
                <span className="text-xl font-bold uppercase tracking-wide text-[--accent-foreground]">STUDENTS</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[8rem] font-bold text-[--accent-foreground] leading-none">99.9%</span>
                <span className="text-xl font-bold uppercase tracking-wide text-[--accent-foreground]">UPTIME</span>
              </div>
            </div>
          ))}
        </Marquee>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-[95vw] mx-auto px-8 py-32">
        <div className="mb-20">
          <span className="inline-block px-4 py-2 border-2 border-[--accent] text-xs font-mono uppercase tracking-widest text-[--accent] mb-8">
            FEATURES
          </span>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase leading-none tracking-tighter mb-8">
            EVERYTHING YOUR
            <br />
            INSTITUTE NEEDS
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[--border]">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative bg-[--background] p-12 border-2 border-[--border] hover:bg-[--accent] hover:border-[--accent] transition-all duration-300"
            >
              <div className="absolute top-8 right-8 text-[8rem] font-bold text-[--muted] group-hover:text-[--accent-foreground] leading-none opacity-20 transition-colors duration-300">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter mb-4 group-hover:text-[--accent-foreground] transition-colors duration-300 relative z-10">
                {f.title}
              </h3>
              <p className="text-lg text-[--muted-foreground] leading-tight group-hover:text-[--accent-foreground] transition-colors duration-300 relative z-10">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-[--muted] border-y-2 border-[--border] py-32">
        <div className="max-w-[95vw] mx-auto px-8">
          <div className="mb-20">
            <span className="inline-block px-4 py-2 border-2 border-[--accent] text-xs font-mono uppercase tracking-widest text-[--accent] mb-8">
              HOW IT WORKS
            </span>
            <h2 className="text-5xl md:text-7xl font-bold uppercase leading-none tracking-tighter">
              UP AND RUNNING IN
              <br />
              <span className="text-[--accent]">FOUR SIMPLE STEPS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="text-[12rem] font-bold text-[--border] leading-none mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tighter mb-4">{step.title}</h3>
                <p className="text-lg text-[--muted-foreground] leading-tight">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-32 overflow-hidden">
        <div className="max-w-[95vw] mx-auto px-8 mb-20">
          <span className="inline-block px-4 py-2 border-2 border-[--accent] text-xs font-mono uppercase tracking-widest text-[--accent] mb-8">
            TESTIMONIALS
          </span>
          <h2 className="text-5xl md:text-7xl font-bold uppercase leading-none tracking-tighter">
            PRINCIPALS AND HODS
            <br />
            <span className="text-[--accent]">LOVE NEXUS</span>
          </h2>
        </div>

        <Marquee speed={40} gradient={false}>
          {testimonials.map((t, i) => (
            <div key={i} className="w-[600px] mx-8 bg-[--card] border-2 border-[--border] p-12">
              <p className="text-2xl font-bold uppercase tracking-tight leading-tight mb-8">
                "{t.text}"
              </p>
              <div>
                <p className="text-lg font-bold uppercase tracking-wide">{t.name}</p>
                <p className="text-sm uppercase tracking-wide text-[--muted-foreground]">{t.role}</p>
              </div>
            </div>
          ))}
        </Marquee>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="bg-[--muted] border-y-2 border-[--border] py-32">
        <div className="max-w-[95vw] mx-auto px-8">
          <div className="mb-20">
            <span className="inline-block px-4 py-2 border-2 border-[--accent] text-xs font-mono uppercase tracking-widest text-[--accent] mb-8">
              PRICING
            </span>
            <h2 className="text-5xl md:text-7xl font-bold uppercase leading-none tracking-tighter">
              SIMPLE, TRANSPARENT
              <br />
              <span className="text-[--accent]">PRICING</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-px bg-[--border]">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-[--background] p-12 border-2 ${
                  plan.highlight ? 'border-[--accent] bg-[--accent]' : 'border-[--border]'
                }`}
              >
                <h3 className={`text-3xl font-bold uppercase tracking-tighter mb-2 ${
                  plan.highlight ? 'text-[--accent-foreground]' : ''
                }`}>
                  {plan.name}
                </h3>
                <div className="flex items-end gap-2 mb-8">
                  <span className={`text-[6rem] font-bold leading-none ${
                    plan.highlight ? 'text-[--accent-foreground]' : ''
                  }`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-xl font-bold uppercase mb-4 ${
                      plan.highlight ? 'text-[--accent-foreground]' : 'text-[--muted-foreground]'
                    }`}>
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul className="space-y-4 mb-12">
                  {plan.features.map((feat) => (
                    <li key={feat} className={`flex items-start gap-3 text-lg font-bold uppercase tracking-wide ${
                      plan.highlight ? 'text-[--accent-foreground]' : ''
                    }`}>
                      <span className={plan.highlight ? 'text-[--accent-foreground]' : 'text-[--accent]'}>✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button variant={plan.highlight ? 'primary' : 'secondary'} size="large" className="w-full">
                  <Link href="/campus/create">CREATE CAMPUS</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="py-32">
        <div className="max-w-[95vw] mx-auto px-8 text-center">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase leading-none tracking-tighter mb-12">
            READY TO MODERNISE
            <br />
            YOUR <span className="text-[--accent]">POLYTECHNIC</span>
            <br />
            INSTITUTE?
          </h2>
          <p className="text-xl md:text-2xl text-[--muted-foreground] mb-12 max-w-2xl mx-auto">
            Join 120+ polytechnic institutes already running on Nexus. Start your free 14-day trial — no credit card, no commitment.
          </p>
          <Button size="large">
            <Link href="/campus/create">CREATE CAMPUS →</Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-[--background] border-t-2 border-[--border]">
        <div className="max-w-[95vw] mx-auto px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[--accent] flex items-center justify-center">
                  <span className="text-2xl font-bold text-[--accent-foreground]">N</span>
                </div>
                <span className="text-2xl font-bold uppercase tracking-tighter">NEXUS</span>
              </Link>
              <p className="text-sm uppercase tracking-wide text-[--muted-foreground]">
                THE POLYTECHNIC INSTITUTE MANAGEMENT PLATFORM BUILT FOR BANGLADESH.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4">PRODUCT</h4>
              <ul className="space-y-3">
                {['FEATURES', 'HOW IT WORKS', 'PRICING'].map((item) => (
                  <li key={item}>
                    <Link
                      href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm uppercase tracking-wide text-[--muted-foreground] hover:text-[--accent] transition-colors duration-200"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4">COMPANY</h4>
              <ul className="space-y-3">
                {['ABOUT', 'BLOG', 'CAREERS'].map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase()}`}
                      className="text-sm uppercase tracking-wide text-[--muted-foreground] hover:text-[--accent] transition-colors duration-200"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4">LEGAL</h4>
              <ul className="space-y-3">
                {['PRIVACY', 'TERMS', 'SECURITY'].map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase()}`}
                      className="text-sm uppercase tracking-wide text-[--muted-foreground] hover:text-[--accent] transition-colors duration-200"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-[--border] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-wide text-[--muted-foreground]">
              © {new Date().getFullYear()} NEXUS TECHNOLOGIES LTD. ALL RIGHTS RESERVED.
            </p>
            <p className="text-xs uppercase tracking-wide text-[--muted-foreground]">
              MADE WITH ♥ FOR BANGLADESH'S POLYTECHNIC EDUCATORS
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
