import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('/api/auth/forgot-password', { email });
            toast.success('Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn!');
        } catch (error) {
            console.error('Lỗi gửi email đặt lại mật khẩu:', error);
            let errorMessage = 'Không thể gửi email đặt lại mật khẩu: ';

            if (error.response) {
                switch (error.response.status) {
                    case 404:
                        errorMessage += 'Email không tồn tại trong hệ thống!';
                        break;
                    case 429:
                        errorMessage += 'Quá nhiều yêu cầu. Vui lòng thử lại sau!';
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
                <h2 className="text-2xl font-bold text-white text-center !mb-6">Quên mật khẩu</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white !py-2 rounded hover:bg-red-700 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </button>
                </form>
                <div className="flex justify-between text-sm !mt-4">
                    <Link to="/login" className="text-red-500 hover:text-red-400">
                        Đăng nhập
                    </Link>
                    <Link to="/register" className="text-red-500 hover:text-red-400">
                        Đăng ký
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;