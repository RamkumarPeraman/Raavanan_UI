import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { FiArrowLeft, FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../../components/ui/input-otp';
import apiService from '../../services/api';
import loginPageImage from '../../asset/image/loginPage.jpg';

const STORAGE_KEY = 'signupVerificationEmail';

const SignupOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = useMemo(() => location.state?.email || sessionStorage.getItem(STORAGE_KEY) || '', [location.state]);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(60);

  useEffect(() => {
    if (!email) navigate('/login', { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = window.setInterval(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const handleVerify = async (event) => {
    event.preventDefault();
    if (otp.length !== 6) {
      toast.error('Enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.verifySignupOtp(email, otp);
      sessionStorage.removeItem(STORAGE_KEY);
      toast.success(response.message || 'Email verified successfully');
      navigate('/profile', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || loading) return;
    setLoading(true);
    try {
      const response = await apiService.resendSignupOtp(email);
      setOtp('');
      setResendSeconds(response.resendAfter || 60);
      toast.success(response.message || 'A new code was sent');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Could not resend the code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] pt-16 lg:fixed lg:inset-x-0 lg:bottom-0 lg:top-16 lg:min-h-0 lg:overflow-hidden lg:pt-0">
      <div className="grid min-h-[calc(100vh-4rem)] lg:h-full lg:min-h-0 lg:grid-cols-[60%_40%]">
        <section className="relative min-h-[260px] overflow-hidden lg:min-h-0">
          <img src={loginPageImage} alt="Young volunteers working together" className="absolute inset-0 h-full w-full object-cover" />
        </section>

        <section className="flex h-full items-center justify-center px-5 py-8 sm:px-8 lg:px-7 lg:py-6 xl:px-10">
          <div className="w-full max-w-md">
            <Link to="/login?mode=signup" className="mb-5 inline-flex items-center text-xs font-medium text-gray-600 transition-colors hover:text-primary-600">
              <FiArrowLeft className="mr-2" />
              Back to sign up
            </Link>

            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <FiMail size={20} />
            </div>
            <h1 className="text-2xl font-bold text-ink-950 md:text-3xl">Verify your email</h1>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Enter the 6-digit code sent to <span className="font-semibold text-gray-800">{email}</span>.
            </p>

            <form onSubmit={handleVerify} className="mt-7 space-y-6">
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                value={otp}
                onChange={setOtp}
                disabled={loading}
                autoFocus
                containerClassName="justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify and Create Account'}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-gray-600">
              {resendSeconds > 0 ? (
                <span>Send another code in {resendSeconds}s</span>
              ) : (
                <button type="button" onClick={handleResend} disabled={loading} className="font-semibold text-primary-700 hover:text-primary-800">Resend code</button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SignupOtpPage;
