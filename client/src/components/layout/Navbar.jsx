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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-brand-600" />
              <span className="text-xl font-bold text-gray-900">SafeWrite<span className="text-brand-600">.ai</span></span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === to
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50'
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
