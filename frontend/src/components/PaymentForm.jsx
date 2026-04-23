import { useState } from 'react';
import { Form, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { BsCreditCard, BsShieldCheck } from 'react-icons/bs';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover } from 'react-icons/fa';
import { SiPaypal } from 'react-icons/si';

const PaymentForm = ({ paymentInfo, onChange, errors = {} }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [detectedCardType, setDetectedCardType] = useState('');

  // Detectar tipo de tarjeta basado en el número
  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    
    // Patrones de detección de tarjetas
    if (/^4/.test(cleaned)) {
      return 'visa';
    } else if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
      return 'mastercard';
    } else if (/^3[47]/.test(cleaned)) {
      return 'amex';
    } else if (/^6(?:011|5)/.test(cleaned)) {
      return 'discover';
    }
    return 'other';
  };

  // Formatear número de tarjeta con espacios
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  // Manejar cambio de número de tarjeta
  const handleCardNumberChange = (value) => {
    // Remover caracteres no numéricos
    const cleaned = value.replace(/\D/g, '');
    
    // Limitar a 16 dígitos (19 para algunos casos)
    const limited = cleaned.slice(0, 16);
    
    // Formatear con espacios
    const formatted = formatCardNumber(limited);
    setCardNumber(formatted);
    
    // Detectar tipo de tarjeta
    const cardType = detectCardType(limited);
    setDetectedCardType(cardType);
    
    // Actualizar estado padre
    const lastFour = limited.slice(-4);
    onChange({
      ...paymentInfo,
      cardLastFour: lastFour,
      cardType: cardType
    });
  };

  // Manejar cambio de método de pago
  const handleMethodChange = (method) => {
    onChange({
      ...paymentInfo,
      method: method,
      cardType: method === 'credit_card' || method === 'debit_card' ? detectedCardType : undefined,
      cardLastFour: method === 'credit_card' || method === 'debit_card' ? paymentInfo.cardLastFour : undefined,
      cardHolder: method === 'credit_card' || method === 'debit_card' ? paymentInfo.cardHolder : undefined
    });
  };

  // Manejar fecha de expiración
  const [expiryDate, setExpiryDate] = useState('');
  const handleExpiryChange = (value) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    setExpiryDate(cleaned.slice(0, 5));
  };

  // Manejar CVV
  const [cvv, setCvv] = useState('');
  const handleCvvChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, detectedCardType === 'amex' ? 4 : 3);
    setCvv(cleaned);
  };

  // Renderizar icono de tarjeta
  const renderCardIcon = () => {
    const iconProps = { size: 32 };
    
    switch (detectedCardType) {
      case 'visa':
        return <FaCcVisa {...iconProps} style={{ color: '#1A1F71' }} />;
      case 'mastercard':
        return <FaCcMastercard {...iconProps} style={{ color: '#EB001B' }} />;
      case 'amex':
        return <FaCcAmex {...iconProps} style={{ color: '#006FCF' }} />;
      case 'discover':
        return <FaCcDiscover {...iconProps} style={{ color: '#FF6000' }} />;
      default:
        return <BsCreditCard {...iconProps} className="text-muted" />;
    }
  };

  const showCardForm = paymentInfo.method === 'credit_card' || paymentInfo.method === 'debit_card';

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex align-items-center">
          <BsShieldCheck className="me-2 text-success" size={20} />
          <h5 className="mb-0">Método de Pago</h5>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        
        {/* Selector de método de pago */}
        <Row className="mb-4">
          <Col md={12}>
            <Form.Group>
              <Form.Label className="fw-semibold">
                Selecciona el método de pago <span className="text-danger">*</span>
              </Form.Label>
              
              <div className="d-flex flex-column gap-2">
                <Form.Check
                  type="radio"
                  id="credit_card"
                  name="paymentMethod"
                  label={
                    <div className="d-flex align-items-center">
                      <BsCreditCard className="me-2" />
                      <span>Tarjeta de Crédito</span>
                    </div>
                  }
                  checked={paymentInfo.method === 'credit_card'}
                  onChange={() => handleMethodChange('credit_card')}
                  className="p-3 border rounded"
                  style={{ cursor: 'pointer' }}
                />
                
                <Form.Check
                  type="radio"
                  id="debit_card"
                  name="paymentMethod"
                  label={
                    <div className="d-flex align-items-center">
                      <BsCreditCard className="me-2" />
                      <span>Tarjeta de Débito</span>
                    </div>
                  }
                  checked={paymentInfo.method === 'debit_card'}
                  onChange={() => handleMethodChange('debit_card')}
                  className="p-3 border rounded"
                  style={{ cursor: 'pointer' }}
                />
                
                <Form.Check
                  type="radio"
                  id="paypal"
                  name="paymentMethod"
                  label={
                    <div className="d-flex align-items-center">
                      <SiPaypal className="me-2" style={{ color: '#003087' }} />
                      <span>PayPal</span>
                    </div>
                  }
                  checked={paymentInfo.method === 'paypal'}
                  onChange={() => handleMethodChange('paypal')}
                  className="p-3 border rounded"
                  style={{ cursor: 'pointer' }}
                />
                
                <Form.Check
                  type="radio"
                  id="bank_transfer"
                  name="paymentMethod"
                  label={
                    <div className="d-flex align-items-center">
                      <span className="me-2">🏦</span>
                      <span>Transferencia Bancaria</span>
                    </div>
                  }
                  checked={paymentInfo.method === 'bank_transfer'}
                  onChange={() => handleMethodChange('bank_transfer')}
                  className="p-3 border rounded"
                  style={{ cursor: 'pointer' }}
                />
                
                <Form.Check
                  type="radio"
                  id="cash"
                  name="paymentMethod"
                  label={
                    <div className="d-flex align-items-center">
                      <span className="me-2">💵</span>
                      <span>Efectivo (Pago contra entrega)</span>
                    </div>
                  }
                  checked={paymentInfo.method === 'cash'}
                  onChange={() => handleMethodChange('cash')}
                  className="p-3 border rounded"
                  style={{ cursor: 'pointer' }}
                />
              </div>
              
              {errors.method && (
                <div className="text-danger small mt-2">{errors.method}</div>
              )}
            </Form.Group>
          </Col>
        </Row>

        {/* Formulario de tarjeta */}
        {showCardForm && (
          <>
            <div className="alert alert-info d-flex align-items-center mb-4">
              <BsShieldCheck className="me-2" size={20} />
              <small>Tu información está protegida y encriptada</small>
            </div>

            <Row>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Número de Tarjeta <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      isInvalid={!!errors.cardNumber}
                      className="form-control-lg"
                      maxLength={19}
                    />
                    <InputGroup.Text className="bg-white">
                      {renderCardIcon()}
                    </InputGroup.Text>
                    <Form.Control.Feedback type="invalid">
                      {errors.cardNumber}
                    </Form.Control.Feedback>
                  </InputGroup>
                  {detectedCardType && detectedCardType !== 'other' && (
                    <Form.Text className="text-success">
                      ✓ {detectedCardType === 'visa' ? 'Visa' : 
                         detectedCardType === 'mastercard' ? 'Mastercard' :
                         detectedCardType === 'amex' ? 'American Express' : 
                         'Discover'} detectada
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Nombre del Titular <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nombre como aparece en la tarjeta"
                    value={paymentInfo.cardHolder || ''}
                    onChange={(e) => onChange({
                      ...paymentInfo,
                      cardHolder: e.target.value.toUpperCase()
                    })}
                    isInvalid={!!errors.cardHolder}
                    className="form-control-lg"
                    style={{ textTransform: 'uppercase' }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.cardHolder}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Fecha de Vencimiento <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="MM/AA"
                    value={expiryDate}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    className="form-control-lg"
                    maxLength={5}
                  />
                  <Form.Text className="text-muted">
                    Formato: MM/AA
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    CVV <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={detectedCardType === 'amex' ? '4 dígitos' : '3 dígitos'}
                    value={cvv}
                    onChange={(e) => handleCvvChange(e.target.value)}
                    className="form-control-lg"
                    maxLength={detectedCardType === 'amex' ? 4 : 3}
                  />
                  <Form.Text className="text-muted">
                    {detectedCardType === 'amex' 
                      ? '4 dígitos en el frente' 
                      : '3 dígitos al reverso'}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </>
        )}

        {/* Mensaje para otros métodos */}
        {paymentInfo.method === 'paypal' && (
          <div className="alert alert-info">
            Serás redirigido a PayPal para completar tu pago de forma segura.
          </div>
        )}
        
        {paymentInfo.method === 'bank_transfer' && (
          <div className="alert alert-info">
            Recibirás instrucciones para realizar la transferencia bancaria por correo electrónico.
          </div>
        )}
        
        {paymentInfo.method === 'cash' && (
          <div className="alert alert-info">
            Pagarás en efectivo al momento de recibir tu pedido.
          </div>
        )}
        
      </Card.Body>
    </Card>
  );
};

export default PaymentForm;
