import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, ArrowRight, Activity, Heart, Shield, Sparkles } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#2f4f4f] selection:bg-[#e6e6fa] selection:text-[#483d8b]">
      {/* Header */}
      <header className="px-6 lg:px-12 py-6 flex items-center justify-between border-b border-[#f3f4f6]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#e6e6fa] p-2 rounded-xl">
            <Brain className="w-6 h-6 text-[#483d8b]" />
          </div>
          <span className="text-xl font-semibold tracking-tight">MindMirror</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium hover:text-[#483d8b] transition-colors">
            Log in
          </Link>
          <Link to="/register" className="bg-[#483d8b] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#5e50a8] transition-colors shadow-sm">
            Get Started
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="px-6 lg:px-12 py-24 lg:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5f3ff] text-[#483d8b] text-sm font-medium mb-8 border border-[#ddd6fe]">
            <Sparkles className="w-4 h-4" />
            <span>Your personal AI journaling companion</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-[#2f4f4f] mb-8 leading-[1.1]">
            Understand your emotions, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#483d8b] to-[#8b5cf6]">one reflection at a time.</span>
          </h1>
          <p className="text-xl text-[#64748b] mb-12 max-w-2xl leading-relaxed">
            MindMirror combines the proven benefits of journaling with empathetic AI to help you uncover patterns, track moods, and gain deeper emotional clarity.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/register" className="bg-[#483d8b] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#5e50a8] transition-all shadow-md flex items-center gap-2 group w-full sm:w-auto justify-center">
              Start your journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-full text-lg font-medium text-[#483d8b] bg-white border border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors w-full sm:w-auto justify-center flex">
              Log in to account
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 lg:px-12 py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-start">
                <div className="w-14 h-14 bg-[#f5f3ff] text-[#483d8b] rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Empathetic AI</h3>
                <p className="text-[#64748b] leading-relaxed">
                  Converse with an AI that listens without judgment. Receive thoughtful reflections that help you untangle complex feelings.
                </p>
              </div>
              <div className="flex flex-col items-start">
                <div className="w-14 h-14 bg-[#f5f3ff] text-[#483d8b] rounded-2xl flex items-center justify-center mb-6">
                  <Activity className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Mood Tracking</h3>
                <p className="text-[#64748b] leading-relaxed">
                  Automatically identify underlying emotions in your writing. Watch your emotional landscape shift over time.
                </p>
              </div>
              <div className="flex flex-col items-start">
                <div className="w-14 h-14 bg-[#f5f3ff] text-[#483d8b] rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Private & Secure</h3>
                <p className="text-[#64748b] leading-relaxed">
                  Your thoughts are strictly your own. Designed with premium privacy standards to ensure your journal remains a safe space.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 lg:px-12 py-12 border-t border-[#e5e7eb] flex flex-col md:flex-row items-center justify-between gap-6 text-[#64748b] bg-white">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          <span className="font-semibold">MindMirror</span>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} MindMirror. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
