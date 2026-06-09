import syscomClient from './src/utils/syscomClient.js';

async function run() {
  if (!syscomClient.isConfigured()) {
    console.error('Syscom client is not configured.');
    return;
  }
  
  // Vamos a probar con un ID conocido, por ejemplo uno de Súper Precio, o buscaremos uno si no tenemos.
  const searchResult = await syscomClient.searchProducts({ limit: 1, etiqueta: 'Super Precio' });
  if (searchResult.success && searchResult.data && searchResult.data.productos && searchResult.data.productos.length > 0) {
      const productId = searchResult.data.productos[0].producto_id;
      console.log(`Buscando detalle para producto ID: ${productId}`);
      
      const productResult = await syscomClient.getProduct(productId);
      if (productResult.success) {
          console.log(JSON.stringify(productResult.data, null, 2));
      } else {
          console.error('Error fetching product:', productResult.error);
      }
  } else {
      console.log('No se encontraron productos para probar.');
  }
}

run().catch(console.error);
