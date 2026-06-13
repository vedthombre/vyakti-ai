"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(30);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // If no confirmation result is found, they probably refreshed. Send back to signin.
    if (!(window as any).confirmationResult && process.env.NODE_ENV !== 'development') {
      router.push("/auth/signin");
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length < 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let uid = "mock-uid"; // Fallback for dev mode
      if ((window as any).confirmationResult) {
        const result = await (window as any).confirmationResult.confirm(otpString);
        uid = result.user.uid;
      }
      
      // Call NextAuth credentials provider
      const response = await signIn("firebase-phone", {
        uid,
        phone,
        redirect: false,
      });

      if (response?.error) {
        throw new Error("Failed to sign in. Please try again.");
      }

      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError("Invalid OTP. Please check and try again.");
      setLoading(false);
    }
  };

  // Mask phone number: keep only last 4 digits visible
  const maskedPhone = phone.length > 4 
    ? phone.substring(0, phone.length - 4).replace(/\d/g, 'X') + phone.substring(phone.length - 4)
    : phone;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 pt-12 relative">
      
      {/* Back Button */}
      <button 
        onClick={() => router.push("/auth/signin")}
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <ArrowLeft size={24} className="text-[#1A1A1A]" />
      </button>

      <div className="w-full max-w-[420px] mx-auto flex flex-col items-center mt-12">
        
        {/* Headings */}
        <h1 className="text-[24px] font-medium text-[#1A1A1A] mb-2 text-center leading-tight">
          Enter the OTP
        </h1>
        <p className="text-[15px] text-[#888780] mb-10 text-center">
          Sent to {maskedPhone}
        </p>

        <form onSubmit={handleVerify} className="w-full flex flex-col gap-6">
          
          {/* OTP Input Boxes */}
          <div>
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 text-center text-[20px] font-medium rounded-[10px] border outline-none transition-colors ${
                    error ? 'border-red-500' : 'border-[#e5e5e5] focus:border-[#1D9E75]'
                  }`}
                />
              ))}
            </div>
            {error && <p className="mt-2 text-[13px] text-red-500 text-center">{error}</p>}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.join("").length < 6}
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
              "Verify"
            )}
          </button>
        </form>

        {/* Resend Logic */}
        <div className="mt-8 text-center">
          {countdown > 0 ? (
            <p className="text-[14px] text-[#888780]">
              Resend in 0:{countdown.toString().padStart(2, '0')}
            </p>
          ) : (
            <button 
              onClick={() => {
                setCountdown(30);
                // Call handleSendOTP from signin page logic conceptually, 
                // in reality we'd need to re-trigger phone auth here. 
                // For MVP, router push back is simplest.
                router.push("/auth/signin");
              }}
              className="text-[14px] text-[#1D9E75] font-medium hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <OTPForm />
    </Suspense>
  );
}
