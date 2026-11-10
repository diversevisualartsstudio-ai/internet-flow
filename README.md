# Internet Flow

**Network Monitoring & Communication Routing Platform**  
Built by **DiverseVisualArtsStudioLLC**.

Internet Flow is a mobile-friendly starter platform for checking public TCP service reachability, measuring connection-establishment latency, and exposing a health endpoint for deployment monitoring.

## Features

- Responsive network monitoring dashboard
- TCP reachability checks for a hostname and port
- DNS resolution and approximate connection latency measurement
- Health endpoint at `GET /api/health`
- JSON connectivity endpoint at `POST /api/check`
- Input validation, bounded timeouts, and basic protection against local/private-network probing
- Node.js 20+, Docker, and GitHub Actions CI

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm test
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## API

### Health

```http
GET /api/health
```

Returns service status, version, and timestamp.

### TCP check

```http
POST /api/check
Content-Type: application/json

{
  "host": "example.com",
  "port": 443,
  "timeoutMs": 5000
}
```

The response includes `reachable`, `status`, `latencyMs`, destination, and check timestamp. A failed TCP connection is returned as an offline result; invalid input returns HTTP 400.

**Important:** TCP reachability is not a full HTTP uptime check, packet-loss test, bandwidth test, or measurement of a visitor's personal internet connection. DNS resolution and TCP handshake time are measured from the server running Internet Flow.

## Docker

```bash
docker build -t internet-flow .
docker run --rm -p 3000:3000 internet-flow
```

## Deploy to IBM Cloud Code Engine

1. Create or select an IBM Cloud account and resource group.
2. Create a Code Engine project in your chosen region.
3. Build and push this repository's container image to IBM Cloud Container Registry (or connect a supported source build).
4. Create a Code Engine application using the image.
5. Set the listening port to `3000` (or pass the platform-provided `PORT`).
6. Configure the application health check to call `/api/health`.
7. Wait for the deployment to become ready, then open the generated application URL and test a public hostname.

Example local image build:

```bash
docker build -t internet-flow:latest .
```

Follow IBM's current Code Engine and Container Registry instructions for authentication, image push, region, and billing. Cloud deployment is not performed automatically by this repository.

## GitHub Actions

The workflow in `.github/workflows/ci.yml` runs the test suite on pushes and pull requests to `main`.

## Security and production notes

- Only public destinations are intended. Local/private IPv4 and IPv6 ranges are rejected after DNS resolution.
- Do not expose this service publicly without authentication, rate limiting, request logging, and abuse monitoring.
- For production use, add persistent monitoring schedules, historical storage, alert delivery, user authentication, and HTTP/TLS application-level probes.
- DNS and routing environments can change; this starter validation is a defense-in-depth measure, not a substitute for a security review.

## Project layout

```text
.
├── .github/workflows/ci.yml
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── src/monitor.js
├── test/monitor.test.js
├── .env.example
├── .gitignore
├── Dockerfile
├── package.json
├── README.md
└── server.js
```

## License

No license has been granted yet. All rights reserved by DiverseVisualArtsStudioLLC unless a separate license is added.
