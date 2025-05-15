import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../service/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = authApi.getAccessToken();
                if (token) {
                    // Lấy thông tin user từ localStorage hoặc decode từ token
                    const userData = {
                        name: localStorage.getItem('userName'),
                        email: localStorage.getItem('userEmail'),
                        role: localStorage.getItem('userRole'),
                        userId: localStorage.getItem('userId')
                    };

                    if (userData.email) {
                        setUser(userData);
                        setIsAuthenticated(true);
                    } else {
                        // Nếu không có thông tin user trong localStorage, logout
                        authApi.logout();
                        setIsAuthenticated(false);
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                authApi.logout();
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (userData) => {
        // Lưu thông tin user vào localStorage
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userId', userData.userId);

        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await authApi.logout();

        // Xóa thông tin user khỏi localStorage
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');

        setIsAuthenticated(false);
        setUser(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            login,
            logout,
            isAdmin: user?.role === 'ADMIN'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
