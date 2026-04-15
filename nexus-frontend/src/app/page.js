"use client";

import { useState } from 'react';
import BrandingSection from '@/components/auth/BrandingSection';
import AuthToggle from '@/components/auth/AuthToggle';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      <BrandingSection />

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8">
          
          <AuthToggle isLogin={isLogin} setIsLogin={setIsLogin} />

          <div className="mt-4">
            {isLogin ? <LoginForm /> : <RegisterForm />}
          </div>

        </div>
      </div>
    </div>
  );
}