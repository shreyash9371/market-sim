// Google Analytics setup
const script1 = document.createElement("script");
script1.async = true;
script1.src = "https://www.googletagmanager.com/gtag/js?id=G-DY5RKDD236";
document.head.appendChild(script1);

const script2 = document.createElement("script");
script2.innerHTML = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-DY5RKDD236');
`;
document.head.appendChild(script2);


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
