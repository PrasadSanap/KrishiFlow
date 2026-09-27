import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck, Ticket, MapPin, Bell, Package, Wallet,
  UserPlus, ClipboardList, ScanLine, Radar, CheckCircle2, IndianRupee,
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';

const features = [
  { icon: CalendarCheck, title: 'Smart Slot Booking', desc: 'Book a procurement time slot in seconds and avoid long lines at the centre.' },
  { icon: Ticket, title: 'Digital Token', desc: 'Get a unique digital queue token the moment you book your slot.' },
  { icon: MapPin, title: 'Live Queue Tracking', desc: 'See exactly how many farmers are ahead of you and your estimated wait time.' },
  { icon: Bell, title: 'Smart Notifications', desc: 'Get notified the moment your turn is approaching — no more waiting around.' },
  { icon: Package, title: 'Procurement Tracking', desc: 'Track every stage: arrival, quality check, weighing, and completion.' },
  { icon: Wallet, title: 'Payment Tracking', desc: 'Know exactly when your payment is processed and completed.' },
];

const steps = [
  { icon: UserPlus, title: 'Register' },
  { icon: CalendarCheck, title: 'Book Slot' },
  { icon: Ticket, title: 'Receive Token' },
  { icon: Radar, title: 'Track Queue' },
  { icon: ScanLine, title: 'Complete Procurement' },
  { icon: IndianRupee, title: 'Track Payment' },
];

const LandingPage = () => {
  return (
    <MainLayout>
      <section className="bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">🌾 KrishiFlow</h1>
          <p className="text-xl text-primary-700 font-semibold mb-3">Smart Procurement Slot & Queue Management</p>
          <p className="text-gray-500 max-w-xl mx-auto mb-8">
            "Book your slot. Track your queue. Know your payment."
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-primary text-base px-8 py-3">
              Book a Slot
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3">
              Login
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            A prototype built for Smart India Hackathon 2026 — Ministry of Consumer Affairs, Food & Public Distribution
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">Everything a farmer needs, in one place</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                <f.icon className="text-primary-600" size={22} />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {steps.map((s, i) => (
              <div key={s.title} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center mb-3 relative">
                  <s.icon size={24} />
                  <span className="absolute -top-1 -right-1 bg-white text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm font-medium">{s.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <CheckCircle2 className="mx-auto text-primary-600 mb-4" size={36} />
        <h2 className="text-2xl font-bold mb-3">Ready to skip the wait?</h2>
        <p className="text-gray-500 mb-6">Register in under a minute and book your first procurement slot today.</p>
        <Link to="/register" className="btn-primary text-base px-8 py-3">
          Get Started
        </Link>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
