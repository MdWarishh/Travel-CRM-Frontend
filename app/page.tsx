import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 h-16 bg-slate-50/85 backdrop-blur-md border-b border-slate-200/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L13 5V11L8 14L3 11V5L8 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="8" cy="8" r="2" fill="white" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            Travel<span className="text-blue-600">CRM</span>
          </span>
        </div>
        <span className="text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
          Internal System
        </span>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] z-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.09) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 text-center max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-blue-600 tracking-widest uppercase bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Purpose-Built for Travel Professionals
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight text-slate-900 mb-5">
            Your Agency.<br />
            <span className="bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Fully in Control.
            </span>
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto mb-9">
            One intelligent system to manage every lead, booking, itinerary, and client relationship — built for the way your team actually works.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px] transition-all shadow-[0_4px_14px_rgba(37,99,235,0.28)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.38)] hover:-translate-y-px"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Get Started
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-[1.5px] border-slate-300 text-slate-600 font-medium text-[15px] hover:border-slate-400 hover:bg-slate-100 transition-all hover:-translate-y-px"
            >
              Explore Features
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-5 mt-11 flex-wrap text-[13px] text-slate-400">
            {['Role-Based Access Control', 'Real-Time Notifications', 'Secure & Private'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <svg className="text-green-500" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative z-10 mt-16 w-full max-w-4xl">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-200">
              <div className="w-3 h-3 rounded-full bg-red-300" />
              <div className="w-3 h-3 rounded-full bg-yellow-300" />
              <div className="w-3 h-3 rounded-full bg-green-300" />
              <div className="flex-1 ml-3 bg-slate-100 rounded-md px-3 py-1 text-[11px] text-slate-400 flex items-center gap-1.5">
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                app.travelcrm.com / dashboard
              </div>
            </div>
            {/* Body */}
            <div className="flex">
              {/* Sidebar */}
              <div className="w-44 bg-slate-50 border-r border-slate-100 p-4 shrink-0 hidden md:block">
                <div className="flex items-center gap-2 mb-5 px-1">
                  <div className="w-5 h-5 rounded-md bg-blue-600" />
                  <span className="text-[11px] font-semibold text-blue-800">TravelCRM</span>
                </div>
                {['Dashboard', 'Leads', 'Customers', 'Itineraries', 'Bookings', 'Payments', 'Reports'].map((item, i) => (
                  <div
                    key={item}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11.5px] mb-0.5 ${
                      i === 0 ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-500'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-blue-600' : 'bg-slate-300'}`} />
                    {item}
                  </div>
                ))}
              </div>
              {/* Main */}
              <div className="flex-1 p-5 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-900">Good morning, Rahul 👋</span>
                  <span className="text-[11px] text-slate-400">Thursday, 16 Apr 2026</span>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-4 gap-2.5 mb-4">
                  {[
                    { label: 'Total Leads', val: '248', badge: '+12 this week', color: 'text-green-600 bg-green-50' },
                    { label: 'Converted', val: '64', badge: '25.8%', color: 'text-green-600 bg-green-50' },
                    { label: 'Active Bookings', val: '31', badge: '5 pending', color: 'text-amber-600 bg-amber-50' },
                    { label: 'Revenue (Apr)', val: '₹4.2L', badge: '+18%', color: 'text-green-600 bg-green-50' },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="text-[10px] text-slate-400 mb-1">{s.label}</div>
                      <div className="text-lg font-bold text-slate-900">{s.val}</div>
                      <div className={`text-[9px] font-medium px-1.5 py-0.5 rounded mt-1 inline-block ${s.color}`}>{s.badge}</div>
                    </div>
                  ))}
                </div>
                {/* Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-4 bg-slate-100 px-3 py-2">
                    {['Client', 'Destination', 'Status', 'Agent'].map((h) => (
                      <div key={h} className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{h}</div>
                    ))}
                  </div>
                  {[
                    { init: 'AK', name: 'Anil Kapoor', dest: 'Maldives, 5N', status: 'Quoted', statusColor: 'bg-green-100 text-green-700', agent: 'Priya S.', avatarColor: 'bg-blue-100 text-blue-700' },
                    { init: 'SM', name: 'Sunita Mehta', dest: 'Europe, 12N', status: 'Follow-up', statusColor: 'bg-amber-100 text-amber-700', agent: 'Arjun R.', avatarColor: 'bg-green-100 text-green-700' },
                    { init: 'RJ', name: 'Raj Joshi', dest: 'Dubai, 7N', status: 'Negotiation', statusColor: 'bg-blue-100 text-blue-700', agent: 'Neha M.', avatarColor: 'bg-yellow-100 text-yellow-700' },
                    { init: 'PG', name: 'Pooja Gupta', dest: 'Thailand, 8N', status: 'Confirmed', statusColor: 'bg-green-100 text-green-700', agent: 'Priya S.', avatarColor: 'bg-violet-100 text-violet-700' },
                  ].map((row) => (
                    <div key={row.name} className="grid grid-cols-4 border-t border-slate-100 px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-800">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${row.avatarColor}`}>{row.init}</div>
                        {row.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center">{row.dest}</div>
                      <div className="flex items-center">
                        <span className={`text-[9.5px] font-medium px-2 py-0.5 rounded-full ${row.statusColor}`}>{row.status}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center">{row.agent}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="text-[11px] font-medium text-slate-400 tracking-widest uppercase mb-12">Built for operational excellence</p>
          <div className="grid grid-cols-3 divide-x divide-slate-200">
            {[
              { num: '10+', desc: 'Core modules covering every workflow' },
              { num: '4×', desc: 'Faster lead-to-booking conversion' },
              { num: '0ms', desc: 'Real-time updates across your team' },
            ].map((s) => (
              <div key={s.num} className="px-10 py-8">
                <div className="text-5xl font-bold text-slate-900 tracking-tight mb-2">{s.num}</div>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-[11px] font-medium text-blue-600 tracking-widest uppercase mb-3">Everything you need</p>
          <h2 className="text-3xl font-bold text-slate-900 text-center tracking-tight mb-3">Built for how travel agencies actually work</h2>
          <p className="text-[15px] text-slate-500 text-center max-w-lg mx-auto mb-14 leading-relaxed">
            Every module is purpose-designed for travel operations — not adapted from a generic CRM template.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '👥', title: 'Lead Management', desc: 'Capture leads from all channels — WhatsApp, web forms, walk-ins. Track every conversation with a visual pipeline.', bg: 'bg-blue-50' },
              { icon: '🗺️', title: 'Itinerary Builder', desc: 'Design day-by-day travel plans with hotels, transfers, and activities. Export polished PDF itineraries instantly.', bg: 'bg-teal-50' },
              { icon: '📅', title: 'Booking & Scheduling', desc: 'Track every hotel, flight, and activity booking with real-time status and supplier coordination built in.', bg: 'bg-violet-50' },
              { icon: '🧾', title: 'Payments & Invoicing', desc: 'Record payments across cash, UPI, bank transfer. Generate branded invoices and track partial payments.', bg: 'bg-amber-50' },
              { icon: '📊', title: 'Reports & Analytics', desc: 'Role-specific dashboards with conversion reports, agent performance, and revenue summaries.', bg: 'bg-slate-100' },
              { icon: '🔔', title: 'Real-Time Alerts', desc: 'Live notifications for new leads, assignments, follow-up reminders, and team activity via Socket.IO.', bg: 'bg-green-50' },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 transition-all duration-200"
              >
                <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center text-lg mb-4`}>{f.icon}</div>
                <div className="text-[14.5px] font-semibold text-slate-900 mb-2">{f.title}</div>
                <div className="text-[13.5px] text-slate-500 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 px-6 bg-slate-900 text-center">
        <p className="text-6xl text-blue-500 opacity-60 font-serif leading-none mb-4">&ldquo;</p>
        <p className="text-xl sm:text-2xl text-slate-300 font-light leading-relaxed max-w-2xl mx-auto mb-8">
          A travel agency runs on{' '}
          <span className="text-blue-400 font-medium">relationships, timing, and trust.</span>{' '}
          This CRM is engineered to protect all three — giving your team the clarity to act fast and the tools to never let a client fall through the cracks.
        </p>
        <p className="text-sm text-slate-500">— Built exclusively for your agency</p>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white text-center">
        <div className="max-w-lg mx-auto bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-2xl px-12 py-14">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3 leading-snug">
            Ready to take control of your operations?
          </h2>
          <p className="text-[15px] text-slate-500 leading-relaxed mb-8">
            Your entire agency — leads, bookings, itineraries, payments, and team — all in one place.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2.5 px-9 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition-all shadow-[0_4px_14px_rgba(37,99,235,0.28)] hover:shadow-[0_6px_22px_rgba(37,99,235,0.38)] hover:-translate-y-px"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Go to Login
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-12 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12.5px] text-slate-400">© 2026 TravelCRM · Internal System · All rights reserved</p>
        <p className="text-[12.5px] text-slate-400">Secure · Private · Built for your team</p>
      </footer>

    </div>
  );
}