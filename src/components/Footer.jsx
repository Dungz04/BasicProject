// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-zinc-900 text-white !py-10 !mt-10">
            <div className="max-w-7xl !mx-auto !px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {/* Về DuztMovie */}
                <div>
                    <h3 className="text-lg font-semibold !mb-3">Về DuztMovie</h3>
                    <p className="text-sm text-gray-400">
                        Trang web xem phim miễn phí với hàng ngàn bộ phim chất lượng cao, cập nhật liên tục.
                    </p>
                </div>

                {/* Liên kết */}
                <div>
                    <h3 className="text-lg font-semibold !mb-3 text-center">Liên kết</h3>
                    <ul className="!space-y-2 text-sm text-gray-300 text-center">
                        <li><Link to="" className="hover:text-white transition">Điều khoản sử dụng</Link></li>
                        <li><Link to="" className="hover:text-white transition">Chính sách bảo mật</Link></li>
                        <li><Link to="" className="hover:text-white transition">Liên hệ</Link></li>
                        <li><Link to="" className="hover:text-white transition">Trợ giúp</Link></li>
                    </ul>
                </div>

                {/* Mạng xã hội */}
                <div>
                    <h3 className="text-lg font-semibold !mb-3 text-center">Theo dõi chúng tôi</h3>
                    <div className="flex !space-x-4 text-xl justify-center">
                        <a  className="hover:text-blue-500 transition"><i className="fa-brands fa-facebook"></i></a>
                        <a  className="hover:text-red-600 transition"><i className="fa-brands fa-youtube"></i></a>
                        <a  className="hover:text-pink-500 transition"><i className="fa-brands fa-instagram"></i></a>
                    </div>
                </div>
            </div>

            {/* Footer bottom */}
            <div className="!mt-10 border-t border-gray-700 !pt-6 text-center text-sm text-gray-500">
                <p>© 2025 DuztMovie. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
