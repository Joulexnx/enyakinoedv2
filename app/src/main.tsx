import { createRoot } from 'react-dom/client'
import { TRPCProvider } from '@/providers/trpc'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <TRPCProvider>
    <App />
  </TRPCProvider>
)
