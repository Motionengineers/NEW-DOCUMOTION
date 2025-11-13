import React from 'react';
import Header from './components/Header';
import LogoGenerator from './components/LogoGenerator';
import ProductVisuals from './components/ProductVisuals';
import LivePreview from './components/LivePreview';
import MotionDashboard from './components/MotionDashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <Header />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <LogoGenerator />
            <ProductVisuals />
          </div>
          <div className="space-y-6 lg:col-span-1">
            <LivePreview />
            <MotionDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
