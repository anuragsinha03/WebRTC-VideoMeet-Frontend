import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SocketProvider } from './Context/SocketContext.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter> 
    <SocketProvider>
      <App />
    </SocketProvider>
  </BrowserRouter>

)
