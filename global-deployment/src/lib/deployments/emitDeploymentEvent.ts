/**
 * Future hook for Kafka / NATS / Rust consumers when the distributed platform
 * is wired. Keep payloads small and versioned.
 */
export type DeploymentEventName = "deployment.status_changed" | "deployment.published";

export type DeploymentEventPayload = {
  name: DeploymentEventName;
  occurredAt: string;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
};

export function emitDeploymentEvent(event: DeploymentEventPayload): void {
  if (process.env.NODE_ENV === "development") {
    console.info("[deployments:event]", event.name, event.entityType, event.entityId);
  }
  // TODO: publish to Kafka/NATS when infrastructure is available.
}
