import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import Dashboard from '../pages/Dashboard'
import BasicSimulator from '../pages/tools/BasicSimulator'
import JournalDashboard from '../pages/tools/journal/JournalDashboard'
import AuthConfirm from '../pages/AuthConfirm'
import PendingApproval from '../pages/PendingApproval'
import ProtectedRoute from '../components/ProtectedRoute'

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/confirm" element={<AuthConfirm />} />
            <Route path="/pending" element={<PendingApproval />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tools/basic-simulator" element={<BasicSimulator />} />
                <Route path="/tools/journal" element={<JournalDashboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}