import React, { useState, useEffect, useRef } from 'react';

const CantidadDialog = ({ isOpen, producto, onClose, onSave }) => {
    const [tempCantidad, setTempCantidad] = useState(producto?.cantidad || 1);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTempCantidad(producto?.cantidad || 1);
            // Asegurar que el input esté enfocado y seleccionado
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, 10);
        }
    }, [isOpen, producto]);

    const handleKeyDown = (e) => {
        e.stopPropagation(); // Detener la propagación del evento
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
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            zIndex: 1000
        }}>
            <h3>{producto?.nombre}</h3>
            <input
                ref={inputRef}
                type="number"
                value={tempCantidad}
                onChange={(e) => setTempCantidad(parseInt(e.target.value) || 1)}
                onKeyDown={handleKeyDown}
                min="1"
            />
            <p>Precio: ${producto ? (producto.precio * tempCantidad).toFixed(2) : 0}</p>
            <button onClick={() => onSave(tempCantidad)}>Guardar</button>
            <button onClick={onClose}>Cerrar</button>
        </div>
    );
};

const Ventas = () => {
    const [productos, setProductos] = useState([]);
    const [nombreProducto, setNombreProducto] = useState('');
    const [total, setTotal] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [numeroBuffer, setNumeroBuffer] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const searchInputRef = useRef(null);

    const agregarProducto = async () => {
        try {
            const codigo = nombreProducto.toUpperCase(); // Convertir a mayúsculas
            const response = await fetch(`http://localhost:5000/ventas/buscar/codigo?codigo=${codigo}`);
            if (response.status === 404) {
                console.error('Producto no encontrado');
                setNombreProducto('');
                searchInputRef.current?.focus();
                return;
            }
            const data = await response.json();
            if (data) {
                const nuevoProducto = { ...data, cantidad: 1 };
                setProductos([...productos, nuevoProducto]);
                setTotal(total + nuevoProducto.precio);
                setNombreProducto('');
            } else {
                console.error('Producto no encontrado');
                setNombreProducto('');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            setNombreProducto('');
        }
        searchInputRef.current?.focus();
    };

    const actualizarCantidad = (index, cantidad) => {
        const nuevosProductos = [...productos];
        const producto = nuevosProductos[index];
        const cantidadPrevia = producto.cantidad || 1;
        const nuevaCantidad = Math.max(1, cantidad); // Asegura que la cantidad no sea menor a 1
        const diferencia = (nuevaCantidad - cantidadPrevia) * parseFloat(producto.precio);
        
        producto.cantidad = nuevaCantidad;
        setProductos(nuevosProductos);
        setTotal(prevTotal => prevTotal + diferencia);
    };

    const handleKeyDown = (e) => {
        if (dialogOpen) {
            // No manejar eventos de teclado globales cuando el diálogo está abierto
            return;
        }

        // Si el diálogo está cerrado, manejar navegación y selección
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
                    setNumeroBuffer('');
                }
                e.preventDefault();
                break;
            case 'Enter':
                if (document.activeElement === searchInputRef.current) {
                    agregarProducto();
                }
                e.preventDefault();
                break;
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [productos, selectedIndex, dialogOpen]);

    // Reset numeroBuffer cuando cambie el producto seleccionado
    useEffect(() => {
        setNumeroBuffer('');
    }, [selectedIndex]);

    // Focus search input when component mounts and after each render
    useEffect(() => {
        searchInputRef.current?.focus();
    });

    return (
        <div>
            <h1>Ventas</h1>
            <div>
                <input 
                    ref={searchInputRef}
                    type="text" 
                    value={nombreProducto} 
                    onChange={(e) => setNombreProducto(e.target.value)} 
                    placeholder="Nombre del producto"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            agregarProducto();
                            e.preventDefault();
                        }
                    }}
                />
                <button onClick={agregarProducto}>Agregar Producto</button>
            </div>
            <ul>
                {productos.map((producto, index) => (
                    <li key={index} 
                        style={{ 
                            backgroundColor: selectedIndex === index ? '#e0e0e0' : 'transparent',
                            padding: '5px'
                        }}
                    >
                        {producto.nombre} - ${producto.precio} x {producto.cantidad}
                    </li>
                ))}
            </ul>
            <h2>Total: ${total}</h2>
            
            <CantidadDialog 
                isOpen={dialogOpen}
                producto={selectedIndex !== -1 ? productos[selectedIndex] : null}
                onClose={() => {
                    setDialogOpen(false);
                    searchInputRef.current?.focus();
                }}
                onSave={(cantidad) => {
                    actualizarCantidad(selectedIndex, cantidad);
                    setDialogOpen(false);
                    searchInputRef.current?.focus();
                }}
            />
        </div>
    );
};

export default Ventas;