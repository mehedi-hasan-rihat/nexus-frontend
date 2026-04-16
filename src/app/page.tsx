'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const testimonials = [
  {
    name: 'Md. Rafiqul Islam',
    role: 'Principal, Dhaka Polytechnic Institute',
    avatar: 'RI',
    text: 'Nexus completely transformed how we manage our institute. Attendance, results, and communication — all in one place. Our staff productivity increased by 40%.',
  },
  {
    name: 'Engr. Kamal Hossain',
    role: 'Principal, Chittagong Polytechnic Institute',
    avatar: 'KH',
    text: 'BTEB-aligned reporting and semester management is now effortless. Nexus reduced our administrative workload by 60% within the first month.',
  },
  {
    name: 'Md. Shafiqul Alam',
    role: 'Vice Principal, Rajshahi Polytechnic Institute',
    avatar: 'SA',
    text: 'Class routines and exam schedules across all technology departments — Civil, Electrical, Computer — are now managed in one click. Remarkable platform.',
  },
  {
    name: 'Engr. Nasrin Akter',
    role: 'Head of Department, Khulna Polytechnic Institute',
    avatar: 'NA',
    text: 'Industrial training tracking and student portfolio management is seamless. Nexus is genuinely built for the polytechnic system in Bangladesh.',
  },
];

const features = [
  {
    icon: '🏛️',
    title: 'Multi-Institute Management',
    desc: 'Manage all polytechnic campuses under one dashboard with role-based access for each principal and department head.',
  },
  {
    icon: '📋',
    title: 'BTEB-Aligned Results',
    desc: 'Semester-wise result processing, grade sheets, and transcript generation fully aligned with BTEB standards.',
  },
  {
    icon: '🔧',
    title: 'Department & Trade Management',
    desc: 'Manage Civil, Electrical, Mechanical, Computer, and all other technology departments with dedicated workflows.',
  },
  {
    icon: '🏭',
    title: 'Industrial Training Tracking',
    desc: 'Monitor student industrial attachments, supervisor feedback, and completion status in real time.',
  },
  {
    icon: '📅',
    title: 'Smart Class Scheduling',
    desc: 'Auto-generate conflict-free class routines and lab schedules across all semesters and shifts.',
  },
  {
    icon: '💳',
    title: 'Fee & Stipend Management',
    desc: 'Automate tuition fee collection, government stipend tracking, and overdue payment reminders.',
  },
];

const plans = [
  {
    name: 'Basic',
    price: '৳2,499',
    period: '/month',
    desc: 'Ideal for a single polytechnic institute.',
    features: ['Up to 500 students', '1 institute campus', 'Attendance & results', 'BTEB grade sheet export', 'Email support'],
    cta: 'Get started',
    highlight: false,
  },
  {
    name: 'Standard',
    price: '৳5,999',
    period: '/month',
    desc: 'For polytechnic institutes with multiple departments & shifts.',
    features: ['Up to 2,000 students', '3 campuses', 'All Basic features', 'Industrial training tracking', 'Fee & stipend management', 'Priority support'],
    cta: 'Get started',
    highlight: true,
  },
  {
    name: 'Institute Network',
    price: 'Custom',
    period: '',
    desc: 'For polytechnic institute groups & BTEB-affiliated networks.',
    features: ['Unlimited students', 'Unlimited campuses', 'All Standard features', 'Dedicated account manager', 'Custom BTEB integrations', 'SLA guarantee'],
    cta: 'Contact us',
    highlight: false,
  },
];

function TestimonialSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((index: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  }, [animating]);

  useEffect(() => {
    const timer = setInterval(() => {
      go((current + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, go]);

  const t = testimonials[current];

  return (
    <div className="relative max-w-2xl mx-auto">
      <div
        className="bg-white rounded-2xl p-8 border border-[#e2e8f0] shadow-sm transition-all duration-300"
        style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)' }}
      >
        <div className="flex gap-1 mb-5">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-yellow-400 text-lg">★</span>
          ))}
        </div>
        <p className="text-gray-700 text-lg leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {t.avatar}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
            <p className="text-gray-500 text-xs">{t.role}</p>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'}`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => go((current - 1 + testimonials.length) % testimonials.length)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-9 h-9 rounded-full border border-[#e2e8f0] bg-white flex items-center justify-center text-gray-500 hover:border-blue-600 hover:text-blue-600 transition-colors"
      >
        ‹
      </button>
      <button
        onClick={() => go((current + 1) % testimonials.length)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-9 h-9 rounded-full border border-[#e2e8f0] bg-white flex items-center justify-center text-gray-500 hover:border-blue-600 hover:text-blue-600 transition-colors"
      >
        ›
      </button>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <div className="max-w-6xl mx-auto px-6 h-[66px] flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 select-none">
            <span className="text-[22px] font-black tracking-tight text-gray-900 leading-none">nex</span>
            <span className="text-[22px] font-black tracking-tight text-blue-600 leading-none">us</span>
            <span className="ml-0.5 mb-3 w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
          </Link>

          {/* Nav links — pill group */}
          <div className="hidden md:flex items-center bg-black/[0.04] backdrop-blur-sm border border-black/[0.06] rounded-full px-1 py-1 gap-0.5">
            {[['#features', 'Features'], ['#testimonials', 'Testimonials'], ['#pricing', 'Pricing']].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="relative px-4 py-1.5 text-sm font-medium text-gray-500 rounded-full transition-all duration-200 hover:text-gray-900 hover:bg-white hover:shadow-[0_1px_4px_rgba(0,0,0,0.10)] active:scale-95"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-full hover:bg-black/[0.05] transition-all duration-200 active:scale-95"
            >
              Sign in
            </Link>
            <Link
              href="/campus/create"
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full shadow-[0_1px_3px_rgba(37,99,235,0.4)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.45)] transition-all duration-200 active:scale-95"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f7ff] to-white pt-24 pb-32 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#dbeafe_0%,_transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100 mb-6">
            🎓 The all-in-one polytechnic institute management platform
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Manage your polytechnic.<br />
            <span className="text-blue-600">The smarter way.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Nexus is built for Bangladesh&apos;s polytechnic institutes — BTEB-aligned result processing, department management, industrial training tracking, and more on one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/campus/create"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Start for free →
            </Link>
            <a
              href="#features"
              className="border border-[#e2e8f0] hover:border-blue-300 text-gray-700 font-medium px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              See how it works
            </a>
          </div>
          <p className="mt-5 text-sm text-gray-400">BTEB-aligned · No credit card required · Setup in under 5 minutes</p>
        </div>

        {/* Hero visual */}
        <div className="relative max-w-4xl mx-auto mt-16">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden">
            <div className="bg-gray-50 border-b border-[#e2e8f0] px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="ml-4 flex-1 bg-white rounded border border-[#e2e8f0] h-6 text-xs text-gray-400 flex items-center px-3">
                app.nexus.io/dashboard
              </div>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Total Students', value: '1,248', change: '+12%', color: 'blue' },
                { label: 'Attendance Today', value: '94.2%', change: '+2.1%', color: 'green' },
                { label: 'Pending Fees', value: '৳3,420', change: '-8%', color: 'orange' },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-4 border border-[#e2e8f0]">
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.color === 'orange' ? 'text-orange-500' : 'text-green-500'}`}>{stat.change} this month</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="py-12 border-y border-[#e2e8f0] bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400 mb-8 uppercase tracking-widest font-medium">Trusted by polytechnic institutes across Bangladesh</p>
          <div className="flex flex-wrap justify-center gap-10 items-center">
            {['Dhaka Polytechnic Institute', 'Chittagong Polytechnic Institute', 'Rajshahi Polytechnic Institute', 'Khulna Polytechnic Institute', 'Sylhet Polytechnic Institute'].map((name) => (
              <span key={name} className="text-gray-400 font-semibold text-sm">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Bangladesh Polytechnic Institutes</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Every feature designed around the BTEB curriculum, polytechnic workflows, and the realities of technical education in Bangladesh.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-[#e2e8f0] hover:border-blue-200 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-blue-600 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { value: '120+', label: 'Polytechnic Institutes' },
            { value: '80K+', label: 'Students Enrolled' },
            { value: '99.9%', label: 'Uptime' },
            { value: '4.9★', label: 'Avg. Rating' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-bold mb-1">{s.value}</p>
              <p className="text-blue-200 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by polytechnic institute leaders</h2>
            <p className="text-gray-500 text-lg">Hear from principals and department heads across Bangladesh who run their polytechnic institutes on Nexus.</p>
          </div>
          <TestimonialSlider />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-500 text-lg">Affordable plans for every polytechnic institute. Priced in BDT. No hidden charges.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border transition-all ${
                  plan.highlight
                    ? 'border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-100 scale-105'
                    : 'border-[#e2e8f0] bg-white'
                }`}
              >
                {plan.highlight && (
                  <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    Most popular
                  </span>
                )}
                <h3 className={`font-bold text-xl mb-1 ${plan.highlight ? 'text-white' : 'text-gray-800'}`}>{plan.name}</h3>
                <p className={`text-sm mb-5 ${plan.highlight ? 'text-blue-100' : 'text-gray-500'}`}>{plan.desc}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                  <span className={`text-sm mb-1 ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm">
                      <span className={`text-base ${plan.highlight ? 'text-blue-200' : 'text-blue-600'}`}>✓</span>
                      <span className={plan.highlight ? 'text-blue-50' : 'text-gray-600'}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/campus/create"
                  className={`block text-center py-3 rounded-xl font-medium text-sm transition-colors ${
                    plan.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#f0f7ff] to-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to modernise your polytechnic institute?</h2>
          <p className="text-gray-500 text-lg mb-8">Join 120+ polytechnic institutes across Bangladesh already running smarter with Nexus.</p>
          <Link
            href="/campus/create"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-10 py-4 rounded-xl transition-colors text-base"
          >
            Create your campus →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e2e8f0] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-1 select-none">
            <span className="text-lg font-black tracking-tight text-gray-900 leading-none">nex</span>
            <span className="text-lg font-black tracking-tight text-blue-600 leading-none">us</span>
            <span className="ml-0.5 mb-2.5 w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
          </Link>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Nexus. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
