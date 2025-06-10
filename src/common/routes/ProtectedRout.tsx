import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const token = Cookies.get('accessToken'); // kiểm tra trong cookie
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};
export default ProtectedRoute;
