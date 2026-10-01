import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <App />
)


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log(
          'Service Worker başarıyla kaydedildi:',
          registration.scope
        )
      })
      .catch((error) => {
        console.error(
          'Service Worker kaydedilemedi:',
          error
        )
      })
  })
}
