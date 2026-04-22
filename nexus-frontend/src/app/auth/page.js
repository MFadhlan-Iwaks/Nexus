"use client"; 

import { useState } from 'react';
import BrandingSection from '@/components/auth/BrandingSection';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      <BrandingSection />

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8">
          
          <div className="flex bg-slate-100 rounded-lg p-1 mb-8">
            <button onClick={() => setIsLogin(true)} 
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${isLogin ? 'bg-white shadow-sm' : 'text-slate-500'}`}>
              Masuk
            </button>
            <button onClick={() => setIsLogin(false)} 
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${!isLogin ? 'bg-white shadow-sm' : 'text-slate-500'}`}>
              Daftar Masyarakat
            </button>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}

        </div>
      </div>
    </div>
  );
}