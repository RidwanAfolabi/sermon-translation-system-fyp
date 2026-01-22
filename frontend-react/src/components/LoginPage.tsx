import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { MosqueLogo } from './IslamicPattern';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication
    navigate('/admin');
  };

  return (
    <div className="min-h-screen app-shell flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="panel-strong p-8 animate-fade-in">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#101827] mb-4">
              <MosqueLogo className="text-[#c5a24a]" size={40} />
            </div>
            <h1 className="mb-2">Sermon Translation System</h1>
            <p className="text-[#4b5563]">Institutional Access</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-[#101827]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4b5563]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mosque.com"
                  className="w-full pl-10 pr-4 py-3 border border-[#e5ded0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f6f6d] focus:border-transparent transition-all bg-[#fffbf3]"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-[#101827]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4b5563]" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-[#e5ded0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f6f6d] focus:border-transparent transition-all bg-[#fffbf3]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#101827] text-white py-3 rounded-lg hover:bg-[#0f172a] transition-all duration-150 hover:scale-[1.01] shadow-[var(--shadow-card)]"
            >
              Sign In
            </button>
          </form>

          {/* Footer Links */}
          <div className="flex justify-center gap-4 mt-6 text-sm text-[#4b5563]">
            <button className="hover:text-[#1f6f6d] transition-colors">
              Forgot password?
            </button>
            <span>|</span>
            <button className="hover:text-[#1f6f6d] transition-colors">
              Need help?
            </button>
          </div>
        </div>

        {/* Subtle Islamic Pattern Footer */}
        <div className="mt-8 text-center text-sm text-[#4b5563]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#c5a24a] to-transparent opacity-40"></div>
            <span className="text-[#c5a24a] tracking-[0.2em] uppercase">Institution Suite</span>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#c5a24a] to-transparent opacity-40"></div>
          </div>
          <p>Religious Technology Solutions</p>
        </div>
      </div>
    </div>
  );
}
