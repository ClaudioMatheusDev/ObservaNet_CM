import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LogsPage from './pages/LogsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
