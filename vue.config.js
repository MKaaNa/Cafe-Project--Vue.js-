const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      }),
    ],
  },
  devServer: {
    host: '0.0.0.0', // Her yerden erişilebilir olsun
    port: 8080,
    client: {
      webSocketURL: 'ws://localhost:8080/ws' // HMR WebSocket bağlantısı burada tanımlanıyor
    }
  }
});