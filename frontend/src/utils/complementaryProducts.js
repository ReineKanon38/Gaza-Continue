// Utilidades para sugerir productos complementarios basados en similitud
export const suggestComplementaryProducts = (currentProduct, allProducts) => {
  if (!currentProduct || !allProducts || allProducts.length === 0) {
    return [];
  }

  const currentBrand = (currentProduct?.marca || currentProduct?.brand || '').toLowerCase();
  const currentCategory = (currentProduct?.categoria || currentProduct?.category || '').toLowerCase();
  const currentName = (currentProduct?.titulo || currentProduct?.nombre || currentProduct?.name || '').toLowerCase();

  // Filtrar y puntuar productos
  const scoredProducts = allProducts
    .filter(p => {
      const productId = p?.syscomId || p?._id || p?.id;
      const currentId = currentProduct?.syscomId || currentProduct?._id || currentProduct?.id;
      return productId !== currentId; // Excluir el producto actual
    })
    .map(product => {
      let score = 0;

      // Misma marca (+30 puntos)
      if (currentBrand && (product?.marca || product?.brand || '').toLowerCase().includes(currentBrand)) {
        score += 30;
      }

      // Misma categoría (+25 puntos)
      if (currentCategory && (product?.categoria || product?.category || '').toLowerCase().includes(currentCategory)) {
        score += 25;
      }

      // Palabras clave similares en nombre
      const currentNameWords = currentName.split(/\s+/);
      const productNameLower = (product?.titulo || product?.nombre || product?.name || '').toLowerCase();
      currentNameWords.forEach(word => {
        if (word.length > 3 && productNameLower.includes(word)) {
          score += 10;
        }
      });

      // Categorías relacionadas comunes
      const categoryKeywords = {
        'cámara': ['video', 'seguridad', 'vigilancia', 'dvr', 'nvr'],
        'router': ['switch', 'red', 'wifi', 'modem'],
        'servidor': ['storage', 'rack', 'ups'],
        'ups': ['batería', 'fuente', 'energía'],
        'monitor': ['cable', 'hdmi', 'vga']
      };

      for (const [key, keywords] of Object.entries(categoryKeywords)) {
        if (currentName.includes(key)) {
          keywords.forEach(keyword => {
            if (productNameLower.includes(keyword)) {
              score += 8;
            }
          });
        }
      }

      // Con stock disponible (+5 puntos bonus)
      if (Number(product?.stock || product?.existencia || 0) > 0) {
        score += 5;
      }

      return { product, score };
    })
    .filter(item => item.score > 0) // Solo productos con puntuación positiva
    .sort((a, b) => b.score - a.score)
    .slice(0, 6) // Top 6 opciones
    .map(item => item.product);

  return scoredProducts;
};

// Función alternativa para obtener productos de la misma categoría o marca
export const getRelatedProducts = (currentProduct, allProducts, limit = 3) => {
  if (!currentProduct || !allProducts || allProducts.length === 0) {
    return [];
  }

  const complementary = suggestComplementaryProducts(currentProduct, allProducts);
  
  // Si no hay complementarios con puntuación, toma los primeros disponibles
  if (complementary.length < limit) {
    const currentId = currentProduct?.syscomId || currentProduct?._id || currentProduct?.id;
    const additional = allProducts
      .filter(p => {
        const pId = p?.syscomId || p?._id || p?.id;
        return pId !== currentId && !complementary.find(c => (c?.syscomId || c?._id || c?.id) === pId);
      })
      .slice(0, limit - complementary.length);
    
    return [...complementary, ...additional].slice(0, Math.max(limit, 3));
  }

  return complementary.slice(0, Math.max(limit, 3)); // Al menos 3 productos
};
