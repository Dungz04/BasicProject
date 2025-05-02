import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../../service/firebase.jsx';// Đường dẫn đến file firebase.js
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Kiểm tra thông tin đầu vào
        if (!email) {
            setError('Vui lòng nhập email!');
            return;
        }

        try {
            console.log('Đang gửi yêu cầu đặt lại mật khẩu cho:', email); // Debug
            // Gửi email đặt lại mật khẩu qua Firebase
            await sendPasswordResetEmail(auth, email);
            setMessage('Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư hoặc thư rác.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error('Lỗi gửi email đặt lại:', error.code, error.message); // Debug
            // Xử lý lỗi từ Firebase
            switch (error.code) {
                case 'auth/invalid-email':
                    setError('Email không hợp lệ!');
                    break;
                case 'auth/user-not-found':
                    setError('Tài khoản không tồn tại!');
                    break;
                case 'auth/too-many-requests':
                    setError('Quá nhiều yêu cầu. Vui lòng thử lại sau!');
                    break;
                default:
                    setError('Gửi yêu cầu thất bại: ' + error.message);
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#111] text-white">
            <div className="flex w-full max-w-2xl bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                <div className="flex-1 relative before:content-[''] before:absolute before:inset-0 before:bg-[url('https://media2.dev.to/dynamic/image/width=1080,height=1080,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fmih10uhu1464fx1kr0by.jpg')] before:bg-cover before:bg-center before:opacity-20"></div>
                <div className="flex-1 !p-12 bg-gray-800 text-left">
                    <h2 className="!mb-6 text-2xl text-red-500 text-center">Quên mật khẩu</h2>
                    <form onSubmit={handleForgotPassword}>
                        <div className="!mb-4">
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-label="Email"
                                className="w-full !p-3 !mt-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-red-500 outline-none transition-colors"
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm !mb-2">{error}</p>}
                        {message && <p className="text-green-400 text-sm !mb-2">{message}</p>}
                        <button
                            type="submit"
                            className="w-full !p-3 cursor-pointer bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg text-lg hover:from-red-600 hover:to-red-800 hover:scale-105 transition-all"
                        >
                            Gửi yêu cầu
                        </button>
                    </form>
                    <p className="!mt-4 text-sm text-center">
                        Quay lại{' '}
                        <NavLink to="/login" className="text-red-500 hover:underline">
                            Đăng nhập
                        </NavLink>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;