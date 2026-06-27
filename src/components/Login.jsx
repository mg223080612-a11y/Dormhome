import { useState } from 'react';
import { createSession, validateLogin } from '../utils/auth';
import '../styles/login.css';

export default function Login({ onLogin, onCancel }) {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const message = validateLogin({ studentId, password });
    if (message) {
      setError(message);
      return;
    }

    const session = createSession({ studentId });
    onLogin(session);
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-badge">GVCS</div>
        <h1>자치부서 홈피 로그인</h1>
        <p className="login-subtitle">
          ID(학번)와 비밀번호로 로그인하는 프로토타입입니다. 실제 배포 시에는 Firebase, Supabase, 학교 계정 인증으로 교체하세요.
        </p>

        <form onSubmit={submit} className="login-form">
          <label>
            <span>ID</span>
            <input
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              autoFocus
            />
          </label>

          <label>
            <span>PW</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="login-button">입장하기</button>
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
