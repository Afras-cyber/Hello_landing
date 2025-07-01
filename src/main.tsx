
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Temporarily disable service worker to prevent caching issues during debugging
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then((registration) => {
//         console.log('SW registered: ', registration);
//
//         // Check for updates periodically
//         setInterval(() => {
//           registration.update();
//         }, 60000); // Check every minute
//       })
//       .catch((registrationError) => {
//         console.log('SW registration failed: ', registrationError);
//       });
//   });
// }

// Get root element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

// Create root and render immediately for fastest LCP
const root = createRoot(rootElement);
root.render(<App />);
