module.exports = {
  apps: [
    {
      name: 'chart',
      script: './server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        HOST: '0.0.0.0',
        PORT: 5000,
        NODE_ENV: 'production'
      }
    }
  ]
}
