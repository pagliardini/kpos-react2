const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/proxy',
        createProxyMiddleware({
            target: 'https://pricely.ar',
            changeOrigin: true,
            pathRewrite: {
                '^/proxy': '',
            },
        })
    );
};