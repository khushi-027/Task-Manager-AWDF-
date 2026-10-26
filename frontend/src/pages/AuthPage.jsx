import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthPage({
  isRegistration = false,
  authRole,
  setAuthRole,
  email,
  setEmail,
  password,
  setPassword,
  error,
  setError,
  isAuthenticating,
  submitAuth
}) {
  const selectRole = (role) => {
    setAuthRole(role);
    setPassword('');
    setError('');
  };
  const credentialsRejected = error === 'Email or password is incorrect';
  const emailInvalid = credentialsRejected || error.startsWith('Email ') || error.startsWith('Enter a valid email');
  const passwordInvalid = credentialsRejected || error.startsWith('Password ');

  return <main className="auth-shell">
    <section className="auth-card">
      <p className="auth-brand">TASK MANAGER</p>
      <h1>{isRegistration ? 'Create your account' : 'Welcome back'}</h1>
      <p className="auth-description">{isRegistration
        ? authRole === 'admin' ? 'Create an administrator account.' : 'Create an account to organize your work.'
        : 'Sign in to organize your work.'}</p>

      <div className="auth-tabs" role="tablist" aria-label={isRegistration ? 'New account type' : 'Sign-in account type'}>
        <button type="button" role="tab" aria-selected={authRole === 'user'}
          className={authRole === 'user' ? 'active' : ''} onClick={() => selectRole('user')}>User</button>
        <button type="button" role="tab" aria-selected={authRole === 'admin'}
          className={authRole === 'admin' ? 'active' : ''} onClick={() => selectRole('admin')}>Admin</button>
      </div>

      <form onSubmit={submitAuth} className="auth-form">
        <label htmlFor="auth-email">Email
          <input id="auth-email" type="email" value={email}
            onChange={(event) => { setEmail(event.target.value); setError(''); }}
            placeholder="you@example.com" autoComplete="email" required
            onInvalid={(event) => {
              event.preventDefault();
              const message = event.currentTarget.validity.valueMissing
                ? 'Email is required.'
                : 'Enter a valid email address, such as you@example.com.';
              setError((currentError) => currentError || message);
            }}
            aria-invalid={emailInvalid} aria-describedby={error ? 'auth-error' : undefined} />
        </label>
        <label htmlFor="auth-password">Password
          <input id="auth-password" type="password" value={password}
            onChange={(event) => { setPassword(event.target.value); setError(''); }}
            placeholder={isRegistration ? 'At least 6 characters' : 'Enter any password'}
            minLength={isRegistration ? 6 : undefined}
            autoComplete={isRegistration ? 'new-password' : 'current-password'} required
            onInvalid={(event) => {
              event.preventDefault();
              setError((currentError) => currentError || 'Password is required.');
            }}
            aria-invalid={passwordInvalid} aria-describedby={error ? 'auth-error' : undefined} />
        </label>
        {error && <p className="error-message auth-error" id="auth-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={isAuthenticating}>
          {isAuthenticating ? (isRegistration ? 'Creating account...' : 'Signing in...') : isRegistration ? 'Create account' : 'Sign in'}
        </button>
      </form>
      {isRegistration
        ? <p className="auth-note">Choose User or Admin access for your account. <Link to="/login"
          onClick={() => { setError(''); setPassword(''); }}>Sign in</Link></p>
        : <p className="auth-register-prompt">New here? <Link to="/register"
          onClick={() => { setError(''); setPassword(''); }}>Create an account</Link></p>}
    </section>
  </main>;
}
