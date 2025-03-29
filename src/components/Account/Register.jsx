import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../../styles/cssAccount/Register.css';

const Register = () => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Xử lý khi nhấn nút Đăng ký
    const handleRegister = (e) => {
        e.preventDefault();

        if (!displayName || !email || !password || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        console.log('Đăng ký với:', { displayName, email, password });
        setError('');
        navigate('/login');
    };

    return (
        <div className="register-container">
            <div className="register-background">
                <div className="register-box">
                    <h2>Đăng ký</h2>
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Tên hiển thị"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                aria-label="Tên hiển thị"
                            />
                        </div>
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
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Xác nhận mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                aria-label="Xác nhận mật khẩu"
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="register-button">
                            Đăng ký
                        </button>
                    </form>
                    <p className="switch-link">
                        Đã có tài khoản? <NavLink to="/login">Đăng nhập</NavLink>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
