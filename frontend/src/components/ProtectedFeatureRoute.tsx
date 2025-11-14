import { Navigate } from 'react-router-dom';
import { useTenantLabels } from '../utils/tenantLabels';

interface ProtectedFeatureRouteProps {
  feature: 'servicios' | 'categorias' | 'recursos_fisicos';
  children: React.ReactNode;
}

const ProtectedFeatureRoute: React.FC<ProtectedFeatureRouteProps> = ({ feature, children }) => {
  const labels = useTenantLabels();
  
  if (!labels.features[feature]) {
    // Si la feature está desactivada, redirigir al dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedFeatureRoute;

