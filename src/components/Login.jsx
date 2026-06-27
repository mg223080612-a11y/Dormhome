import { useState } from 'react';
import { createSession, detectGenderFromMg, genderLabel, validateMg } from '../utils/auth';
import '../styles/login.css';

export default function Login({ onLogin }) {
  const [mg, setMg] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const predictedGender = detectGenderFromMg(mg);

  const submit = (event) => {
    event.preventDefault();
    const message = validateMg(mg);
    if (message) {
      setError(message);
      return;
    }

    const session = createSession({ mg, name });
    onLogin(session);
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-badge">GVCS</div>
        <h1>자치부서 홈피 로그인</h1>
        <p className="login-subtitle">
          MG 번호로 로그인하는 프로토타입입니다. 실제 배포 시에는 Firebase, Supabase, 학교 계정 인증으로 교체하세요.
        </p>

        <form onSubmit={submit} className="login-form">
          <label>
            <span>MG 번호</span>
            <input
              value={mg}
              onChange={(event) => setMg(event.target.value)}
              placeholder="예: MG20261234"
              autoFocus
            />
          </label>

          <label>
            <span>이름 또는 닉네임</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="예: 12학년 학생"
            />
          </label>

          <div className="login-preview">
            택시메이트 표시 그룹: <b>{genderLabel(predictedGender)}</b>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="login-button">입장하기</button>
        </form>

        <p className="login-note">
          성별 판별 규칙은 <code>src/utils/auth.js</code>의 <code>GENDER_RULE</code>에서 수정할 수 있습니다.
        </p>
      </section>
    </main>
  );
}
