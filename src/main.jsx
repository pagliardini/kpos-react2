import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Ventas from './components/Ventas.jsx'; // Importar Ventas
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConsultaPricely from './components/test.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/test" element={<ConsultaPricely />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);