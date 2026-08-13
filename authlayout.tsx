import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">
              CareerMatch <span className="text-brand-600">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-500 mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
      {/* Right side - visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-600 to-accent-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col justify-center px-16 text-white">
          <h2 className="text-3xl font-bold mb-6 leading-tight">
            Build a Better Resume.
            <br />
            Find Jobs That Actually Match.
          </h2>
          <p className="text-brand-100 mb-8 text-lg">
            AI-powered resume optimization and intelligent job matching to help you find your next opportunity faster.
          </p>
          <div className="space-y-3">
            {[
              'AI-powered ATS resume scoring',
              'Intelligent job matching with compatibility scores',
              'Personalized career insights and recommendations',
              'Track all your applications in one place',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <CheckCircle2 className="w-5 h-5 text-brand-200" />
                <span className="text-brand-50">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
