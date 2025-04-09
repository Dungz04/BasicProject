import React from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center p-4 bg-red-100 rounded-lg max-w-md">
                        <h3 className="text-lg font-medium text-red-800">Đã xảy ra lỗi</h3>
                        <p className="text-red-600 mt-2">{this.state.error?.message || "Đã có lỗi xảy ra. Vui lòng thử lại."}</p>
                        <div className="mt-4 space-x-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-[--color-primary] text-white rounded hover:bg-red-700 transition-colors"
                            >
                                Thử lại
                            </button>
                            <button
                                onClick={() => this.props.navigate("/")}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const ErrorBoundaryWrapper = ({ children }) => {
    const navigate = useNavigate();
    return <ErrorBoundary navigate={navigate}>{children}</ErrorBoundary>;
};

export default ErrorBoundaryWrapper;