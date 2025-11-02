import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../api/client';

const API_URL = import.meta.env.VITE_API_URL || 'https://image-serach-app-backend.vercel.app/api';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for OAuth errors in the URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const { data, isPending } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authAPI.getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data?.data?.user) {
      navigate('/');
    }
  }, [data, navigate]);

  const handleLogin = async (provider) => {
    try {
      setIsLoading(true);
      setError('');
      
      if (provider === 'google') {
        authAPI.loginWithGoogle();
      } else if (provider === 'github') {
        authAPI.loginWithGithub();
      } else if (provider === 'facebook') {
        window.location.href = `${API_URL}/auth/${provider}`;
      }
    } catch (err) {
      setError('Failed to initiate login. Please try again.');
      console.error('Login error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
    
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      
       <img
          src="/bng.jpg"
          alt="Login Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-6xl font-bold mb-6">Welcome to Image Search</h1>
          <p className="text-xl text-white/90 leading-relaxed max-w-xl">
            Discover millions of beautiful images powered by Unsplash. Search, explore, and save your favorite images all in one place. Start your visual journey today.
          </p>
        </div>
      </div>

 
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
      
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Image Search</h1>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-purple-600 mb-2">USER LOGIN</h2>
              <p className="text-gray-600">Sign in to continue</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleLogin('google')}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => handleLogin('github')}
                className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>

              <button
                onClick={() => handleLogin('facebook')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </button>
            </div>

            <p className="text-gray-500 text-sm text-center mt-8">
              By continuing, you agree to our{' '}
              <span className="text-purple-600 hover:underline cursor-pointer">Terms of Service</span>
              {' '}and{' '}
              <span className="text-purple-600 hover:underline cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;