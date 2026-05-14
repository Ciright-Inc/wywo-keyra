/** Home + roaming percentages shown in feed must sum to 100. */
export function validateHomeRoaming(home: number, roam: number): string | null {
  const t = home + roam;
  if (Math.abs(t - 100) > 0.1) {
    return "Home percentage + roaming percentage must equal 100.";
  }
  return null;
}
