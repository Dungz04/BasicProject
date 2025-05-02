import { initializeApp } from "firebase/app";
import { getAnalytics, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeFirestore, enableIndexedDbPersistence, setLogLevel } from "firebase/firestore";

// Hàm hỗ trợ lấy biến môi trường an toàn
const getEnv = (key, defaultValue) => {
    try {
        return typeof import.meta.env !== "undefined" && import.meta.env[key] ? import.meta.env[key] : defaultValue;
    } catch (e) {
        console.warn(`Không thể truy cập import.meta.env.${key}:`, e.message);
        return defaultValue;
    }
};

// Firebase configuration
const firebaseConfig = {
    apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyDrv-nheIveH6L-XvlTittLKw8PhtX5rvU"),
    authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "movieweb-d3a18.firebaseapp.com"),
    projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "movieweb-d3a18"),
    storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "movieweb-d3a18.firebasestorage.app"),
    messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "289251063682"),
    appId: getEnv("VITE_FIREBASE_APP_ID", "1:289251063682:web:d35c0c3def524fdf67419b"),
    measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-HNHKEX9B55"),
};

// Kiểm tra biến môi trường (chỉ trong development)
const isDevelopment = getEnv("VITE_ENV", "development") === "development";
if (isDevelopment) {
    const requiredEnvVars = [
        "VITE_FIREBASE_API_KEY",
        "VITE_FIREBASE_AUTH_DOMAIN",
        "VITE_FIREBASE_PROJECT_ID",
        "VITE_FIREBASE_STORAGE_BUCKET",
        "VITE_FIREBASE_MESSAGING_SENDER_ID",
        "VITE_FIREBASE_APP_ID",
    ];
    requiredEnvVars.forEach((varName) => {
        const value = getEnv(varName, null);
        if (!value) {
            console.warn(`Cảnh báo: Thiếu biến môi trường ${varName}. Sử dụng giá trị mặc định.`);
        }
    });
}

let app, auth, db, analytics;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
    }, "(default)");

    // Bật debug logging
    setLogLevel("debug");

    // Bật hỗ trợ offline
    enableIndexedDbPersistence(db).catch((error) => {
        console.error("Lỗi bật persistence:", {
            message: error.message,
            code: error.code,
            stack: error.stack,
        });
    });

    // Chỉ khởi tạo analytics trong môi trường production
    const isProduction = getEnv("VITE_ENV", "development") === "production";
    if (isProduction) {
        analytics = getAnalytics(app);
        setAnalyticsCollectionEnabled(analytics, false);
    }
} catch (error) {
    console.error("Khởi tạo Firebase thất bại:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
    });
    throw error;
}

// Hàm thử lại thao tác Firestore
export async function retryOperation(operation, maxAttempts = 3) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            return await operation();
        } catch (err) {
            if (i === maxAttempts - 1) throw err;
            console.warn(`Thử lại thao tác Firestore (${i + 1}/${maxAttempts}):`, {
                message: err.message,
                code: err.code,
            });
            await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

export { app, auth, db, analytics };