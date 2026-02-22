import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Shield, Pen, Search, Bot } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home', icon: Shield },
  { to: '/humanizer', label: 'Humanizer', icon: Pen },
  { to: '/detector', label: 'Detector', icon: Search },
  { to: '/agents', label: 'Agents', icon: Bot },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#030014]/80 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <Shield className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <span className="text-xl font-bold text-white">SafeWrite<span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">.ai</span></span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === to
                    ? 'bg-purple-500/15 text-purple-300 shadow-sm shadow-purple-500/10'
                    : 'text-gray-400 hover:bg-white/[0.05] hover:text-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-gray-400 hover:bg-white/[0.06]">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#030014]/95 backdrop-blur-2xl">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === to
                    ? 'bg-purple-500/15 text-purple-300'
                    : 'text-gray-400 hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
