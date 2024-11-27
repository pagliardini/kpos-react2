const axios = require('axios');

async function getProductInfo(ean13) {
    const url = `https://pricely.ar/product/${ean13}`;
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            // Procesar datos de la respuesta
            console.log(response.data);
        } else {
            console.log("No se encontró información para el producto.");
        }
    } catch (error) {
        console.error("Error al acceder al sitio:", error);
    }
}

getProductInfo("7790895003295");
