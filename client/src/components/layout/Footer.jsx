import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Shield className="h-5 w-5" />
            <span className="text-sm">SafeWrite.ai — 100% Indigenous AI Engine</span>
          </div>
          <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} SafeWrite.ai — Zero APIs, Zero Cloud</p>
        </div>
      </div>
    </footer>
  );
}
