import { Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { MosqueLogo } from '../components/IslamicPattern';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await onLogin(email, password);
      if (success) {
        toast.success('Welcome back!');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await onLogin('Admin User', 'demo');
      toast.success('Welcome to demo mode!');
    } catch (error) {
      toast.error('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-shell flex items-center justify-center p-6">
      {/* Login Card - Fixed width */}
      <div className="w-full max-w-[460px] panel-strong p-10">
        {/* Logo and Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 bg-[#101827]">
            <MosqueLogo className="text-[#c5a24a]" size={40} />
          </div>
          <h1 className="text-3xl text-[#101827] mb-3">Sermon Translation System</h1>
          <p className="text-base text-[#4b5563]">Institutional Access</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm text-[#101827] mb-2 font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4b5563]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mosque.com"
                className="w-full pl-12 pr-4 py-3.5 text-base border border-[#e5ded0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f6f6d] focus:border-transparent bg-[#fffbf3]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-[#101827] mb-2 font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4b5563]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-12 pr-4 py-3.5 text-base border border-[#e5ded0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f6f6d] focus:border-transparent bg-[#fffbf3]"
              />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#101827] hover:bg-[#0f172a] text-white text-base py-4 rounded-xl transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e5ded0]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-[#fffbf3] text-[#4b5563]">OR</span>
          </div>
        </div>

        {/* Demo Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full bg-[#efe9dc] hover:bg-[#e3dccd] text-[#4b5563] text-base py-4 rounded-xl transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue as Demo
        </button>

        {/* Footer Links */}
        <div className="mt-7 text-center text-sm text-[#4b5563]">
          <a href="#" className="text-[#1f6f6d] hover:underline">Forgot password?</a>
          <span className="mx-3 text-[#c5a24a]">·</span>
          <a href="#" className="text-[#1f6f6d] hover:underline">Get help</a>
        </div>
      </div>
    </div>
  );
}
