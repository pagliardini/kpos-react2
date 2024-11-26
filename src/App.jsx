import { useState } from 'react';
import { Link } from 'react-router-dom'; // Importa Link desde react-router-dom
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <header>
        <h1>Bienvenido a la Aplicación</h1>

      </header>

      <main>
        {/* Enlace para navegar a Ventas */}
        <Link to="/ventas">
          <button>Ir a Ventas</button>
        </Link>
      </main>
    </>
  );
}

export default App;