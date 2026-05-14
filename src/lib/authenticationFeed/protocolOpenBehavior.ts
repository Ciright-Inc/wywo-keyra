/** Pure logic for SAT protocol click routing (admin flags). */

export type ProtocolPublicDetail = {
  allowProtocolLink: boolean;
  protocolUrlEnabled: boolean;
  protocolUrl: string | null;
};

export function protocolOpenAction(d: ProtocolPublicDetail): "external" | "modal" {
  const url = d.protocolUrl?.trim() ?? "";
  if (d.allowProtocolLink && d.protocolUrlEnabled && url.length > 0) return "external";
  return "modal";
}
