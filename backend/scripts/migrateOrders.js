// Script de migración para actualizar órdenes existentes
// Este script convierte el formato antiguo de órdenes al nuevo formato

import mongoose from 'mongoose';
import Order from '../src/models/Order.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gaza-syscom';

async function migrateOrders() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    // Buscar órdenes con el formato antiguo
    const oldOrders = await Order.find({
      $or: [
        { 'shippingAddress': { $type: 'string' } },
        { 'paymentMethod': { $exists: true } }
      ]
    });

    console.log(`\nEncontradas ${oldOrders.length} órdenes con formato antiguo\n`);

    if (oldOrders.length === 0) {
      console.log('✓ No hay órdenes que migrar');
      await mongoose.disconnect();
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;

    for (const order of oldOrders) {
      try {
        // Crear dirección por defecto si no existe
        const defaultAddress = {
          street: 'Dirección no especificada',
          number: 'S/N',
          neighborhood: 'Por definir',
          city: 'Por definir',
          state: 'Por definir',
          zipCode: '00000',
          country: 'México',
          additionalInfo: order.shippingAddress || ''
        };

        // Crear información de pago por defecto
        const defaultPaymentInfo = {
          method: 'cash', // Por defecto efectivo
          cardType: undefined,
          cardLastFour: undefined,
          cardHolder: undefined
        };

        // Si tenía paymentMethod, intentar convertirlo
        if (order.paymentMethod) {
          const method = order.paymentMethod.toLowerCase();
          if (method.includes('crédito') || method.includes('credito')) {
            defaultPaymentInfo.method = 'credit_card';
          } else if (method.includes('débito') || method.includes('debito')) {
            defaultPaymentInfo.method = 'debit_card';
          } else if (method.includes('paypal')) {
            defaultPaymentInfo.method = 'paypal';
          } else if (method.includes('transferencia') || method.includes('banco')) {
            defaultPaymentInfo.method = 'bank_transfer';
          }
        }

        // Actualizar la orden
        await Order.updateOne(
          { _id: order._id },
          {
            $set: {
              shippingAddress: defaultAddress,
              paymentInfo: defaultPaymentInfo
            },
            $unset: {
              paymentMethod: 1
            }
          }
        );

        migratedCount++;
        console.log(`✓ Orden ${order._id} migrada`);

      } catch (error) {
        errorCount++;
        console.error(`✗ Error migrando orden ${order._id}:`, error.message);
      }
    }

    console.log(`\n=== Resumen de Migración ===`);
    console.log(`Total de órdenes: ${oldOrders.length}`);
    console.log(`Migradas exitosamente: ${migratedCount}`);
    console.log(`Errores: ${errorCount}`);
    console.log(`===========================\n`);

    await mongoose.disconnect();
    console.log('✓ Desconectado de MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('✗ Error en la migración:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Ejecutar migración
console.log('\n=== Iniciando Migración de Órdenes ===\n');
migrateOrders();
