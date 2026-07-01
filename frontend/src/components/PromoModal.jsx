import { useState, useEffect } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { BsGiftFill, BsBellFill } from 'react-icons/bs';

const PromoModal = () => {
  const [show, setShow] = useState(false);
  const [promoContent, setPromoContent] = useState(null);

  useEffect(() => {
    // Check if we already showed a promo recently
    const lastPromoTime = localStorage.getItem('gaza_last_promo');
    const now = new Date().getTime();
    
    // Show promo if not shown in the last 24 hours (86400000 ms)
    const shouldShow = !lastPromoTime || (now - parseInt(lastPromoTime)) > 86400000;

    if (shouldShow) {
      // Simulate fetching a promo from backend
      setTimeout(() => {
        setPromoContent({
          title: "¡Gran Venta Especial!",
          message: "Aprovecha descuentos exclusivos en sistemas de CCTV y alarmas. ¡Hasta 40% OFF en productos seleccionados!",
          code: "PROMO40",
          validUntil: "Fin de mes"
        });
        setShow(true);
      }, 5000); // show 5 seconds after loading catalog
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('gaza_last_promo', new Date().getTime().toString());
  };

  if (!promoContent) return null;

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton className="bg-primary text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <BsGiftFill className="me-2" /> 
          Oferta Especial para ti
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center p-4">
        <div className="mb-3">
          <BsBellFill size={40} className="text-warning mb-2" />
        </div>
        <h4 className="fw-bold mb-3">{promoContent.title}</h4>
        <p className="text-muted mb-4">
          {promoContent.message}
        </p>
        <div className="p-3 bg-light rounded border border-primary border-opacity-25 mb-3">
          <span className="d-block small text-muted mb-1">Usa el código en tu carrito:</span>
          <Badge bg="primary" className="fs-5 px-3 py-2">{promoContent.code}</Badge>
        </div>
        <p className="small text-danger mb-0">Válido hasta: {promoContent.validUntil}</p>
      </Modal.Body>
      <Modal.Footer className="border-0 justify-content-center pb-4">
        <Button variant="primary" size="lg" onClick={handleClose} className="px-5">
          ¡Entendido!
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PromoModal;
