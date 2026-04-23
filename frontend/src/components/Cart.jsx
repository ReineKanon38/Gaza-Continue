import React, { useState } from 'react';
import { 
    Offcanvas, 
    Button, 
    ListGroup, 
    Badge, 
    Row, 
    Col, 
    Form,
    Alert,
    Spinner
} from 'react-bootstrap';
import { BsCartX, BsTrash, BsPlus, BsDash } from 'react-icons/bs';
import { useCartHelpers } from '../hooks/useCartHooks';

const Cart = ({ show, onHide }) => {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discountAmount,
        totalPrice,
        isCartEmpty,
        canCheckout,
        applyDiscount,
        removeDiscount
    } = useCartHelpers();

    const [discountCode, setDiscountCode] = useState('');
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity >= 0) {
            updateQuantity(productId, parseInt(newQuantity));
        }
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;
        
        setIsApplyingDiscount(true);
        
        // Simulación de validación de código de descuento
        setTimeout(() => {
            const validCodes = {
                'DESCUENTO10': { percentage: 10 },
                'WELCOME': { percentage: 15 },
                'SAVE20': { amount: 20 }
            };
            
            const discount = validCodes[discountCode.toUpperCase()];
            
            if (discount) {
                applyDiscount(
                    discountCode.toUpperCase(),
                    discount.amount || 0,
                    discount.percentage || 0
                );
                setDiscountCode('');
            } else {
                alert('Código de descuento inválido');
            }
            
            setIsApplyingDiscount(false);
        }, 1000);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(price);
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: '400px' }}>
            <Offcanvas.Header closeButton className="border-bottom">
                <Offcanvas.Title>
                    <div className="d-flex align-items-center">
                        🛒 Carrito
                        {totalItems > 0 && (
                            <Badge bg="primary" className="ms-2">
                                {totalItems}
                            </Badge>
                        )}
                    </div>
                </Offcanvas.Title>
            </Offcanvas.Header>
            
            <Offcanvas.Body className="d-flex flex-column">
                {/* Loading State */}
                {cart.loading && (
                    <div className="text-center py-4">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </div>
                )}

                {/* Error State */}
                {cart.error && (
                    <Alert variant="danger" className="mb-3">
                        {cart.error}
                    </Alert>
                )}

                {/* Empty Cart */}
                {isCartEmpty && !cart.loading ? (
                    <div className="text-center py-5">
                        <BsCartX size={60} className="text-muted mb-3" />
                        <h5 className="text-muted">Tu carrito está vacío</h5>
                        <p className="text-muted">Agrega algunos productos para comenzar</p>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="flex-grow-1">
                            <ListGroup variant="flush">
                                {cart.items.map((item) => (
                                    <ListGroup.Item key={item.product._id} className="px-0">
                                        <Row className="align-items-center">
                                            <Col xs={3}>
                                                <div 
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        backgroundColor: '#f8f9fa',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    {item.product.image ? (
                                                        <img 
                                                            src={item.product.image} 
                                                            alt={item.product.name}
                                                            style={{ 
                                                                width: '100%', 
                                                                height: '100%', 
                                                                objectFit: 'cover',
                                                                borderRadius: '8px'
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="text-muted">📦</span>
                                                    )}
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <div>
                                                    <h6 className="mb-1 small">
                                                        {item.product.name}
                                                    </h6>
                                                    <p className="text-muted mb-1 small">
                                                        {formatPrice(item.product.price)}
                                                    </p>
                                                </div>
                                            </Col>
                                            <Col xs={3}>
                                                <div className="d-flex flex-column align-items-end">
                                                    <div className="d-flex align-items-center mb-1">
                                                        <Button 
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                                            style={{ padding: '2px 6px' }}
                                                        >
                                                            <BsDash size={12} />
                                                        </Button>
                                                        <Form.Control
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityChange(item.product._id, e.target.value)}
                                                            style={{ 
                                                                width: '50px', 
                                                                textAlign: 'center',
                                                                fontSize: '12px',
                                                                margin: '0 4px'
                                                            }}
                                                            min="0"
                                                        />
                                                        <Button 
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                                            style={{ padding: '2px 6px' }}
                                                        >
                                                            <BsPlus size={12} />
                                                        </Button>
                                                    </div>
                                                    <Button 
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => removeFromCart(item.product._id)}
                                                        style={{ padding: '2px 6px' }}
                                                    >
                                                        <BsTrash size={10} />
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>

                        {/* Discount Section */}
                        <div className="mt-3 pt-3 border-top">
                            <h6 className="mb-3">Código de descuento</h6>
                            {cart.discount.code ? (
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-success">
                                        Código: {cart.discount.code}
                                    </span>
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={removeDiscount}
                                    >
                                        Quitar
                                    </Button>
                                </div>
                            ) : (
                                <div className="d-flex gap-2 mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Código de descuento"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                                    />
                                    <Button 
                                        variant="outline-primary"
                                        onClick={handleApplyDiscount}
                                        disabled={!discountCode.trim() || isApplyingDiscount}
                                    >
                                        {isApplyingDiscount ? (
                                            <Spinner size="sm" animation="border" />
                                        ) : (
                                            'Aplicar'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Cart Summary */}
                        <div className="mt-3 pt-3 border-top">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            
                            {discountAmount > 0 && (
                                <div className="d-flex justify-content-between mb-2 text-success">
                                    <span>Descuento:</span>
                                    <span>-{formatPrice(discountAmount)}</span>
                                </div>
                            )}
                            
                            {cart.shipping.cost > 0 && (
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Envío:</span>
                                    <span>{formatPrice(cart.shipping.cost)}</span>
                                </div>
                            )}
                            
                            <hr />
                            <div className="d-flex justify-content-between mb-3">
                                <strong>Total:</strong>
                                <strong>{formatPrice(totalPrice)}</strong>
                            </div>
                            
                            <div className="d-grid gap-2">
                                <Button 
                                    variant="primary" 
                                    size="lg"
                                    disabled={!canCheckout}
                                >
                                    Proceder al Pago
                                </Button>
                                <Button 
                                    variant="outline-secondary"
                                    onClick={clearCart}
                                    disabled={isCartEmpty}
                                >
                                    Vaciar Carrito
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default Cart;