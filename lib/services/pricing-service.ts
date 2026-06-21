import "server-only";

import { pricingRepository } from "@/lib/repositories/pricing-repository";
import { dayOfWeek, overlaps } from "@/lib/utils/dates";
import type { PricingRule } from "@/types/domain";

function dayBucket(date: string) {
  const day = dayOfWeek(date);
  if (day === "saturday" || day === "sunday") return "weekend";
  return "weekday";
}

function matchingRule(rule: PricingRule, courtId: string, date: string, startTime: string, endTime: string) {
  const bucket = dayBucket(date);
  const exactDay = dayOfWeek(date);
  const courtMatches = rule.courtId === courtId || rule.courtId === "all";
  const dayMatches = rule.dayOfWeek === bucket || rule.dayOfWeek === exactDay || rule.dayOfWeek === "all";
  const timeMatches = overlaps(startTime, endTime, rule.startWindow, rule.endWindow);
  return courtMatches && dayMatches && timeMatches;
}

export async function calculateBookingPrice(input: { courtId: string; date: string; startTime: string; endTime: string; durationMins: number }) {
  const rules = await pricingRepository.findByCourt(input.courtId);
  const matches = rules.filter((rule) => matchingRule(rule, input.courtId, input.date, input.startTime, input.endTime));
  const selected = matches.sort((a, b) => Number(b.isPeak) - Number(a.isPeak) || b.hourlyRate - a.hourlyRate)[0];
  const hourlyRate = selected?.hourlyRate ?? 1800;
  const price = Math.round((hourlyRate * input.durationMins) / 60);
  return {
    computedPrice: price,
    hourlyRate,
    appliedRuleIds: selected ? [selected.id] : [],
    isManualOverrideAllowed: true
  };
}
