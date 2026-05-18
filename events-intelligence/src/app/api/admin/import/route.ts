import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import type {
  Continent,
  EventTier,
  GeopoliticalRegion,
  Prisma,
  VerificationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import {
  parseIndustries,
  parseSatCoreProblems,
  scoreFromScalars,
  uniqueSlug,
} from "@/lib/event-parse";

async function requireAdmin() {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

/** CSV columns (header row, case-insensitive). Industries/satCoreProblems as pipe-separated enum keys. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const ct = req.headers.get("content-type") ?? "";
  let text: string;
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Expected file field" }, { status: 400 });
    }
    text = await file.text();
  } else {
    text = await req.text();
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "Empty CSV" }, { status: 400 });
  }

  let rows: Record<string, string>[];
  try {
    rows = parse(text, {
      columns: (header: string[]) => header.map((h) => h.trim().toLowerCase()),
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];
  } catch {
    return NextResponse.json({ error: "CSV parse failed" }, { status: 400 });
  }

  let created = 0;
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      const name = r.name ?? r.event_name ?? "";
      if (!name) throw new Error("name required");

      const geopoliticalRegion = (r.geopoliticalregion ?? r.region ?? "") as GeopoliticalRegion;
      const continent = (r.continent ?? "") as Continent;
      const country = r.country ?? "";
      const city = r.city ?? "";
      const startDate = new Date(r.startdate ?? r.start_date ?? "");
      const endDate = new Date(r.enddate ?? r.end_date ?? "");
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        throw new Error("invalid start/end date");
      }

      const industries = parseIndustries(
        (r.industries ?? "")
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean),
      );
      const satCoreProblems = parseSatCoreProblems(
        (r.satcoreproblems ?? r.sat_core_problems ?? r.sat ?? "")
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean),
      );

      const slugBase = (r.slug ?? name).trim();

      const row = {
        name,
        parentEventBrand: r.parenteventbrand || r.parent_brand || undefined,
        eventCategory: r.eventcategory || undefined,
        geopoliticalRegion,
        continent,
        country,
        city,
        venue: r.venue || undefined,
        startDate,
        endDate,
        eventAgeYears: r.eventageyears ? Number(r.eventageyears) : undefined,
        yearsRunning: r.yearsrunning ? Number(r.yearsrunning) : undefined,
        estimatedAttendees: r.estimatedattendees ? Number(r.estimatedattendees) : undefined,
        estimatedExhibitors: r.estimatedexhibitors ? Number(r.estimatedexhibitors) : undefined,
        estimatedSpeakers: r.estimatedspeakers ? Number(r.estimatedspeakers) : undefined,
        governmentAttendance: r.governmentattendance === "true" || r.governmentattendance === "1",
        carrierAttendance: r.carrierattendance === "true" || r.carrierattendance === "1",
        bankingFintechAttendance:
          r.bankingfintechattendance === "true" || r.bankingfintechattendance === "1",
        developerAttendance: r.developerattendance === "true" || r.developerattendance === "1",
        cybersecurityRelevance: Number(r.cybersecurityrelevance ?? 0),
        identityRelevance: Number(r.identityrelevance ?? 0),
        telecomRelevance: Number(r.telecomrelevance ?? 0),
        aiRelevance: Number(r.airelevance ?? 0),
        appSecurityRelevance: Number(r.appsecurityrelevance ?? 0),
        governmentRelevance: Number(r.governmentrelevance ?? 0),
        bankingRelevance: Number(r.bankingrelevance ?? 0),
        recommendedAction: r.recommendedaction || undefined,
        targetMeetingType: r.targetmeetingtype || undefined,
        primaryBuyerPersona: r.primarybuyerpersona || undefined,
        secondaryBuyerPersona: r.secondarybuyerpersona || undefined,
        summary: r.summary || undefined,
        whyItMatters: r.whyitmatters || undefined,
        whoAttends: r.whoattends || undefined,
        problemKeyraSolves: r.problemkeyrasolves || undefined,
        satCoreAlignment: r.satcorealignment || undefined,
        targetMeetingList: r.targetmeetinglist || undefined,
        eventWebsite: r.eventwebsite || undefined,
        sourceUrl: r.sourceurl || undefined,
        verificationStatus: (r.verificationstatus || "UNVERIFIED") as VerificationStatus,
        tier: (r.tier || "TIER_3") as EventTier,
        approvedPublic: r.approvedpublic === "true" || r.approvedpublic === "1",
        featured: r.featured === "true" || r.featured === "1",
        keyraOwner: r.keyraowner || undefined,
      };

      const slug = await prisma.$transaction(async (tx) => uniqueSlug(tx, slugBase));
      const keyraPriorityScore = scoreFromScalars({ ...row, slug } as Prisma.EventUncheckedCreateInput);

      await prisma.event.create({
        data: {
          ...row,
          slug,
          keyraPriorityScore,
          industries: {
            create: industries.map((industry) => ({ industry })),
          },
          satCoreProblems: {
            create: satCoreProblems.map((problem) => ({ problem })),
          },
        },
      });
      created++;
    } catch (e) {
      errors.push({ row: i + 2, message: e instanceof Error ? e.message : "error" });
    }
  }

  return NextResponse.json({ created, errors });
}
