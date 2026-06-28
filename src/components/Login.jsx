import { useState } from 'react';
import { createSession, validateLogin } from '../utils/auth';
import '../styles/login.css';

export default function Login({ onLogin, onCancel }) {
  const [mgNumber, setMgNumber] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const message = validateLogin({ mgNumber });
    if (message) {
      setError(message);
      return;
    }
    onLogin(createSession({ mgNumber }));
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-logo">
          <span className="login-logo-mark">GVCS</span>
          <span className="login-logo-sub">MG</span>
        </div>

        <h1>MG 번호로 로그인</h1>
        <p className="login-subtitle">학교에서 사용하는 MG 번호를 입력해주세요.</p>

        <form onSubmit={submit} className="login-form">
          <label>
            <span>MG 번호</span>
            <input
              inputMode="numeric"
              placeholder="예: 25001"
              value={mgNumber}
              onChange={(event) => setMgNumber(event.target.value)}
              autoFocus
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="login-button">로그인</button>
        </form>

        {onCancel && (
          <button type="button" className="login-back" onClick={onCancel}>
            메인으로 돌아가기
          </button>
        )}
      </section>
    </main>
  );
}
