import { Card, Button } from 'react-bootstrap';
import { BsCartPlusFill } from 'react-icons/bs';
import { useCartHelpers } from '../hooks/useCartHooks';

function ProductCard({ product }) {
  const { addToCart, isInCart, getItemQuantity } = useCartHelpers();

    if (!product) {
        return null;
    }

    const imagePlaceholder = {
    height: '200px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#ffffff',
    fontSize: '2.5rem',
    position: 'relative',
    overflow: 'hidden'
  };

  const imageUrl = product.image || null;
  const safePrice = Number(product.price || 0);
  const safeListPrice = Number(product.listPrice || 0);
  const hasPromoPrice = safeListPrice > safePrice && safePrice > 0;
  const stock = Number(product.stock || 0);
  const hasLowStock = stock > 0 && stock <= 5;
  const isOutOfStock = stock <= 0;

  return (
    <Card className="h-100 shadow-sm border-0 fade-in">
      {imageUrl ? (
        <div style={{ height: '200px', overflow: 'hidden' }}>
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
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
            background: 'rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            📦
          </div>
        </div>
      )}
      <Card.Body className="d-flex flex-column p-4">
        <div className="d-flex gap-2 mb-2 flex-wrap">
          {product.isSuperPrecio && <span className="badge text-bg-danger">Super Precio</span>}
          {hasLowStock && <span className="badge text-bg-warning">Ultimas piezas</span>}
          {isOutOfStock && <span className="badge text-bg-secondary">Sin stock</span>}
        </div>
        <Card.Title className="mb-2" style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600',
            color: 'var(--text-primary)',
            minHeight: '3rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
        }}>
            {product.name}
        </Card.Title>
        {product.description && (
            <Card.Text className="text-muted small mb-2" style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                minHeight: '2.5rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
            }}>
                {product.description}
            </Card.Text>
        )}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        {hasPromoPrice && (
                            <div className="text-muted text-decoration-line-through small">
                                ${safeListPrice.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                            </div>
                        )}
                        <Card.Text className="mb-0" style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: '700',
                            color: 'var(--primary-color)'
                        }}>
                            {typeof product.price === 'number' 
                                ? `$${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN` 
                                : product.price}
                        </Card.Text>
                    </div>
                    {product.stock !== undefined && (
                        <span className={`badge ${hasLowStock ? 'bg-warning text-dark' : 'bg-secondary'}`} style={{ 
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem'
                        }}>
                            Stock: {product.stock}
                        </span>
                    )}
        </div>
        <Button 
                    onClick={() => addToCart(product, 1)}
                    className="btn-custom-primary w-100 d-flex align-items-center justify-content-center"
                    disabled={!product.active || isOutOfStock}
                    style={{ 
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
        >
                    <BsCartPlusFill className="me-2" style={{ fontSize: '1.1rem' }} />
                    {isOutOfStock
                        ? 'No disponible'
                        : isInCart(product._id)
                            ? `En carrito (${getItemQuantity(product._id)})`
                            : 'Agregar al Carrito'}
        </Button>
            </Card.Body>
    </Card>
    );
}

export default ProductCard;
