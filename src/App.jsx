import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import BasicSimulator from './pages/tools/BasicSimulator'
import JournalDashboard from './pages/tools/journal/JournalDashboard'
import AuthConfirm from './pages/AuthConfirm'
import PendingApproval from './pages/PendingApproval'
import ProtectedRoute from './components/ProtectedRoute'
import { useProductTour } from './components/ProductTourManager'
import './index.css'

function TourWrapper() {
  useProductTour()
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <TourWrapper />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        <Route path="/pending" element={<PendingApproval />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/tools/basic-simulator" element={
          <ProtectedRoute>
            <BasicSimulator />
          </ProtectedRoute>
        } />
        <Route path="/tools/journal" element={
          <ProtectedRoute>
            <JournalDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}