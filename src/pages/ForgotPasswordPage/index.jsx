import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { FiMail, FiLock, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../../components/ui/input-otp';
import apiService from '../../services/api';
import loginPageImage from '../../asset/image/loginPage.jpg';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    showNew: false,
    showConfirm: false
  });
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
    isLongEnough: false
  });

  // Handle email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await apiService.forgotPassword(email);
      toast.success('Verification code sent to your email!');
      setStep(2);
      startTimer();
    } catch (error) {
      toast.error(error.message || 'Email not found. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP submission
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.verifyOtp(email, otp);
      setResetToken(response.resetToken);
      toast.success('OTP verified successfully!');
      setStep(3);
    } catch (error) {
      toast.error(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (passwordStrength.score < 3) {
      toast.error('Please choose a stronger password');
      return;
    }

    setLoading(true);

    try {
      await apiService.resetPassword(email, passwordData.newPassword, resetToken);
      toast.success('Password reset successfully!');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    const strength = {
      score: 0,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      isLongEnough: password.length >= 8
    };

    // Calculate score
    if (strength.hasLower) strength.score++;
    if (strength.hasUpper) strength.score++;
    if (strength.hasNumber) strength.score++;
    if (strength.hasSpecial) strength.score++;
    if (strength.isLongEnough) strength.score++;

    setPasswordStrength(strength);
  };

  // Get password strength color
  const getPasswordStrengthColor = () => {
    const score = passwordStrength.score;
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get password strength text
  const getPasswordStrengthText = () => {
    const score = passwordStrength.score;
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  };

  // Start timer for OTP resend
  const startTimer = () => {
    setTimer(60);
    setCanResend(false);
    
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      await apiService.forgotPassword(email);
      toast.success('New OTP sent to your email');
      startTimer();
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Get step title
  const getStepTitle = () => {
    switch(step) {
      case 1: return 'Forgot Password?';
      case 2: return 'Verify OTP';
      case 3: return 'Create New Password';
      default: return 'Forgot Password';
    }
  };

  // Get step description
  const getStepDescription = () => {
    switch(step) {
      case 1: return 'Enter your email address and we\'ll send you a verification code.';
      case 2: return `Enter the 6-digit code sent to ${email}`;
      case 3: return 'Create a strong password for your account.';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] pt-16 lg:fixed lg:inset-x-0 lg:bottom-0 lg:top-16 lg:min-h-0 lg:overflow-hidden lg:pt-0">
      <div className="grid min-h-[calc(100vh-4rem)] lg:h-full lg:min-h-0 lg:grid-cols-[60%_40%]">
        <section className="relative min-h-[260px] overflow-hidden lg:min-h-0">
          <img
            src={loginPageImage}
            alt="Young volunteers working together"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </section>

        <section className="flex h-full items-center justify-center px-5 py-8 sm:px-8 lg:px-7 lg:py-6 xl:px-10">
          <div className="w-full max-w-md">
            <Link to="/login" className="mb-5 inline-flex items-center text-xs font-medium text-gray-600 transition-colors hover:text-primary-600">
              <FiArrowLeft className="mr-2" />
              Back to Login
            </Link>

            <h1 className="text-2xl font-bold text-ink-950 md:text-3xl">{getStepTitle()}</h1>
            <p className="mt-2 text-sm leading-6 text-gray-600">{getStepDescription()}</p>

            <div className="my-6 flex items-center" aria-label={`Password reset step ${step} of 3`}>
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {step > s ? <FiCheckCircle size={15} /> : s}
                  </div>
                  {s < 3 && <div className={`mx-2 h-0.5 flex-1 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>

            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="reset-email">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200"
                      placeholder="Enter your registered email"
                      required
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">We'll send a verification code to this email address.</p>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleOTPSubmit} className="space-y-5">
                <div>
                  <label className="mb-3 block text-xs font-semibold text-gray-700">Enter 6-digit verification code</label>
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
                  <div className="mt-3 text-center">
                    {canResend ? (
                      <button type="button" onClick={handleResendOTP} className="text-xs font-semibold text-primary-600 hover:text-primary-700">Resend Code</button>
                    ) : (
                      <p className="text-xs text-gray-500">Resend code in {timer} seconds</p>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="new-password">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="new-password"
                      type={passwordData.showNew ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200"
                      placeholder="Enter new password"
                      required
                    />
                    <button type="button" onClick={() => setPasswordData(prev => ({ ...prev, showNew: !prev.showNew }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={passwordData.showNew ? 'Hide password' : 'Show password'}>
                      {passwordData.showNew ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                    </button>
                  </div>
                  {passwordData.newPassword && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }}></div>
                      </div>
                      <span className="text-[11px] font-medium">{getPasswordStrengthText()}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="confirm-new-password">Confirm New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="confirm-new-password"
                      type={passwordData.showConfirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200"
                      placeholder="Confirm new password"
                      required
                    />
                    <button type="button" onClick={() => setPasswordData(prev => ({ ...prev, showConfirm: !prev.showConfirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={passwordData.showConfirm ? 'Hide confirmed password' : 'Show confirmed password'}>
                      {passwordData.showConfirm ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="mt-1 flex items-center text-[11px] text-red-600"><FiAlertCircle className="mr-1" />Passwords do not match</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg bg-white/70 p-3 text-[11px] text-gray-500">
                  <span className={passwordStrength.isLongEnough ? 'text-green-600' : ''}>✓ 8+ characters</span>
                  <span className={passwordStrength.hasLower ? 'text-green-600' : ''}>✓ Lowercase</span>
                  <span className={passwordStrength.hasUpper ? 'text-green-600' : ''}>✓ Uppercase</span>
                  <span className={passwordStrength.hasNumber ? 'text-green-600' : ''}>✓ Number</span>
                  <span className={passwordStrength.hasSpecial ? 'text-green-600' : ''}>✓ Special character</span>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            <div className="mt-5 text-center">
              <Link to="/login" className="rounded-full px-4 py-2 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-50 hover:text-primary-800">Sign in</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
