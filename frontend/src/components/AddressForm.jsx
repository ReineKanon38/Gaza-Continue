import { useState } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import { BsGeoAlt } from 'react-icons/bs';

const AddressForm = ({
  address,
  onChange,
  errors = {},
  zipLookupLoading = false,
  zipLookupError = '',
  zipLookupSuccess = false,
  autoCompleteOptions = { neighborhoods: [] }
}) => {
  const [isFocused, setIsFocused] = useState({});

  const handleChange = (field, value) => {
    onChange({
      ...address,
      [field]: value
    });
  };

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex align-items-center">
          <BsGeoAlt className="me-2 text-primary" size={20} />
          <h5 className="mb-0">Dirección de Envío</h5>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        <Row>
          <Col md={8} className="mb-3">
            <Form.Group>
              <Form.Label className="fw-semibold">
                Calle <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Avenida Insurgentes"
                value={address.street || ''}
                onChange={(e) => handleChange('street', e.target.value)}
                onFocus={() => handleFocus('street')}
                onBlur={() => handleBlur('street')}
                isInvalid={!!errors.street}
                className="form-control-lg"
              />
              <Form.Control.Feedback type="invalid">
                {errors.street}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4} className="mb-3">
            <Form.Group>
              <Form.Label className="fw-semibold">
                Número (opcional)
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: 123 o S/N"
                value={address.number || ''}
                onChange={(e) => handleChange('number', e.target.value)}
                onFocus={() => handleFocus('number')}
                onBlur={() => handleBlur('number')}
                isInvalid={!!errors.number}
                className="form-control-lg"
              />
              <Form.Control.Feedback type="invalid">
                {errors.number}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="fw-semibold">
                Colonia <span className="text-danger">*</span>
              </Form.Label>
              {(autoCompleteOptions?.neighborhoods || []).length > 0 ? (
                <Form.Select
                  value={address.neighborhood || ''}
                  onChange={(e) => handleChange('neighborhood', e.target.value)}
                  onFocus={() => handleFocus('neighborhood')}
                  onBlur={() => handleBlur('neighborhood')}
                  isInvalid={!!errors.neighborhood}
                  className="form-control-lg"
                  disabled={zipLookupLoading}
                >
                  <option value="">Selecciona una colonia</option>
                  {(autoCompleteOptions?.neighborhoods || []).map((neighborhood) => (
                    <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                  ))}
                </Form.Select>
              ) : (
                <Form.Control
                  type="text"
                  placeholder="Ej: Centro"
                  value={address.neighborhood || ''}
                  onChange={(e) => handleChange('neighborhood', e.target.value)}
                  onFocus={() => handleFocus('neighborhood')}
                  onBlur={() => handleBlur('neighborhood')}
                  isInvalid={!!errors.neighborhood}
                  className="form-control-lg"
                  disabled={zipLookupLoading}
                />
              )}
              <Form.Control.Feedback type="invalid">
                {errors.neighborhood}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="fw-semibold">
                Código Postal <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: 12345"
                value={address.zipCode || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                  handleChange('zipCode', value);
                }}
                onFocus={() => handleFocus('zipCode')}
                onBlur={() => handleBlur('zipCode')}
                isInvalid={!!errors.zipCode}
                maxLength={5}
                className="form-control-lg"
              />
              <Form.Control.Feedback type="invalid">
                {errors.zipCode}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {zipLookupLoading ? 'Consultando CP...' : '5 dígitos'}
              </Form.Text>
              {zipLookupError && <Form.Text className="text-danger d-block">{zipLookupError}</Form.Text>}
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="fw-semibold">
                Municipio <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Se autocompleta con CP"
                value={address.municipality || ''}
                onChange={(e) => handleChange('municipality', e.target.value)}
                onFocus={() => handleFocus('municipality')}
                onBlur={() => handleBlur('municipality')}
                isInvalid={!!errors.municipality}
                className="form-control-lg"
                readOnly={zipLookupLoading || zipLookupSuccess}
              />
              <Form.Control.Feedback type="invalid">
                {errors.municipality}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="fw-semibold">
                Ciudad <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Se autocompleta con CP"
                value={address.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                onFocus={() => handleFocus('city')}
                onBlur={() => handleBlur('city')}
                isInvalid={!!errors.city}
                className="form-control-lg"
                readOnly={zipLookupLoading || zipLookupSuccess}
              />
              <Form.Control.Feedback type="invalid">
                {errors.city}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="fw-semibold">
                Estado <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Se autocompleta con CP"
                value={address.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                onFocus={() => handleFocus('state')}
                onBlur={() => handleBlur('state')}
                isInvalid={!!errors.state}
                className="form-control-lg"
                readOnly={zipLookupLoading || zipLookupSuccess}
              />
              <Form.Control.Feedback type="invalid">
                {errors.state}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="fw-semibold">Localidad</Form.Label>
              <Form.Control
                type="text"
                placeholder="Se autocompleta con CP"
                value={address.locality || ''}
                onChange={(e) => handleChange('locality', e.target.value)}
                className="form-control-lg"
                readOnly={zipLookupLoading || zipLookupSuccess}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-3">
            <Form.Group>
              <Form.Label className="fw-semibold">
                Referencias adicionales (opcional)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Ej: Entre calles X y Y, edificio azul"
                value={address.additionalInfo || ''}
                onChange={(e) => handleChange('additionalInfo', e.target.value)}
                className="form-control-lg"
              />
              <Form.Text className="text-muted">
                Información adicional que ayude al repartidor
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default AddressForm;
