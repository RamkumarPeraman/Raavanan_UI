import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import apiService from '../../services/api';
import { ensureAccess } from '../../store/accessStore';
import loginPageImage from '../../asset/image/loginPage.jpg';

const LoginPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(() => new URLSearchParams(location.search).get('mode') !== 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '', agreeTerms: false });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, hasLower: false, hasUpper: false, hasNumber: false, hasSpecial: false, isLongEnough: false });

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'password') {
      checkPasswordStrength(value);
    }
    setSignupData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const checkPasswordStrength = (password) => {
    const strength = {
      score: 0,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      isLongEnough: password.length >= 8,
    };

    if (strength.hasLower) strength.score++;
    if (strength.hasUpper) strength.score++;
    if (strength.hasNumber) strength.score++;
    if (strength.hasSpecial) strength.score++;
    if (strength.isLongEnough) strength.score++;

    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    const score = passwordStrength.score;
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    const score = passwordStrength.score;
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.login({ email: loginData.email, password: loginData.password });
      const user = response.user;
      await dispatch(ensureAccess());

      if (loginData.rememberMe) {
        localStorage.setItem('rememberedEmail', loginData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      toast.success(`Welcome back, ${user.name}!`);

      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!signupData.agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      let role = 'member';
      if (signupData.email.includes('volunteer')) {
        role = 'volunteer';
      } else if (signupData.email.includes('donor')) {
        role = 'donor';
      }

      const response = await apiService.requestSignupOtp({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        role,
      });

      sessionStorage.setItem('signupVerificationEmail', response.email || signupData.email);
      toast.success(response.message || 'Verification code sent to your email');
      navigate('/verify-signup', { state: { email: response.email || signupData.email } });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setLoginData((prev) => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

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
            <h1 className="mb-6 text-2xl font-bold text-ink-950 md:text-3xl">{isLogin ? 'Sign In' : 'Create Account'}</h1>
        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="email">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input id="email" type="email" name="email" value={loginData.email} onChange={handleLoginChange} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200" placeholder="Enter your email" required />
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="password">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input id="password" type={showPassword ? 'text' : 'password'} name="password" value={loginData.password} onChange={handleLoginChange} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200" placeholder="Enter your password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">{showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}</button>
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" name="rememberMe" checked={loginData.rememberMe} onChange={handleLoginChange} className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer" />
                <span className="ml-2 text-xs text-gray-700">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-primary-600 transition-colors hover:text-primary-500">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Logging in...' : 'Login'}</button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="name">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input id="name" type="text" name="name" value={signupData.name} onChange={handleSignupChange} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200" placeholder="Enter your full name" required />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="signup-email">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input id="signup-email" type="email" name="email" value={signupData.email} onChange={handleSignupChange} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200" placeholder="Enter your email" required />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="signup-password">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input id="signup-password" type={showPassword ? 'text' : 'password'} name="password" value={signupData.password} onChange={handleSignupChange} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200" placeholder="Create password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}</button>
                </div>
                {signupData.password && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }}></div>
                    </div>
                    <span className="text-[11px] font-medium">{getPasswordStrengthText()}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="confirm-password">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={signupData.confirmPassword} onChange={handleSignupChange} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200" placeholder="Confirm password" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}>{showConfirmPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}</button>
                </div>
                {signupData.confirmPassword && signupData.password !== signupData.confirmPassword && <p className="mt-1 text-[11px] text-red-600">Passwords do not match</p>}
              </div>
            </div>

            <label className="flex cursor-pointer items-start">
              <input type="checkbox" name="agreeTerms" checked={signupData.agreeTerms} onChange={handleSignupChange} className="mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-primary-500" required />
              <span className="ml-2 text-xs leading-5 text-gray-700">I agree to the <Link to="/terms" className="text-primary-600 hover:text-primary-500">Terms of Service</Link> and <Link to="/privacy" className="text-primary-600 hover:text-primary-500">Privacy Policy</Link></span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Creating account...' : 'Sign Up'}</button>
          </form>
        )}
            <div className="mt-5 text-center">
              <button onClick={() => setIsLogin(!isLogin)} className="rounded-full px-4 py-2 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-50 hover:text-primary-800">
                {isLogin ? 'Create new account' : 'Back to login'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
