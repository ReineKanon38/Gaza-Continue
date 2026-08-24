import React from 'react';
import { Spinner } from 'react-bootstrap';
import './PageLoader.css';

const PageLoader = () => {
  return (
    <div className="page-loader-wrapper">
      <div className="page-loader-content">
        <div className="loader-brand-icon">
          <Spinner animation="grow" variant="info" size="sm" />
          <Spinner animation="grow" variant="primary" className="mx-2" />
          <Spinner animation="grow" variant="info" size="sm" />
        </div>
        <h4 className="loader-title mt-4">Cargando...</h4>
        <p className="loader-subtitle text-muted">Preparando tu experiencia</p>
      </div>
    </div>
  );
};

export default PageLoader;
