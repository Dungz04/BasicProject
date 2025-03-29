import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../../styles/cssAccount/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Vui lòng nhập đầy đủ email và mật khẩu!');
            return;
        }

        console.log('Đăng nhập với:', { email, password });
        setError('');
        navigate('/');
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-box">
                    <h2>Đăng nhập</h2>
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-label="Email"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                aria-label="Mật khẩu"
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="login-button">Đăng nhập</button>
                    </form>
                    <p className="register-text">
                        Nếu bạn chưa có tài khoản, <NavLink to="/register">đăng ký ngay</NavLink>
                    </p>
                    <p className="forgot-password">
                        <NavLink to="/forgot-password">Quên mật khẩu?</NavLink>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
