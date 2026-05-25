/** Short one-line delete prompts for admin confirm dialogs. */

export function deleteTelcoMessage(name: string): string {
  return `Delete "${name}"?`;
}

export function deleteRegionMessage(name: string): string {
  return `Delete region "${name}"?`;
}

export function deleteCountryMessage(name: string): string {
  return `Delete country "${name}"?`;
}

export function deleteAdminUserMessage(name: string): string {
  return `Remove "${name}" from admin users?`;
}

export function deleteServerNodeMessage(label: string): string {
  return `Delete server "${label}"?`;
}

export function deleteAccessDomainRuleMessage(domain: string): string {
  return `Delete rule for "${domain}"?`;
}

export function deleteDeploymentAppMessage(label: string): string {
  return `Delete app "${label}"?`;
}

export function deleteAdminMaterialMessage(title: string): string {
  return `Delete material "${title}"?`;
}

export function deleteAdminDataRoomMessage(title: string): string {
  return `Delete document "${title}"?`;
}

/** Confirm closing the inline upload form while a file is still uploading. */
export function closeUploadFormWhileUploadingMessage(): string {
  return "Close upload form while uploading?";
}

/** Confirm leaving the edit page (back or cancel) while a file is still uploading. */
export function leaveMaterialsWhileUploadingMessage(): string {
  return "Leave materials while uploading?";
}

export function leaveDataRoomsWhileUploadingMessage(): string {
  return "Leave data rooms while uploading?";
}

export function deleteAppCategoryMessage(name: string): string {
  return `Delete category "${name}"?`;
}

export function deleteAppCategoryWithReassignMessage(from: string, to: string): string {
  return `Move apps to "${to}" and delete "${from}"?`;
}

export function deleteAuthenticationCountriesMessage(count: number, name?: string): string {
  if (count === 1 && name) return `Delete "${name}"?`;
  return `Delete ${count} selected countries?`;
}

export function deleteAuthenticationProtocolsMessage(count: number, name?: string): string {
  if (count === 1 && name) return `Delete "${name}"?`;
  return `Delete ${count} selected protocols?`;
}

export function deleteAuthenticationProtocolMessage(name: string): string {
  return `Delete "${name}"?`;
}
