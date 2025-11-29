import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MarketplacePage } from '@pages/MarketplacePage/MarketplacePage';
import { ServiceDetailPage } from '@pages/ServiceDetailPage/ServiceDetailPage';
import { ServiceBookingPage } from '@pages/ServiceBookingPage/ServiceBookingPage';
import '@styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz - redirige a marketplace con ciudad por defecto */}
        <Route path="/" element={<Navigate to="/lima" replace />} />

        {/* Marketplace por ciudad */}
        <Route path="/:ciudad" element={<MarketplacePage />} />

        {/* Marketplace por ciudad y categoría */}
        <Route path="/:ciudad/:categoria" element={<MarketplacePage />} />

        {/* Detalle del negocio */}
        <Route
          path="/:ciudad/:categoria/:aliadoId"
          element={<ServiceDetailPage />}
        />

        {/* Página de reserva */}
        <Route
          path="/:ciudad/:categoria/:aliadoId/booking"
          element={<ServiceBookingPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

