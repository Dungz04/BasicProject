import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../../styles/cssAccount/ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Xử lý khi nhấn nút gửi yêu cầu
    const handleForgotPassword = (e) => {
        e.preventDefault();

        if (!email) {
            setMessage('Vui lòng nhập email!');
            return;
        }

        // Giả lập xử lý quên mật khẩu
        console.log('Yêu cầu đặt lại mật khẩu cho:', email);
        setMessage('Yêu cầu đặt lại mật khẩu đã được gửi!');
        
        // Chuyển về trang đăng nhập sau vài giây
        setTimeout(() => {
            navigate('/login');
        }, 3000);
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-background">
                <div className="forgot-password-box">
                    <h2>Quên mật khẩu</h2>
                    <form onSubmit={handleForgotPassword}>
                        <div className="form-group">
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-label="Email"
                            />
                        </div>
                        {message && <p className="message">{message}</p>}
                        <button type="submit" className="forgot-password-button">
                            Gửi yêu cầu
                        </button>
                    </form>
                    <p className="switch-link">
                        Quay lại <NavLink to="/login">Đăng nhập</NavLink>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
