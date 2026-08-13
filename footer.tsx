import { Link } from 'react-router-dom';
import { Sparkles, Twitter, Linkedin, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">
                CareerMatch <span className="text-brand-600">AI</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              AI-powered resume optimization and intelligent job matching to help you find your next opportunity faster.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/resume" className="hover:text-brand-600">Resume Builder</Link></li>
              <li><Link to="/analyzer" className="hover:text-brand-600">ATS Scanner</Link></li>
              <li><Link to="/jobs" className="hover:text-brand-600">Job Matching</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-600">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-brand-600">About</a></li>
              <li><a href="#" className="hover:text-brand-600">Privacy</a></li>
              <li><a href="#" className="hover:text-brand-600">Terms</a></li>
              <li><a href="#" className="hover:text-brand-600">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} CareerMatch AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
