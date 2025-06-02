import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/auth/register', {
                name,
                email,
                password
            });

            if (response.data.requiresVerification) {
                toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.');
            } else {
                toast.success('Đăng ký thành công!');
            }

            navigate('/login');
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            let errorMessage = 'Đăng ký thất bại: ';

            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        errorMessage += 'Thông tin không hợp lệ!';
                        break;
                    case 409:
                        errorMessage += 'Email đã được sử dụng!';
                        break;
                    default:
                        errorMessage += error.response.data.message || 'Vui lòng thử lại sau.';
                }
            } else {
                errorMessage += 'Không thể kết nối đến server.';
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#111]">
            <div className="bg-[#222] !p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white text-center !mb-6">Đăng ký</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-gray-300 !mb-1">
                            Họ tên
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full !px-4 !py-2 bg-[#333] text-white border border-gray-600 rounded focus:outline-none focus:border-red-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-gray-300 !mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full !px-4 !py-2 bg-[#333] text-white border border-gray-600 rounded focus:outline-none focus:border-red-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-300 !mb-1">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full !px-4 !py-2 bg-[#333] text-white border border-gray-600 rounded focus:outline-none focus:border-red-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-300 !mb-1">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full !px-4 !py-2 bg-[#333] text-white border border-gray-600 rounded focus:outline-none focus:border-red-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white !py-2 rounded hover:bg-red-700 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed !mt-2 cursor-pointer"
                    >
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                </form>
                <p className="text-gray-400 text-center !mt-4">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-red-500 hover:text-red-400">
                        Đăng nhập 
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;