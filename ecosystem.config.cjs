module.exports = {
  apps : [{
    name   : "obda",
    script : "./srv.js",
    watch: true,
    // watch_delay: 1000,
    ignore_watch : ["node_modules","data",".git"],
    max_restarts: 5,
    autorestart: false,
    env: {
      APP_NAME: "obda",
      NODE_ENV: "development",
      PORT: 6661,
      // HTTPS_PROXY: "http://127.0.0.1:10066",
    },
    env_prd: {
      NODE_ENV: 'production',
      PORT: 6662
    },
    log_date_format: "YYMMDD HH:mm"
  }]
}
