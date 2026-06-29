/**
 * PM2 Ecosystem Configuration for TalentForge ATS
 *
 * This file configures PM2 to run the Next.js production server.
 * PM2 keeps the app running, restarts on crash, and manages logs.
 *
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup  (enable auto-start on boot)
 */
module.exports = {
  apps: [
    {
      name: "talentforge-ats",
      script: "bun",
      args: "run start",
      cwd: "/var/www/talentforge-ats",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Logging
      error_file: "/var/log/talentforge-ats/error.log",
      out_file: "/var/log/talentforge-ats/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      // Restart policy
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 5000,
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};
