import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import ravanaLogo from '../../asset/image/ravanan.png';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', agreeTerms: false });
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

      if (loginData.rememberMe) {
        localStorage.setItem('rememberedEmail', loginData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      toast.success(`Welcome back, ${user.name}!`);

      const normalizedRole = typeof user.role === 'string' ? user.role.trim().toLowerCase() : user.role;
      if (normalizedRole === 'super_admin' || normalizedRole === 'admin') {
        navigate('/my-groups');
      } else {
        navigate('/profile');
      }
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

      await apiService.signup({
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
        password: signupData.password,
        role,
      });

      toast.success('Registration successful! Welcome to Raavana Thalaigal Trust!');
      navigate('/profile');
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
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br from-primary-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-4 shadow-lg">
            <img src={ravanaLogo} alt="" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">{isLogin ? 'Welcome Back!' : 'Join Our Community'}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              {isLogin ? 'Sign up here' : 'Login here'}
            </button>
          </p>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input id="email" type="email" name="email" value={loginData.email} onChange={handleLoginChange} className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200 transition-all" placeholder="Enter your email" required />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input id="password" type={showPassword ? 'text' : 'password'} name="password" value={loginData.password} onChange={handleLoginChange} className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200 transition-all" placeholder="Enter your password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">{showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}</button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" name="rememberMe" checked={loginData.rememberMe} onChange={handleLoginChange} className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer" />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500 transition-colors">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200">{loading ? 'Logging in...' : 'Login'}</button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input id="name" type="text" name="name" value={signupData.name} onChange={handleSignupChange} className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200 transition-all" placeholder="Enter your full name" required />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-email">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input id="signup-email" type="email" name="email" value={signupData.email} onChange={handleSignupChange} className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200 transition-all" placeholder="Enter your email" required />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input id="phone" type="tel" name="phone" value={signupData.phone} onChange={handleSignupChange} className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200 transition-all" placeholder="Enter your phone number" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-password">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input id="signup-password" type={showPassword ? 'text' : 'password'} name="password" value={signupData.password} onChange={handleSignupChange} className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200 transition-all" placeholder="Create a password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">{showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}</button>
              </div>
              {signupData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }}></div>
                    </div>
                    <span className="text-xs ml-2 font-medium">{getPasswordStrengthText()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={signupData.confirmPassword} onChange={handleSignupChange} className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200 transition-all" placeholder="Confirm your password" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">{showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}</button>
              </div>
              {signupData.confirmPassword && signupData.password !== signupData.confirmPassword && <p className="text-xs text-red-600 mt-1">Passwords do not match</p>}
            </div>

            <div className="mb-6">
              <label className="flex items-start cursor-pointer">
                <input type="checkbox" name="agreeTerms" checked={signupData.agreeTerms} onChange={handleSignupChange} className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1 cursor-pointer" required />
                <span className="ml-2 text-sm text-gray-700">I agree to the <Link to="/terms" className="text-primary-600 hover:text-primary-500">Terms of Service</Link> and <Link to="/privacy" className="text-primary-600 hover:text-primary-500">Privacy Policy</Link></span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200">{loading ? 'Creating account...' : 'Sign Up'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
