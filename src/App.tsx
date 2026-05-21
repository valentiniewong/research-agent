/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play } from 'lucide-react';

export default function App() {
  return (
    <div className="bg-[#EBEBEB] min-h-screen text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-white flex flex-col overflow-x-hidden">
      
      {/* Top Banner */}
      <div className="bg-[#1A1A1A] text-white text-[10px] font-bold tracking-[0.3em] uppercase text-center py-3 px-4">
        Grey Days 2026 Edition — Now Available Online
      </div>

      {/* Header */}
      <header className="flex items-center justify-between h-16 px-6 md:px-10 border-b border-white bg-[#EBEBEB] sticky top-0 z-50">
        <div className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
          NB.
        </div>
        <nav className="hidden md:flex items-center gap-8 text-[10px] font-bold tracking-[0.2em] uppercase">
          <a href="#" className="hover:text-neutral-500 transition-colors">Grey Days</a>
          <a href="#" className="hover:text-neutral-500 transition-colors">Performance</a>
          <a href="#" className="hover:text-neutral-500 transition-colors">Lifestyle</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row min-h-[70vh] border-b border-white bg-[#EBEBEB] relative">
        <div className="w-full lg:w-[40%] bg-white p-12 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#EBEBEB] order-2 lg:order-1 relative z-10">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400 mb-6">
            The color that defines us.
          </p>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase leading-[0.85] tracking-tighter mb-8">
            Grey<br/>Days 2026
          </h1>
          <p className="text-neutral-500 text-sm leading-relaxed max-w-xs uppercase font-medium mb-12">
            An exploration of balance through unified expression. For 2026, we distill our high-performance running innovations down into their purest tonal form.
          </p>
          <div>
            <button className="bg-[#1A1A1A] text-white px-8 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-colors w-full sm:w-auto">
              View Product Focus
            </button>
          </div>
        </div>
        
        {/* Right side - User Animated Video Container */}
        <div className="w-full lg:w-[60%] relative order-1 lg:order-2 h-[50vh] lg:h-auto bg-[#D9D9D9] overflow-hidden flex items-center justify-center">
           <div className="absolute inset-0 bg-neutral-400 mix-blend-multiply opacity-20 pointer-events-none z-10"></div>
           
           {/* 
              Note: Replace the src with your actual uploaded video file path.
              Using a generic high-quality running placeholder styled strictly in grayscale to match constraints.
           */}
           <video 
            className="absolute inset-0 w-full h-full object-cover grayscale brightness-90 animate-pulse pointer-events-none"
            autoPlay 
            loop 
            muted 
            playsInline
            poster="https://images.unsplash.com/photo-1553676597-3fc74cefa54a?auto=format&fit=crop&q=80&w=2000"
          >
            {/* <source src="/your-animated-video.mp4" type="video/mp4" /> */}
          </video>
          
          {/* Subtle overlay mockup graphic representing the GD-2026 circle in the reference */}
          <div className="relative z-20 w-64 h-64 border border-dashed border-white/60 rounded-full flex items-center justify-center mix-blend-overlay">
            <div className="absolute w-full h-[1px] bg-white/60 border-dashed"></div>
            <span className="bg-white/10 backdrop-blur-sm px-4 py-1 text-[10px] tracking-[0.3em] font-bold text-white uppercase border border-white/40">
              GD-2026
            </span>
          </div>
        </div>
      </section>

      {/* Product Spotlight Section */}
      <section className="py-24 px-6 md:px-12 bg-[#EBEBEB] border-b border-white">
        <div className="text-center mb-16">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400 mb-4">
            Exclusive Release Spotlight
          </p>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            FuelCell Rebel v5
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 max-w-6xl mx-auto items-stretch border border-white">
          {/* Product Image Area */}
          <div className="bg-[#D9D9D9] aspect-square md:aspect-[4/3] lg:aspect-auto relative p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-white group">
            <div className="absolute inset-0 bg-neutral-400 mix-blend-multiply opacity-10 pointer-events-none"></div>
            <span className="absolute top-6 left-6 border border-[#1A1A1A] px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase text-[#1A1A1A] bg-[#EBEBEB]">
              Limited Run
            </span>
            {/* Generic placeholder image stylized to pure grayscale */}
            <img 
              src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80" 
              alt="FuelCell Rebel v5 Grey Days" 
              className="w-full h-full object-contain object-center grayscale mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out p-8"
            />
          </div>

          {/* Product Details Area */}
          <div className="flex flex-col bg-white p-12 justify-between">
            <div>
              <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-2">
                FuelCell Rebel v5
              </h3>
              <p className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase mb-8">
                Grey Days 2026 Special Edition
              </p>
              
              <div className="flex items-center space-x-4 mb-8">
                <div className="h-[1px] w-12 bg-[#1A1A1A]"></div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] italic font-serif">RM 679.00</span>
              </div>
              
              <p className="text-neutral-500 text-sm leading-relaxed uppercase font-medium mb-12">
                Stripped of all distractions. Built with a highly responsive geometric FuelCell foam midsole configuration, the Rebel v5 arrives rendered completely in a series of iconic grey overlays. True technical delivery wrapped inside a historic uniform.
              </p>
            </div>

            <div>
              <div className="space-y-6 mb-12">
                {[
                  "Propulsive FuelCell compound for maximized energy retention",
                  "Deconstructed breathable engineered mesh material",
                  "Exclusive monochromatic color layout profiling"
                ].map((feature, i) => (
                  <div key={i} className="flex justify-between items-end border-b border-neutral-100 pb-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold whitespace-nowrap mr-6">Feature 0{i + 1}</span>
                    <span className="text-sm italic font-serif text-right line-clamp-1 text-neutral-500" title={feature}>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-[#1A1A1A] text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-colors">
                  Purchase Online
                </button>
                <button className="flex-1 border border-[#1A1A1A] bg-transparent text-[#1A1A1A] py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#1A1A1A] hover:text-white transition-colors">
                  Check Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cohort / Other Products Section */}
      <section className="py-24 px-6 md:px-12 bg-[#EBEBEB]">
        <div className="text-center mb-16">
          <p className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase mb-4">
            Extended Variations
          </p>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            The Grey Cohort
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-stretch max-w-6xl mx-auto border-t border-l border-white bg-[#EBEBEB]">
          {/* Sidebar Label Equivalent */}
          <div className="hidden md:flex w-16 border-r border-b md:border-b-0 border-white items-center justify-center py-12">
            <div className="rotate-[-90deg] whitespace-nowrap text-[10px] uppercase tracking-[0.5em] font-black text-neutral-400">
              GREY SERIES COLLECTION
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3">
            {/* Cohort Item 1 */}
            <div className="bg-[#EBEBEB] p-6 border-r border-b md:border-b-0 border-white hover:bg-neutral-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4">01 // 9060 'Grey Days'</div>
              <div className="w-full aspect-square bg-[#D9D9D9] mb-4 flex items-center justify-center p-8 overflow-hidden relative opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-neutral-400 mix-blend-multiply opacity-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80" 
                  alt="9060" 
                  className="w-full h-full object-contain grayscale mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex justify-between items-end">
                <h4 className="text-[10px] uppercase font-bold text-neutral-500">View Product</h4>
                <p className="text-[10px] font-bold tracking-widest uppercase">RM 719.00</p>
              </div>
            </div>

            {/* Cohort Item 2 */}
            <div className="bg-white p-6 border-r border-b md:border-b-0 border-white hover:bg-neutral-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4">02 // 574 Legacy Grey</div>
              <div className="w-full aspect-square bg-[#EBEBEB] mb-4 flex items-center justify-center p-8 overflow-hidden relative group-hover:bg-[#D9D9D9] transition-colors">
                <img 
                  src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80" 
                  alt="574 Legacy" 
                  className="w-full h-full object-contain grayscale mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex justify-between items-end">
                <h4 className="text-[10px] uppercase font-bold text-neutral-500">View Product</h4>
                <p className="text-[10px] font-bold tracking-widest uppercase">RM 469.00</p>
              </div>
            </div>

            {/* Cohort Item 3 */}
            <div className="bg-[#EBEBEB] p-6 border-r border-b md:border-b-0 border-white hover:bg-neutral-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4">03 // Classic Terry Crew</div>
              <div className="w-full aspect-square bg-[#D9D9D9] mb-4 flex items-center justify-center p-8 overflow-hidden relative opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-neutral-400 mix-blend-multiply opacity-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80" 
                  alt="Terry Crew" 
                  className="w-full h-full object-contain grayscale opacity-90 mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex justify-between items-end">
                <h4 className="text-[10px] uppercase font-bold text-neutral-500">View Product</h4>
                <p className="text-[10px] font-bold tracking-widest uppercase">RM 329.00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-100 border-t border-white py-8 px-6 md:px-10 text-center md:text-left text-[#1A1A1A]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] uppercase tracking-widest font-medium text-neutral-400 italic">
            © 2026 New Balance. Compiled Digital Layout Mockup.
          </p>
          <div className="flex gap-6 text-[9px] uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-neutral-500 transition-colors">Malaysia Online Hub</a>
            <a href="#" className="hover:text-neutral-500 transition-colors">Location Directory</a>
            <a href="#" className="hover:text-neutral-500 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

