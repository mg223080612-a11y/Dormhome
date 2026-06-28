import { useState } from 'react';
import { createSession, validateLogin } from '../utils/auth';
import '../styles/login.css';

export default function Login({ onLogin, onCancel }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const message = validateLogin({ id, password });
    if (message) {
      setError(message);
      return;
    }
    onLogin(createSession({ id }));
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-logo">
          <span className="login-logo-mark">GVCS</span>
          <span className="login-logo-sub">MG</span>
        </div>

        <h1>로그인</h1>
        <p className="login-subtitle">ID와 비밀번호를 입력해주세요.</p>

        <form onSubmit={submit} className="login-form">
          <label>
            <span>ID</span>
            <input
              value={id}
              onChange={(event) => setId(event.target.value)}
              autoFocus
            />
          </label>

          <label>
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
