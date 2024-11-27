import React, { useState } from "react";

const ConsultaPricely = () => {
    const [codigo, setCodigo] = useState(""); // Estado para el código ingresado
    const [resultado, setResultado] = useState(null); // Estado para mostrar el resultado
    const [error, setError] = useState(""); // Estado para errores

    const consultarProducto = async () => {
        setError(""); // Limpiar errores previos
        setResultado(null); // Limpiar resultado previo
        if (!codigo) {
            setError("Por favor, ingresa un código.");
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:5000/ventas/pricely/${codigo}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setResultado(data);
        } catch (err) {
            setError("No se pudo consultar el producto. Verifica el código e intenta nuevamente.");
            console.error(err);
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
            <h2>Consulta Producto en Pricely</h2>
            <div style={{ marginBottom: "10px" }}>
                <input
                    type="text"
                    placeholder="Ingresa el código EAN"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "10px",
                        fontSize: "16px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                    }}
                />
            </div>
            <button
                onClick={consultarProducto}
                style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    color: "#fff",
                    backgroundColor: "#007bff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                Consultar
            </button>

            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

            {resultado && (
                <div style={{ marginTop: "20px", textAlign: "left" }}>
                    <h3>Resultado:</h3>
                    <p><strong>Nombre:</strong> {resultado.nombre}</p>
                    <p><strong>Precio:</strong> {resultado.precio}</p>
                </div>
            )}
        </div>
    );
};

export default ConsultaPricely;
