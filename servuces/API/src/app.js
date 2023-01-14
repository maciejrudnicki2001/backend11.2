const express = require('express');
const Prometheus = require('prom-client');
const app = express();
const port = 3001;
const collectDefaultMetrics = Prometheus.collectDefaultMetrics;
collectDefaultMetrics({timeout: 5000});
const counter = new Prometheus.Counter({
  name: 'myapp_requests_total',
  help: 'Total number of requests',
  labelNames: ['method', 'route', 'code']
})
const histogram = new Prometheus.Histogram({
  name: 'myapp_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 500]
})

app.use((req, res, next) => {
  const end = histogram.startTimer();
  res.on('finish', () => {
    counter.inc({
      method: req.method,
      route: req.route.path,
      code: res.statusCode
    });
    end({
      method: req.method,
      route: req.route.path,
      code: res.statusCode
    })
  });
  next();
});

app.get('/', (req, res) => {
  setTimeout(() => {
    counter.inc({method: req.method, route: req.path, code: res.statusCode});
    res.send('Hello World!')
  }, 1000);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})