import { useState } from 'react';
import { ALLOWED_DOMAIN, describeAuthError, signInWithGoogle } from '../utils/auth';
import '../styles/login.css';

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h11.9c-.5 2.8-2.1 5.1-4.4 6.7v5.5h7.1c4.2-3.8 6.5-9.5 6.5-16.5z" />
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.6-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.1H4.3v5.7C8 41.3 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.6 28.2c-.5-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.3A22 22 0 0 0 2 24c0 3.6.9 6.9 2.3 9.9l7.3-5.7z" />
      <path fill="#EA4335" d="M24 10.7c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8 6.7 4.3 13.6l7.3 5.7c1.7-5.2 6.6-8.6 12.4-8.6z" />
    </svg>
  );
}

export default function Login({ onLogin, onCancel }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const session = await signInWithGoogle();
      onLogin(session);
    } catch (authError) {
      setError(describeAuthError(authError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-logo">
          <span className="login-logo-mark">GVCS</span>
          <span className="login-logo-sub">MG</span>
        </div>

        <h1>로그인</h1>
        <p className="login-subtitle">
          {`학교 구글 계정(@${ALLOWED_DOMAIN})으로만 로그인할 수 있습니다.`}
        </p>

        <button
          type="button"
          className="google-button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleMark />
          <span>{loading ? '로그인 중…' : 'Google로 계속하기'}</span>
        </button>

        {error && <p className="form-error">{error}</p>}

        {onCancel && (
          <button type="button" className="login-back" onClick={onCancel}>
            메인으로 돌아가기
          </button>
        )}
      </section>
    </main>
  );
}
