module.exports = {
  apps: [
    {
      name: 'syscom-gaza-backend',
      script: './index.js',
      instances: 'max', // Utiliza todos los núcleos de CPU disponibles (Cluster Mode)
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      autorestart: true, // Se reinicia automáticamente si falla
      watch: false, // En producción no se debe "observar" archivos
      max_memory_restart: '1G' // Se reinicia si usa más de 1GB de RAM
    }
  ]
};
