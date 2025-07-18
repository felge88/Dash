module.exports = {
  apps: [
    {
      name: "dash-automation",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/home/deploy/blaster",
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
      error_file: "/var/log/pm2/dash-automation-error.log",
      out_file: "/var/log/pm2/dash-automation-out.log",
      log_file: "/var/log/pm2/dash-automation.log",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
