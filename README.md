# Bregalda

Bregalda is an independent software studio founded by Ricardo Bregalda.
It builds thoughtful tools for real technical problems.

This repository contains the new Bregalda portfolio and product showcase. The
experience is currently being redesigned around cinematic project storytelling,
responsive motion, and the visual identity supplied in `public/brand/`.

## Selected work

- [ReconcileFlow](https://github.com/bregaldahq/reconcileflow) — explainable,
  deterministic data reconciliation.
- [Aeternis Log](https://github.com/bregaldahq/aeternis-log) — cryptographic
  integrity proofs backed by Merkle trees and Hyperledger Fabric.
- [Workshop Management API](https://github.com/bregaldahq/oficina-mecanica-tech-challenge)
  — a cloud-native backend built with DDD and Clean Architecture.
- [CFG Analyzer](https://github.com/bregaldahq/cfg_analyzer) — three-address code
  analysis and control-flow graph generation.

## Development

Requirements: Node.js `22.13.0` or newer and npm.

```bash
npm ci
npm run dev
```

Quality gates:

```bash
npm run check
npm run build
```

## Delivery

The application uses React, TypeScript, Vinext, Tailwind CSS, and the existing
Cloudflare/Sites delivery configuration.

## License

Released under the [MIT License](LICENSE).
