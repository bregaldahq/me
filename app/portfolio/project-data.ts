export const PROJECT_IDS = [
  'reconcileflow',
  'aeternis-log',
  'workshop-api',
  'chaossql',
] as const;
export type ProjectId = (typeof PROJECT_IDS)[number];
export type ArtifactType =
  | 'reconciliation'
  | 'merkle-proof'
  | 'service-order'
  | 'concurrency-trace';
export interface ProjectEvidence {
  readonly label: string;
  readonly value: string;
}
export interface PlanetTheme {
  readonly base: '#4B2E83' | '#2A2140';
  readonly signal: '#F5C400' | '#22C55E';
  readonly radius: number;
  readonly orbitRadius: number;
  readonly orbitOffset: number;
  readonly seed: number;
}
export interface PortfolioProject {
  readonly id: ProjectId;
  readonly sequence: string;
  readonly name: string;
  readonly navLabel: string;
  readonly headline: string;
  readonly summary: string;
  readonly repository: `https://github.com/${string}`;
  readonly artifact: ArtifactType;
  readonly technologies: readonly string[];
  readonly evidence: readonly ProjectEvidence[];
  readonly disclosure?: string;
  readonly limitation?: string;
  readonly planet: PlanetTheme;
}
export const PROJECTS: readonly PortfolioProject[] = [
  {
    id: 'reconcileflow',
    sequence: '01',
    name: 'ReconcileFlow',
    navLabel: 'ReconcileFlow',
    headline: 'Logic you can inspect.',
    summary:
      'Two financial sources. One traceable decision. Deterministic reconciliation that keeps the rule, its version, and the evidence behind every match.',
    repository: 'https://github.com/bregaldahq/reconcileflow',
    artifact: 'reconciliation',
    technologies: [
      'Python 3.12',
      'FastAPI',
      'PostgreSQL 17',
      'Redis 8',
      'Celery',
      'React 19',
      'TypeScript',
      'Hypothesis',
    ],
    evidence: [
      { label: 'Matching', value: 'Exact, tolerance, and bounded split rules' },
      {
        label: 'Audit',
        value: 'Append-only decisions, human reviews, and XLSX exports',
      },
      {
        label: 'Repository snapshot',
        value:
          '84 backend tests · 10 frontend tests · 2 browser scenarios · 86.42% backend coverage',
      },
    ],
    disclosure:
      'Quality figures are a repository snapshot, not live telemetry.',
    planet: {
      base: '#4B2E83',
      signal: '#F5C400',
      radius: 1.08,
      orbitRadius: 4.6,
      orbitOffset: 0,
      seed: 11,
    },
  },
  {
    id: 'aeternis-log',
    sequence: '02',
    name: 'Aeternis Log',
    navLabel: 'Aeternis Log',
    headline: 'Proof that outlives the data.',
    summary:
      'Keep records queryable. Make their integrity verifiable. MongoDB records become Merkle roots, anchored on Hyperledger Fabric for independent checks.',
    repository: 'https://github.com/bregaldahq/aeternis-log',
    artifact: 'merkle-proof',
    technologies: [
      'Go',
      'Gin',
      'MongoDB',
      'Redis (optional)',
      'Hyperledger Fabric',
      'Raft',
      'Go chaincode',
      'Go and Python SDKs',
    ],
    evidence: [
      { label: 'Integrity', value: 'Domain-separated SHA-256 Merkle proofs' },
      {
        label: 'Verification',
        value: 'Recompute off-chain data against the immutable anchor',
      },
      {
        label: 'Delivery',
        value: 'REST API, signed webhooks, Go and Python SDKs',
      },
    ],
    disclosure:
      'Proof values are a representative demonstration, not a live blockchain connection.',
    planet: {
      base: '#2A2140',
      signal: '#22C55E',
      radius: 0.96,
      orbitRadius: 5.2,
      orbitOffset: 1.6,
      seed: 23,
    },
  },
  {
    id: 'workshop-api',
    sequence: '03',
    name: 'Workshop Management API',
    navLabel: 'Workshop API',
    headline: 'A business, modeled end to end.',
    summary:
      'From the first diagnosis to the final delivery. A service-order lifecycle built around explicit domain rules, with infrastructure kept at the edges.',
    repository: 'https://github.com/bregaldahq/oficina-mecanica-tech-challenge',
    artifact: 'service-order',
    technologies: [
      'PHP 8.2',
      'DDD',
      'Clean Architecture',
      'MySQL 8',
      'JWT HS256',
      'PHPUnit 11',
      'PHPStan level 8',
      'OpenAPI 3',
      'Docker',
      'Nginx',
      'Kubernetes',
      'Terraform',
      'GitHub Actions',
    ],
    evidence: [
      { label: 'Domain', value: 'Named state transitions and domain events' },
      {
        label: 'Reliability',
        value: 'Atomic service-order and inventory persistence',
      },
      {
        label: 'Delivery',
        value: 'Containers, autoscaling, infrastructure as code, and CI/CD',
      },
    ],
    planet: {
      base: '#4B2E83',
      signal: '#F5C400',
      radius: 1.18,
      orbitRadius: 5.8,
      orbitOffset: 3.15,
      seed: 37,
    },
  },
  {
    id: 'chaossql',
    sequence: '04',
    name: 'ChaosSQL',
    navLabel: 'ChaosSQL',
    headline: 'Turn chaos into a test.',
    summary:
      'Stress SQL workloads, check invariants, and shrink failing execution traces into focused reproductions. Concurrency bugs become evidence you can inspect.',
    repository: 'https://github.com/bregaldahq/chaossql',
    artifact: 'concurrency-trace',
    technologies: [
      'Go 1.25',
      'SQLite',
      'PostgreSQL',
      'MySQL',
      'Seeded scheduling',
      'Causal delta debugging',
      'Go testing SDK',
      'GitHub Actions',
    ],
    evidence: [
      {
        label: 'Detection',
        value: 'Concurrent workloads, SQL invariants, and isolation anomalies',
      },
      {
        label: 'Reduction',
        value:
          'Causal delta debugging narrows failing traces to focused reproductions',
      },
      {
        label: 'Delivery',
        value:
          'Go testing SDK, standalone reproduction tests, HTML reports, and JUnit exports',
      },
    ],
    disclosure:
      'The lost-update illustration is synthetic, based on the repository’s banking scenario. No live database is connected.',
    limitation:
      'Scenario outcomes depend on the database engine and isolation level.',
    planet: {
      base: '#2A2140',
      signal: '#22C55E',
      radius: 0.9,
      orbitRadius: 4.9,
      orbitOffset: 4.7,
      seed: 47,
    },
  },
];
