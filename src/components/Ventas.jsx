import React, { useState, useEffect, useRef } from 'react';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
import styles from './ProductList.module.css';

// Componente para mostrar y editar la cantidad de un producto
const CantidadDialog = ({ isOpen, producto, onClose, onSave }) => {
    const [tempCantidad, setTempCantidad] = useState(1);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && producto) {
            setTempCantidad(producto.cantidad || 1);
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 10);
        }
    }, [isOpen, producto]);

    const handleKeyDown = (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
            onSave(tempCantidad);
            e.preventDefault();
        } else if (e.key === 'Escape') {
            onClose();
            e.preventDefault();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modal}>
            <h3>Modificar cantidad de {producto.nombre}</h3>
            <input
                ref={inputRef}
                type="number"
                value={tempCantidad}
                onChange={(e) => setTempCantidad(Math.max(1, parseInt(e.target.value)))}
                onKeyDown={handleKeyDown}
                min="1"
            />
            <button onClick={() => onSave(tempCantidad)}>Guardar</button>
            <button onClick={onClose}>Cancelar</button>
        </div>
    );
};

// Modal de cobro con opciones de pago
const ModalCobro = ({ isOpen, productos, onClose, onCobrar }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const opcionesPago = [
        { nombre: "Efectivo", recargo: 0 },
        { nombre: "Tarjeta", recargo: 5 },
        { nombre: "Transferencia", recargo: 0 },
    ];

    const calcularTotalConRecargo = () => {
        const total = productos.reduce((sum, producto) => sum + (producto.precio * producto.cantidad), 0);
        const recargo = opcionesPago[selectedIndex].recargo;
        return total * (1 + recargo / 100);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') {
            setSelectedIndex((prev) => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowDown') {
            setSelectedIndex((prev) => Math.min(opcionesPago.length - 1, prev + 1));
        } else if (e.key === 'Enter') {
            onCobrar(opcionesPago[selectedIndex]);
            e.preventDefault();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, productos]);

    if (!isOpen) return null;

    return (
        <div className={styles.modal}>
            <h3>Seleccionar método de cobro</h3>
            <ul>
                {opcionesPago.map((opcion, index) => (
                    <li
                        key={index}
                        className={selectedIndex === index ? styles.selected : ''}
                    >
                        {opcion.nombre} (Recargo: {opcion.recargo}%)
                    </li>
                ))}
            </ul>
            <p>Total con recargo: ${calcularTotalConRecargo().toFixed(2)}</p>
            <button onClick={onClose}>Cerrar</button>
        </div>
    );
};

// Componente principal de ventas
const Ventas = () => {
    const [productos, setProductos] = useState([]);
    const [nombreProducto, setNombreProducto] = useState('');
    const [total, setTotal] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [modalCobroOpen, setModalCobroOpen] = useState(false);
    const searchInputRef = useRef(null);

    // Función para mostrar los errores con Toastify
    const mostrarError = (mensaje) => {
        Toastify({
            text: mensaje,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "#ff6b6b",
            }
        }).showToast();
    };

    // Función para agregar un producto
    const agregarProducto = async () => {
        if (nombreProducto === '') return; // Asegura que no se agreguen productos vacíos
        try {
            const codigo = nombreProducto.toUpperCase();
            const response = await fetch(`http://localhost:5000/ventas/buscar/codigo?codigo=${codigo}`);

            if (!response.ok) {
                throw new Error(`Producto no encontrado: ${codigo}`);
            }

            const data = await response.json();
            const nuevoProducto = { ...data, cantidad: 1 };
            setProductos([...productos, nuevoProducto]);
            setTotal(total + nuevoProducto.precio);
            setNombreProducto('');
        } catch (error) {
            mostrarError(error.message || "Error al buscar el producto");
            setNombreProducto('');
        } finally {
            searchInputRef.current?.focus();
        }
    };

    // Función para actualizar la cantidad de un producto
    const actualizarCantidad = (index, cantidad) => {
        const nuevosProductos = [...productos];
        const producto = nuevosProductos[index];
        const diferencia = (cantidad - producto.cantidad) * producto.precio;

        producto.cantidad = cantidad;
        setProductos(nuevosProductos);
        setTotal(prevTotal => prevTotal + diferencia);
    };

    // Función para eliminar un producto
    const eliminarProducto = (index) => {
        const producto = productos[index];
        const nuevosProductos = productos.filter((_, i) => i !== index);
        setProductos(nuevosProductos);
        setTotal(prevTotal => prevTotal - (producto.precio * producto.cantidad));

        // Actualizamos el índice de selección para que no quede fuera de los límites
        setSelectedIndex(Math.min(index, nuevosProductos.length - 1));

        Toastify({
            text: `Producto ${producto.nombre} eliminado`,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "#ff6b6b",
            }
        }).showToast();
    };

    // Lógica de navegación con las teclas
    const handleKeyDown = (e) => {
        if (modalCobroOpen || dialogOpen) return;

        switch (e.key) {
            case 'ArrowUp':
                setSelectedIndex(prev => Math.max(0, prev - 1));
                e.preventDefault();
                break;
            case 'ArrowDown':
                setSelectedIndex(prev => Math.min(productos.length - 1, prev + 1));
                e.preventDefault();
                break;
            case '*':
                if (selectedIndex !== -1) {
                    setDialogOpen(true);
                }
                e.preventDefault();
                break;
            case 'Delete':
                if (selectedIndex !== -1) {
                    eliminarProducto(selectedIndex);
                }
                e.preventDefault();
                break;
            case 'Enter':
                if (nombreProducto !== '') {
                    agregarProducto(); // Añadir el producto al presionar Enter
                } else if (productos.length > 0) {
                    setModalCobroOpen(true);
                }
                e.preventDefault();
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [productos, nombreProducto, selectedIndex, modalCobroOpen, dialogOpen]);

    return (
        <div>
            <h1>Ventas</h1>
            <input
                ref={searchInputRef}
                type="text"
                value={nombreProducto}
                onChange={(e) => setNombreProducto(e.target.value)}
                placeholder="Buscar producto por código"
            />
            <ul>
                {productos.map((producto, index) => (
                    <li key={index} className={selectedIndex === index ? styles.selected : ''}>
                        <span>x {producto.cantidad}</span>
                        <span>{producto.nombre}</span>
                        <span>${producto.precio}</span>
                        <span>${(producto.precio * producto.cantidad).toFixed(2)}</span>
                    </li>
                ))}
            </ul>
            <h2>Total: ${total.toFixed(2)}</h2>

            <CantidadDialog
                isOpen={dialogOpen}
                producto={productos[selectedIndex]}
                onClose={() => setDialogOpen(false)}
                onSave={cantidad => {
                    actualizarCantidad(selectedIndex, cantidad);
                    setDialogOpen(false);
                }}
            />

            <ModalCobro
                isOpen={modalCobroOpen}
                productos={productos}
                onClose={() => setModalCobroOpen(false)}
                onCobrar={(opcion) => {
                    console.log('Cobrar con:', opcion);
                    setModalCobroOpen(false);
                }}
            />
        </div>
    );
};

export default Ventas;
