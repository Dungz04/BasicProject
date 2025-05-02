import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../../service/firebase.jsx';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // Thêm state cho thông báo thành công
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email || !password) {
            setError('Vui lòng nhập đầy đủ email và mật khẩu!');
            return;
        }

        try {
            console.log('Đang thử đăng nhập với:', { email, password });
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                setError(
                    <span>
                        Vui lòng xác minh email trước khi đăng nhập! Kiểm tra hộp thư hoặc thư rác.{' '}
                        <button
                            onClick={async () => {
                                try {
                                    await sendEmailVerification(user);
                                    setMessage('Email xác minh đã được gửi lại! Vui lòng kiểm tra hộp thư hoặc thư rác.');
                                } catch (error) {
                                    console.error('Lỗi gửi email xác minh:', error.code, error.message);
                                    setError('Không thể gửi email xác minh: ' + error.message);
                                }
                            }}
                            className="text-red-600 underline hover:text-red-500 cursor-pointer"
                        >
                            Gửi lại email xác minh
                        </button>
                    </span>
                );
                await auth.signOut();
                return;
            }

            console.log('Đăng nhập thành công:', { email: user.email, uid: user.uid });
            navigate('/');
        } catch (error) {
            console.error('Lỗi đăng nhập:', error.code, error.message);
            switch (error.code) {
                case 'auth/invalid-credential':
                    setError('Email hoặc mật khẩu không đúng!');
                    break;
                case 'auth/user-not-found':
                    setError('Tài khoản không tồn tại!');
                    break;
                case 'auth/wrong-password':
                    setError('Mật khẩu không đúng!');
                    break;
                case 'auth/invalid-email':
                    setError('Email không hợp lệ!');
                    break;
                case 'auth/too-many-requests':
                    setError('Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau!');
                    break;
                default:
                    setError('Đăng nhập thất bại: ' + error.message);
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#111] text-white">
            <div className="flex w-full max-w-2xl bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                <div className="flex-1 relative before:content-[''] before:absolute before:inset-0 before:bg-[url('https://media2.dev.to/dynamic/image/width=1080,height=1080,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-Uploads.s3.amazonaws.com%2Fi%2Fmih10uhu1464fx1kr0by.jpg')] before:bg-cover before:bg-center before:opacity-20"></div>
                <div className="flex-1 !p-12 bg-gray-800 text-left">
                    <h2 className="!mb-4 text-2xl text-red-500">Đăng nhập</h2>
                    <form onSubmit={handleLogin}>
                        <div className="!mb-4">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-label="Email"
                                className="w-full !p-3 !mt-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-red-500 outline-none transition-colors"
                            />
                        </div>
                        <div className="!mb-4 relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                aria-label="Mật khẩu"
                                className="w-full !p-3 !mt-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-red-500 outline-none transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        {error && <p className="text-red-400 text-sm !mb-2">{error}</p>}
                        {message && <p className="text-green-400 text-sm !mb-2">{message}</p>}
                        <button
                            type="submit"
                            className="w-full !p-3 cursor-pointer bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg text-lg hover:from-red-600 hover:to-red-800 hover:scale-105 transition-all"
                        >
                            Đăng nhập
                        </button>
                    </form>
                    <p className="!mt-2 text-sm text-gray-400">
                        Nếu bạn chưa có tài khoản,{' '}
                        <NavLink to="/register" className="text-red-600 hover:underline">
                            đăng ký ngay
                        </NavLink>
                    </p>
                    <p className="!mt-2 text-center">
                        <NavLink
                            to="/forgot-password"
                            className="text-red-600 hover:underline hover:scale-105 transition-transform"
                        >
                            Quên mật khẩu?
                        </NavLink>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;