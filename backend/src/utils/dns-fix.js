// dns-fix.js - Configuración DNS para Node.js en Windows
import dns from 'dns';

// Forzar uso de DNS nativo del sistema en lugar del c-ares de Node
dns.setDefaultResultOrder('verbatim');

// Configurar servidores DNS confiables (Google DNS)
dns.setServers([
    '8.8.8.8',
    '8.8.4.4',
    '1.1.1.1',
    '1.0.0.1'
]);

console.log('✅ Configuración DNS aplicada');
console.log('📡 Servidores DNS:', dns.getServers());

export default dns;
