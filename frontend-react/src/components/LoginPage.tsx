import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Mosque } from 'lucide-react';

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
    <div className="min-h-screen islamic-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] p-8 animate-fade-in">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#0D7377] to-[#14919B] mb-4">
              <Mosque className="w-10 h-10 text-white" />
            </div>
            <h1 className="mb-2">Sermon Translation System</h1>
            <p className="text-[#6C757D]">Admin Portal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-[#212529]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C757D]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mosque.com"
                  className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-[#212529]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C757D]" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0D7377] text-white py-3 rounded-lg hover:bg-[#14919B] transition-all duration-150 hover:scale-[1.02] shadow-[0_4px_12px_rgba(13,115,119,0.3)]"
            >
              Sign In
            </button>
          </form>

          {/* Footer Links */}
          <div className="flex justify-center gap-4 mt-6 text-sm text-[#6C757D]">
            <button className="hover:text-[#0D7377] transition-colors">
              Forgot password?
            </button>
            <span>|</span>
            <button className="hover:text-[#0D7377] transition-colors">
              Need help?
            </button>
          </div>
        </div>

        {/* Subtle Islamic Pattern Footer */}
        <div className="mt-8 text-center text-sm text-[#6C757D]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#0D7377] to-transparent opacity-30"></div>
            <span className="text-[#D4A03E]">بسم الله</span>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#0D7377] to-transparent opacity-30"></div>
          </div>
          <p>Religious Technology Solutions</p>
        </div>
      </div>
    </div>
  );
}
