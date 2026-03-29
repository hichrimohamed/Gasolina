import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import { DateProvider }  from './context/DateContext';
import { ExportProvider } from './context/ExportContext';
import ProtectedRoute    from './components/ProtectedRoute';
import Layout            from './components/Layout';
import Login             from './pages/Login';
import Signup            from './pages/Signup';
import Dashboard         from './pages/Dashboard';
import Ventes            from './pages/Ventes';
import Achats            from './pages/Achats';
import Marges            from './pages/Marges';
import DailyState        from './pages/DailyState';
import Upload            from './pages/Upload';
import Calendar          from './pages/Calendar';
import Workers           from './pages/Workers';
import Tasks             from './pages/Tasks';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <DateProvider>
      <ExportProvider>
        <Routes>
          {/* Public routes — no sidebar/topbar */}
          <Route path="/login"  element={<Login />}  />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes — wrapped in Layout */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/"                  element={<Dashboard />} />
                  <Route path="/ventes/carburants" element={<Ventes />} />
                  <Route path="/ventes/produits"   element={<Ventes />} />
                  <Route path="/ventes/services"   element={<Ventes />} />
                  <Route path="/recettes"          element={<DailyState />} />
                  <Route path="/depenses"          element={<DailyState />} />
                  <Route path="/marges"            element={<Marges />} />
                  <Route path="/achats"            element={<Achats />} />
                  <Route path="/calendar"          element={<Calendar />} />
                  <Route path="/tasks"             element={<Tasks />} />
                  <Route path="/upload" element={
                    <ProtectedRoute adminOnly>
                      <Upload />
                    </ProtectedRoute>
                  } />
                  <Route path="/workers" element={
                    <ProtectedRoute adminOnly>
                      <Workers />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </ExportProvider>
      </DateProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
