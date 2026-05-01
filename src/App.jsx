import { BrowserRouter } from 'react-router-dom'
import OnboardingSurvey from './system/OnboardingSurvey'
import './index.css'
import AppRoutes from './routes/AppRoutes'
import TourWrapper from './system/TourWrapper'

export default function App() {
  return (
    <BrowserRouter>
      <TourWrapper />
      <OnboardingSurvey />
      <AppRoutes />
    </BrowserRouter>
  )
}