import React, { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginPage from '../pages/LoginPage';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, isLoading, isAuthenticated } = useAuth();

    // Timeout de seguridad: si carga más de 5 segundos, mostrar login
    const [showLogin, setShowLogin] = React.useState(false);

    React.useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                console.warn('Timeout en verificación de autenticación, mostrando login');
                setShowLogin(true);
            }, 5000); // 5 segundos máximo (reducido para mejor UX)

            return () => clearTimeout(timer);
        } else {
            setShowLogin(false);
        }
    }, [isLoading]);

    // Si está cargando mucho tiempo, mostrar login directamente
    if (isLoading && showLogin) {
        console.log('Mostrando login por timeout');
        return <LoginPage />;
    }

    // Si está cargando, mostrar loading
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Verificando autenticación...</p>
                </div>
            </div>
        );
    }

    // Si no está autenticado, mostrar página de login
    if (!isAuthenticated || !user) {
        return <LoginPage />;
    }

    // Si está autenticado, mostrar el contenido protegido
    return <>{children}</>;
};

export default ProtectedRoute;