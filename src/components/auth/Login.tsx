/**
 * Production-Grade Login Component
 * Secure login form with comprehensive validation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../services/authService';

interface LoginFormData {
  identifier: string;
  password: string;
  identifierType: 'org_id' | 'email' | 'phone';
}

interface LoginProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onLoginError }) => {
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
    identifierType: 'org_id',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Clear errors when form data changes
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [formData]);

  // Redirect when authentication state changes
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('✅ User authenticated, redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    // Validate identifier
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Identifier is required';
    } else if (formData.identifierType === 'email' && !isValidEmail(formData.identifier)) {
      newErrors.identifier = 'Please enter a valid email address';
    } else if (formData.identifierType === 'phone' && !isValidPhone(formData.identifier)) {
      newErrors.identifier = 'Please enter a valid phone number';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const credentials: LoginCredentials = {
        identifier: formData.identifier.trim(),
        password: formData.password,
        identifierType: formData.identifierType,
      };

      console.log('📝 Login form submitted with credentials:', {
        identifier: credentials.identifier,
        identifierType: credentials.identifierType,
        hasPassword: !!credentials.password
      });

      const response = await login(credentials);
      console.log('✅ Login function completed, response:', response);
      onLoginSuccess?.();
      
    } catch (error: any) {
      console.error('❌ Login failed in Login component:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMessage = error.message || 'Login failed. Please try again.';
      
      // Make the error message more user-friendly
      if (error.message && error.message.includes('Cannot connect to backend')) {
        errorMessage = 'Backend server is not running or not accessible. Please check if the server is running on the correct port.';
      } else if (error.message && error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please ensure the backend API is running.';
      }
      
      setErrors({ general: errorMessage });
      onLoginError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIdentifierPlaceholder = () => {
    switch (formData.identifierType) {
      case 'email':
        return 'Enter your email address';
      case 'phone':
        return 'Enter your phone number';
      case 'org_id':
      default:
        return 'Enter your organizer ID';
    }
  };

  const getIdentifierLabel = () => {
    switch (formData.identifierType) {
      case 'email':
        return 'Email Address';
      case 'phone':
        return 'Phone Number';
      case 'org_id':
      default:
        return 'Organizer ID';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>
      
      <div className="relative max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your Billiards Organizer Portal
            </p>
          </div>
        
          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Identifier Type Selection */}
              <div>
                <label htmlFor="identifierType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Login Method
                </label>
                <select
                  id="identifierType"
                  name="identifierType"
                  value={formData.identifierType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                >
                  <option value="org_id">Organizer ID</option>
                  <option value="email">Email Address</option>
                  <option value="phone">Phone Number</option>
                </select>
              </div>

              {/* Identifier Input */}
              <div>
                <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-2">
                  {getIdentifierLabel()}
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type={formData.identifierType === 'email' ? 'email' : 'text'}
                  value={formData.identifier}
                  onChange={handleInputChange}
                  placeholder={getIdentifierPlaceholder()}
                  className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                    errors.identifier ? 'border-red-300' : 'border-gray-200'
                  }`}
                  disabled={isSubmitting || isLoading}
                />
                {errors.identifier && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.identifier}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 pr-12 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                      errors.password ? 'border-red-300' : 'border-gray-200'
                    }`}
                    disabled={isSubmitting || isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting || isLoading}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isSubmitting || isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </div>
                )}
              </button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Demo Credentials
              </h3>
              <div className="text-sm text-blue-700 space-y-2">
                <div className="flex items-center">
                  <span className="font-medium w-24">Organizer ID:</span>
                  <code className="bg-blue-100 px-2 py-1 rounded text-xs">organizer@billiards.com</code>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-24">Password:</span>
                  <code className="bg-blue-100 px-2 py-1 rounded text-xs">OrgPass123!</code>
                </div>
              </div>
            </div>

            {/* Debug Information */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Debug Information
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">isAuthenticated:</span> <span className={`px-2 py-1 rounded text-xs ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{isAuthenticated ? 'true' : 'false'}</span></p>
                <p><span className="font-medium">isLoading:</span> <span className={`px-2 py-1 rounded text-xs ${isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{isLoading ? 'true' : 'false'}</span></p>
                <p><span className="font-medium">User:</span> <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">{user ? user.email : 'null'}</span></p>
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    console.log('🔍 Current auth state:', { isAuthenticated, isLoading, user });
                    console.log('🔍 LocalStorage check:');
                    console.log('  - billiards_auth_token:', !!localStorage.getItem('billiards_auth_token'));
                    console.log('  - billiards_refresh_token:', !!localStorage.getItem('billiards_refresh_token'));
                    console.log('  - billiards_user:', localStorage.getItem('billiards_user'));
                    console.log('  - billiards_token_expiry:', localStorage.getItem('billiards_token_expiry'));
                    console.log('  - organizerSession:', localStorage.getItem('organizerSession'));
                    console.log('🔍 authService check:');
                    const authService = require('../../services/authService').default;
                    console.log('  - isAuthenticated():', authService.isAuthenticated());
                    console.log('  - getAccessToken():', authService.getAccessToken() ? 'exists' : 'null');
                    console.log('  - getStoredUser():', authService.getStoredUser());
                  }}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors duration-200"
                >
                  Check Auth State
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log('🚪 Manual logout triggered');
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors duration-200"
                >
                  Force Logout
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
