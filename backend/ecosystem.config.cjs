module.exports = {
  apps: [
    {
      name: 'syscom-gaza-backend',
      script: './server.js',
      instances: 1, // En AWS Free Tier (1 vCPU) usamos 1 instancia
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
      max_memory_restart: '400M' // Reinicia si usa más de 400MB para no colapsar la t2.micro (1GB RAM)
    }
  ]
};
