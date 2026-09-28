import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiMail, FiLock, FiArrowLeft, FiCheckCircle, 
  FiAlertCircle, FiEye, FiEyeOff, FiKey,
  FiSmartphone, FiMessageSquare
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../../services/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
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
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      await apiService.verifyOtp(email, otpValue);
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
      await apiService.resetPassword(email, passwordData.newPassword);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      
      // Focus last filled input or next empty
      const lastFilledIndex = Math.min(pastedOtp.length - 1, 5);
      const nextInput = document.getElementById(`otp-${lastFilledIndex + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    } else {
      // Handle single character
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  // Handle OTP key press
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      document.getElementById(`otp-${index - 1}`).focus();
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
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br from-primary-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back to Login Link */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Login
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header with Progress Steps */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-2">{getStepTitle()}</h2>
            <p className="text-primary-100 text-sm">{getStepDescription()}</p>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= s 
                      ? 'bg-white text-primary-600' 
                      : 'bg-primary-500 text-white'
                  }`}>
                    {step > s ? <FiCheckCircle /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step > s ? 'bg-white' : 'bg-primary-500'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* Step 1: Email Form */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Enter your registered email"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    We'll send a verification code to this email address.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleOTPSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                    Enter 6-digit verification code
                  </label>
                  <div className="flex justify-center space-x-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      />
                    ))}
                  </div>

                  {/* Resend Option */}
                  <div className="text-center mt-4">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Resend Code
                      </button>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Resend code in {timer} seconds
                      </p>
                    )}
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={passwordData.showNew ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordData(prev => ({ ...prev, showNew: !prev.showNew }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {passwordData.showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {passwordData.newPassword && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs ml-2 font-medium">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <span className={passwordStrength.isLongEnough ? 'text-green-600' : 'text-gray-400'}>
                          ✓ 8+ characters
                        </span>
                        <span className={passwordStrength.hasLower ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Lowercase
                        </span>
                        <span className={passwordStrength.hasUpper ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Uppercase
                        </span>
                        <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Number
                        </span>
                        <span className={passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Special character
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={passwordData.showConfirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordData(prev => ({ ...prev, showConfirm: !prev.showConfirm }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {passwordData.showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-xs text-red-600 mt-2 flex items-center">
                      <FiAlertCircle className="mr-1" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Password Requirements Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li className="flex items-center">
                      <FiCheckCircle className={`mr-2 ${passwordStrength.isLongEnough ? 'text-green-600' : 'text-gray-400'}`} size={12} />
                      At least 8 characters long
                    </li>
                    <li className="flex items-center">
                      <FiCheckCircle className={`mr-2 ${passwordStrength.hasLower && passwordStrength.hasUpper ? 'text-green-600' : 'text-gray-400'}`} size={12} />
                      Mix of uppercase and lowercase letters
                    </li>
                    <li className="flex items-center">
                      <FiCheckCircle className={`mr-2 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`} size={12} />
                      At least one number
                    </li>
                    <li className="flex items-center">
                      <FiCheckCircle className={`mr-2 ${passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-400'}`} size={12} />
                      At least one special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            {/* Help Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <FiLock className="mr-1" />
            Your information is protected by 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;