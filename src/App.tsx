import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Goals } from './pages/Goals';
import { Reports } from './pages/Reports';
import { Recurring } from './pages/Recurring';
import { FinancialEducation } from './pages/FinancialEducation';
import { Budgets } from './pages/Budgets';
import { Login } from './pages/Login';
import { Trends } from './pages/Trends';
import { Settings } from './pages/Settings';
import { ResetPassword } from './pages/ResetPassword';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Layout>
                  <Transactions />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <PrivateRoute>
                <Layout>
                  <Goals />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Layout>
                  <Reports />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/recurring"
            element={
              <PrivateRoute>
                <Layout>
                  <Recurring />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/educacao"
            element={
              <PrivateRoute>
                <Layout>
                  <FinancialEducation />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/orcamentos"
            element={
              <PrivateRoute>
                <Layout>
                  <Budgets />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/trends"
            element={
              <PrivateRoute>
                <Layout>
                  <Trends />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Layout>
                  <Settings />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
