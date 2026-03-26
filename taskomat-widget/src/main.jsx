import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TaskomatProvider } from './store/TaskomatContext'
import App from './App'
import './styles/index.css'
import './App.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TaskomatProvider>
      <App />
    </TaskomatProvider>
  </StrictMode>
)
