import type { ComponentType } from 'react';
import type { ArtifactType } from '../project-data';
import { ReconcileFlowArtifact } from './artifacts/reconcileflow-artifact';
import { AeternisArtifact } from './artifacts/aeternis-artifact';
import { WorkshopArtifact } from './artifacts/workshop-artifact';
import { ChaosSqlArtifact } from './artifacts/chaossql-artifact';
const PROJECT_ARTIFACTS: Record<ArtifactType, ComponentType> = {
  reconciliation: ReconcileFlowArtifact,
  'merkle-proof': AeternisArtifact,
  'service-order': WorkshopArtifact,
  'concurrency-trace': ChaosSqlArtifact,
};
export function ProjectArtifact({ type }: { type: ArtifactType }) {
  const Artifact = PROJECT_ARTIFACTS[type];
  return <Artifact />;
}
