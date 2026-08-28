import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { BsCartPlusFill } from 'react-icons/bs';
import { useCartHelpers } from '../hooks/useCartHooks';
import { generateProductBenefits } from '../utils/productBenefits';

function ProductCard({ product, matchMeta = null, viewMode = 'grid' }) {
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCartHelpers();

  if (!product) {
    return null;
  }

  const isList = viewMode === 'list';

  const imagePlaceholder = {
    height: isList ? '100%' : '200px',
    minHeight: isList ? '150px' : 'auto',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#ffffff',
    fontSize: isList ? '1.5rem' : '2.5rem',
    position: 'relative',
    overflow: 'hidden'
  };

  const [imgError, setImgError] = React.useState(false);
  const imageUrl = product.image || product.img_portada || product.imagen || product.picture || product.foto || null;
  const safePrice = Number(product.price || 0);
  const safeListPrice = Number(product.listPrice || 0);
  const hasPromoPrice = safeListPrice > safePrice && safePrice > 0;
  const stock = Number(product.stock || 0);
  const hasLowStock = stock > 0 && stock <= 5;
  const isOutOfStock = stock <= 0;
  const productBenefits = generateProductBenefits(product);
  const productCode = product.syscomId || product._id || product.modelo || product.id || product.code || product.codigo || '';
  const productSlug = encodeURIComponent(productCode || product.name || `item-${Date.now()}`);

  return (
    <Card
      className={`product-card h-100 auth-card border-0 fade-in ${isList ? 'd-flex flex-row' : ''}`}
      style={{ cursor: 'pointer', overflow: 'hidden' }}
      onClick={() => navigate(`/product/${productSlug}`, { state: { product } })}
    >
      <div className={`product-card-media ${isList ? 'border-end' : ''}`} style={isList ? { width: '250px', flexShrink: 0 } : {}}>
        {imageUrl && !imgError ? (
        <div style={{ height: isList ? '100%' : '200px', minHeight: isList ? '150px' : 'auto', overflow: 'hidden' }}>
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              background: '#fff'
            }}
          />
        </div>
      ) : (
        <div style={imagePlaceholder}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '2rem' }}>📦</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#38bdf8', letterSpacing: '0.05em' }}>
              {product.brand || 'SYSCOM'}
            </span>
          </div>
        </div>
      )}
      </div>
      <Card.Body className={`d-flex flex-column ${isList ? 'p-4 flex-grow-1 justify-content-between' : 'p-4'}`}>
        <div className={isList ? 'd-flex flex-column h-100' : ''}>
          <div className="d-flex gap-2 mb-2 flex-wrap">
            {product.isSuperPrecio && <span className="badge text-bg-danger">Super Precio</span>}
            {matchMeta?.isApprox && <span className="badge text-bg-info">Coincidencia aproximada</span>}
            {hasLowStock && <span className="badge text-bg-warning">Ultimas piezas</span>}
            {isOutOfStock && <span className="badge text-bg-secondary">Sin stock</span>}
          </div>
          <div className="product-title-wrapper">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
              {product.modelo || product.syscomId ? `Modelo: ${product.modelo || product.syscomId}` : 'Código N/A'}
            </div>
            <Card.Title className="mb-2 product-title" style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600',
                color: 'var(--text-primary)',
                minHeight: isList ? 'auto' : '3rem',
                display: '-webkit-box',
                WebkitLineClamp: isList ? 1 : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                cursor: 'default'
            }}>
                {product.name}
            </Card.Title>
            <div className="product-title-hover-overlay">
              <div className="product-hover-info">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <span className={`badge ${isOutOfStock ? 'bg-secondary' : hasLowStock ? 'bg-warning text-dark' : 'bg-primary text-white'}`}>
                    {isOutOfStock ? 'Sin stock' : 'Disponible'}
                  </span>
                </div>
                <h6 className="product-hover-title" style={{ color: 'var(--primary-light)' }}>{product.name}</h6>
                {productCode && <p className="product-hover-meta" style={{ color: 'var(--primary-light)' }}>Código: {productCode}</p>}
                {productBenefits.length > 0 ? (
                  <ul className="product-hover-features mb-0">
                    {productBenefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
          
          <Card.Text className="text-muted small mb-3">
            <strong>Marca:</strong> {product.marca || product.distributor || 'No especificada'}
          </Card.Text>

          {isList && product.description && (
              <Card.Text className="text-muted mb-2 product-card-description" style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
              }}>
                  {product.description}
              </Card.Text>
          )}

          <div className={`mt-auto ${isList ? 'd-flex align-items-end justify-content-between w-100' : ''}`}>
            <div className="d-flex flex-column mb-3">
              {hasPromoPrice ? (
                <>
                  <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.85rem' }}>
                    ${safeListPrice.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div className="d-flex align-items-baseline gap-2">
                    <span className="h4 mb-0 fw-bold" style={{ color: 'var(--brand-primary)' }}>
                      ${safePrice.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="badge bg-danger rounded-pill">
                      -{Math.round((1 - safePrice/safeListPrice) * 100)}%
                    </span>
                  </div>
                </>
              ) : (
                <span className="h4 mb-0 fw-bold" style={{ color: 'var(--brand-primary)' }}>
                  ${safePrice.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
              
              <div className="mt-2 text-muted small d-flex align-items-center">
                <span className={`d-inline-block rounded-circle me-2 ${stock > 0 ? 'bg-success' : 'bg-secondary'}`} style={{ width: '8px', height: '8px' }}></span>
                {stock > 0 ? `${stock} piezas disponibles` : 'Sin inventario'}
              </div>
            </div>

            <div style={{ width: isList ? '200px' : '100%' }}>
              {isInCart(product._id) ? (
                <div className="d-flex align-items-center justify-content-between p-2 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }} onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="outline-light"
                    size="sm"
                    className="rounded-circle d-flex align-items-center justify-content-center p-0"
                    style={{ width: '28px', height: '28px' }}
                    onClick={() => addToCart(product, -1)}
                  >
                    -
                  </Button>
                  <span className="fw-bold px-3 text-light">{getItemQuantity(product._id)}</span>
                  <Button 
                    variant="outline-light"
                    size="sm"
                    className="rounded-circle d-flex align-items-center justify-content-center p-0"
                    style={{ width: '28px', height: '28px' }}
                    onClick={() => addToCart(product, 1)}
                    disabled={getItemQuantity(product._id) >= stock}
                  >
                    +
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-100 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                  style={{ 
                    background: 'linear-gradient(135deg, #7C3AED 0%, #0ABFBF 100%)', 
                    border: 'none',
                    fontWeight: '600',
                    color: '#fff',
                    padding: '0.6rem'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product, 1);
                  }}
                  disabled={isOutOfStock}
                >
                  <BsCartPlusFill />
                  {isOutOfStock ? 'Agotado' : 'Agregar'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
    );
}

const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.product?._id === nextProps.product?._id &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.matchMeta?.isApprox === nextProps.matchMeta?.isApprox
  );
};

export default React.memo(ProductCard, areEqual);
