module.exports = {
  apps: [
    {
      name: "dash-automation",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/dash-automation",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0",
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
