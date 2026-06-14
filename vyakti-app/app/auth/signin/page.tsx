"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

export default function SignInPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize reCAPTCHA on component mount
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  }, []);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const phoneNumber = `+91${phone}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      
      // Store confirmationResult in window to access it on the OTP page
      window.confirmationResult = confirmationResult;
      
      // Navigate to OTP page
      router.push(`/auth/otp?phone=${encodeURIComponent(phoneNumber)}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send OTP. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[420px] mx-auto flex flex-col items-center">
        
        {/* Logo */}
        <div className="mb-10 text-center">
          <span style={{ fontSize: 24, fontFamily: "Inter, system-ui, sans-serif" }} className="font-medium tracking-tight text-[#444441]">
            vya<span className="text-[#1D9E75]">k</span>ti
          </span>
        </div>

        {/* Headings */}
        <h1 className="text-[24px] font-medium text-[#1A1A1A] mb-2 text-center leading-tight">
          Sign in for personalised results
        </h1>
        <p className="text-[15px] text-[#888780] mb-8 text-center">
          Your preferences. Your usual orders. Faster every time.
        </p>

        <div className="w-full flex flex-col gap-4">
          
          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-3 w-full bg-white border border-[#e5e5e5] rounded-[10px] py-[12px] text-[15px] font-medium text-[#1A1A1A] hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center my-2">
            <div className="flex-1 border-t border-[#e5e5e5]"></div>
            <span className="px-3 text-[13px] text-[#888780]">or</span>
            <div className="flex-1 border-t border-[#e5e5e5]"></div>
          </div>

          {/* Phone Form */}
          <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
            <div>
              <div className="flex items-center border border-[#e5e5e5] rounded-[10px] overflow-hidden focus-within:border-[#1D9E75] transition-colors">
                <div className="flex items-center gap-2 px-4 py-[12px] bg-gray-50 border-r border-[#e5e5e5]">
                  <span>🇮🇳</span>
                  <span className="text-[15px] font-medium text-[#1A1A1A]">+91</span>
                </div>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 px-4 py-[12px] outline-none text-[15px] text-[#1A1A1A] placeholder:text-[#888780]"
                />
              </div>
              {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}
            </div>

            <div id="recaptcha-container"></div>

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full bg-[#1D9E75] text-white rounded-[10px] py-[12px] text-[15px] font-medium hover:bg-[#178a66] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>

        </div>

        {/* Footer text */}
        <p className="mt-8 text-[12px] text-[#888780] text-center px-4 leading-relaxed">
          No account needed to use Vyakti. Sign in only to save preferences.
        </p>

      </div>
    </div>
  );
}
