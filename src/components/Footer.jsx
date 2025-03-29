// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css'; // Import CSS

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>Về DuztMovie</h3>
                    <p>Trang web xem phim miễn phí với hàng ngàn bộ phim chất lượng cao, cập nhật liên tục.</p>
                </div>
                <div className="footer-section">
                    <h3>Liên kết</h3>
                    <ul>
                        <li><Link to="#">Điều khoản sử dụng</Link></li>
                        <li><Link to="#">Chính sách bảo mật</Link></li>
                        <li><Link to="#">Liên hệ</Link></li>
                        <li><Link to="#">Trợ giúp</Link></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Theo dõi chúng tôi</h3>
                    <div className="social-icons">
                        <a href="#"><i className="fa-brands fa-facebook"></i></a>
                        <a href="#"><i className="fa-brands fa-youtube"></i></a>
                        <a href="#"><i className="fa-brands fa-instagram"></i></a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© 2025 DuztMovie. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;