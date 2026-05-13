'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Plane, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      const result = await authService.login(data.email, data.password);
      setAuth(result.user, result.token);
      toast.success(`Welcome back, ${result.user.name}!`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
          <Plane className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Travel CRM</h1>
        <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
      </div>

      {/* Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="admin@travelcrm.com"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-11 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 mt-2"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-xs text-slate-500 text-center mb-3">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: 'Admin', email: 'admin@travelcrm.com', pass: 'Admin@123' },
              { role: 'Manager', email: 'manager@travelcrm.com', pass: 'Manager@123' },
              { role: 'Agent', email: 'priya@travelcrm.com', pass: 'Agent@123' },
              { role: 'Agent 2', email: 'amit@travelcrm.com', pass: 'Agent@123' },
            ].map((cred) => (
              <button
                key={cred.email}
                type="button"
                onClick={() => {
                  const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                  const pwdInput = document.querySelector('input[type="password"], input[type="text"]') as HTMLInputElement;
                  if (emailInput) emailInput.value = cred.email;
                  if (pwdInput) pwdInput.value = cred.pass;
                  // Trigger react-hook-form update
                  emailInput?.dispatchEvent(new Event('input', { bubbles: true }));
                  pwdInput?.dispatchEvent(new Event('input', { bubbles: true }));
                }}
                className="text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <p className="text-xs font-medium text-blue-400">{cred.role}</p>
                <p className="text-xs text-slate-500 truncate">{cred.email}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}