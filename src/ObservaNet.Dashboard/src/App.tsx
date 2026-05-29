import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import LogsPage from './pages/LogsPage'
import MetricsPage from './pages/MetricsPage'

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '8px 20px', borderBottom: '1px solid #ddd', display: 'flex', gap: 24, background: '#1a1a2e' }}>
        <Link to="/" style={{ color: '#4a90e2', textDecoration: 'none', fontWeight: 'bold' }}>Logs</Link>
        <Link to="/metrics" style={{ color: '#4a90e2', textDecoration: 'none', fontWeight: 'bold' }}>Métricas</Link>
      </nav>
      <Routes>
        <Route path="/" element={<LogsPage />} />
        <Route path="/metrics" element={<MetricsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
