import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../../service/firebase.jsx';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; // Nhập Heroicons

const Register = () => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!displayName || !email || !password || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            console.log('Đang thử đăng ký với:', { displayName, email });
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName });
            await sendEmailVerification(user);
            console.log('Đăng ký thành công và email xác minh đã được gửi:', { displayName, email, uid: user.uid });
            setMessage('Đăng ký thành công! Vui lòng kiểm tra email (hoặc thư rác) để xác minh tài khoản trước khi đăng nhập.');
            setTimeout(() => {
                navigate('/login');
            }, 5000);
        } catch (error) {
            console.error('Lỗi đăng ký:', error.code, error.message);
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setError('Email đã được sử dụng!');
                    break;
                case 'auth/invalid-email':
                    setError('Email không hợp lệ!');
                    break;
                case 'auth/weak-password':
                    setError('Mật khẩu phải có ít nhất 6 ký tự!');
                    break;
                default:
                    setError('Đăng ký thất bại: ' + error.message);
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#111] text-white">
            <div className="flex w-full max-w-4xl bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                <div className="flex-1 relative before:content-[''] before:absolute before:inset-0 before:bg-[url('https://media2.dev.to/dynamic/image/width=1080,height=1080,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-Uploads.s3.amazonaws.com%2Fi%2Fmih10uhu1464fx1kr0by.jpg')] before:bg-cover before:bg-center before:opacity-20"></div>
                <div className="flex-1 !p-12 bg-gray-800 text-left">
                    <h2 className="!mb-6 text-2xl text-red-500">Tạo tài khoản mới</h2>
                    <form onSubmit={handleRegister}>
                        <div className="!mb-4">
                            <input
                                type="text"
                                placeholder="Tên hiển thị"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                aria-label="Tên hiển thị"
                                className="w-full !p-3 !mt-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-red-500 outline-none transition-colors"
                            />
                        </div>
                        <div className="!mb-4">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-label="Email"
                                className="w-full !p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-red-500 outline-none transition-colors"
                            />
                        </div>
                        <div className="!mb-4 relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                aria-label="Mật khẩu"
                                className="w-full !p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-red-500 outline-none transition-colors"
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
                        <div className="!mb-4 relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Xác nhận mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                aria-label="Xác nhận mật khẩu"
                                className="w-full !p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-red-500 outline-none transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        {error && <p className="text-red-400 text-sm !mb-2">{error}</p>}
                        {message && <p className="text-green-400 text-sm !mb-2">{message}</p>}
                        <button
                            type="submit"
                            className="w-full !p-3 cursor-pointer bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg text-lg hover:from-red-600 hover:to-red-800 hover:scale-105 transition-all"
                        >
                            Đăng ký
                        </button>
                    </form>
                    <p className="!mt-4 text-sm text-center">
                        Đã có tài khoản?{' '}
                        <NavLink to="/login" className="text-red-500 hover:underline">
                            Đăng nhập
                        </NavLink>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;