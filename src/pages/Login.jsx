import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import authApi from '../service/authApi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Vui lòng nhập đầy đủ email và mật khẩu!');
            setLoading(false);
            return;
        }

        try {
            console.log('Đang thử đăng nhập với:', { email });
            const response = await authApi.login(email, password);
            console.log('Đăng nhập thành công:', { email });
            toast.success('Đăng nhập thành công!');
            navigate('/');
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            setError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
            toast.error(error.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
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
                                disabled={loading}
                                aria-label="Email"
                                className="w-full !p-3 !mt-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-red-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="!mb-4 relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                aria-label="Mật khẩu"
                                className="w-full !p-3 !mt-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-red-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        {error && <p className="text-red-400 text-sm !mb-2">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full !p-3 cursor-pointer bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg text-lg hover:from-red-600 hover:to-red-800 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
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