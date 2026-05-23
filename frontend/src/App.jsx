import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import CitizenTriage from './pages/CitizenTriage.jsx';
import Login from './pages/Login.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import VagasPage from './pages/VagasPage.jsx';
import CidadaosPage from './pages/CidadaosPage.jsx';
import FilaEsperaPage from './pages/FilaEsperaPage.jsx';
import MatchPage from './pages/MatchPage.jsx';
import DashboardGerencial from './pages/DashboardGerencial.jsx';
import OscArea from './pages/OscArea.jsx';
import RelatoriosPage from './pages/RelatoriosPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/triagem" element={<CitizenTriage />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/app"
        element={(
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        )}
      >
        <Route index element={<DashboardAdmin />} />
        <Route path="vagas" element={<VagasPage />} />
        <Route path="cidadaos" element={<CidadaosPage />} />
        <Route path="fila" element={<FilaEsperaPage />} />
        <Route path="match" element={<MatchPage />} />
        <Route path="gerencial" element={<DashboardGerencial />} />
        <Route path="oscs" element={<OscArea />} />
        <Route path="relatorios" element={<RelatoriosPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
