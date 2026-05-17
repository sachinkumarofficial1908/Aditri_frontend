import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const decodeBase64UrlJson = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
};

const sanitizeRedirect = (redirectPath) => {
  if (!redirectPath || !redirectPath.startsWith('/') || redirectPath.startsWith('//')) return '/';
  return redirectPath;
};

export default function OAuthCallback() {
  const { completeOAuthLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const encodedUser = params.get('user');
      const redirect = sanitizeRedirect(params.get('redirect'));

      if (!token || !encodedUser) {
        throw new Error('Missing OAuth response');
      }

      const user = completeOAuthLogin({ token, user: decodeBase64UrlJson(encodedUser) });
      toast.success(`Welcome, ${user.name}!`);
      navigate(redirect, { replace: true });
    } catch {
      toast.error('Google sign-in failed. Please try again.');
      navigate('/login', { replace: true });
    }
  }, [completeOAuthLogin, location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="flex items-center gap-3 text-gray-700">
        <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
        <span className="text-sm font-medium">Completing sign-in...</span>
      </div>
    </div>
  );
}
