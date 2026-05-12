/**
 * Lightweight SVG paths for macro map regions (stylized, not cartographic).
 * `mapKey` values align with `Region.mapKey` in the deployment registry.
 */
export const WORLD_REGION_PATHS: Record<
  string,
  { label: string; d: string; centroid: { x: number; y: number } }
> = {
  AMERICAS: {
    label: "Americas",
    centroid: { x: 210, y: 260 },
    d: "M120,120 C90,200 110,360 200,400 C260,420 320,380 340,300 C360,220 300,140 220,120 C170,110 140,115 120,120 Z",
  },
  EUROPE: {
    label: "Europe",
    centroid: { x: 480, y: 170 },
    d: "M430,90 C400,120 410,200 460,220 C520,230 560,200 570,150 C575,110 520,80 470,85 C450,86 440,88 430,90 Z",
  },
  MENA: {
    label: "Middle East & North Africa",
    centroid: { x: 560, y: 240 },
    d: "M500,180 C480,220 500,300 560,320 C620,310 640,240 610,190 C590,170 520,165 500,180 Z",
  },
  ASIA_PACIFIC: {
    label: "Asia–Pacific",
    centroid: { x: 720, y: 220 },
    d: "M620,120 C600,200 640,320 760,340 C860,330 900,220 820,140 C760,100 660,95 620,120 Z",
  },
  AFRICA: {
    label: "Africa",
    centroid: { x: 520, y: 360 },
    d: "M460,260 C430,320 450,430 540,450 C640,440 660,330 620,260 C590,220 500,220 460,260 Z",
  },
};

export const WORLD_MAP_VIEWBOX = "0 0 960 480";
