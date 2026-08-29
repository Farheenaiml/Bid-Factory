import React, { useState } from 'react';

const Login = ({ onLogin }: { onLogin: () => void }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock DB operation saving to localStorage
        if (!isLogin) {
            localStorage.setItem('bidfactory_user_email', email);
            localStorage.setItem('bidfactory_user_pass', password);
        }
        localStorage.setItem('bidfactory_auth', 'true');
        onLogin();
    };

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)' }}>
            <div className="card" style={{ width: '400px', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
                    BidFactory Auth
                </h2>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button
                        style={{ flex: 1, padding: '0.5rem', borderBottom: isLogin ? '2px solid var(--primary-color)' : '2px solid transparent', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: isLogin ? 'var(--primary-color)' : 'gray' }}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        style={{ flex: 1, padding: '0.5rem', borderBottom: !isLogin ? '2px solid var(--primary-color)' : '2px solid transparent', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: !isLogin ? 'var(--primary-color)' : 'gray' }}
                        onClick={() => setIsLogin(false)}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Enterprise Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                            placeholder="user@enterprise.com"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
                        {isLogin ? 'Sign In to Workspace' : 'Create Enterprise Account'}
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'gray' }}>
                    Secured by BidFactory Enterprise Auth Database
                </div>
            </div>
        </div>
    );
};

export default Login;
