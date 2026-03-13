/**
 * Executive Identity — Zod schemas for the personality/soul layer.
 *
 * An ExecutiveIdentityProfile is the persistent, evolving "who this executive is"
 * — their voice, values, decision style, behavioral traits, framework affinities,
 * and relationship patterns with other executives. It sits between the static
 * BaseExecutive class (name/role/expertise) and the runtime Hand manifest
 * (system_prompt/model/tools). The identity profile feeds into manifest generation
 * so each executive's cloud sandbox persona reflects their personality.
 *
 * Team-level identity is in ./team.ts.
 */

import { z } from "zod";
import { ExpertiseLevelSchema, DecisionConfidenceSchema } from "./executive.js";
import { ConflictResolutionMethodSchema } from "./consensus.js";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Communication style spectrum. */
export const CommunicationStyleSchema = z.enum([
  "ANALYTICAL",     // Data-first, precise language, evidence-heavy
  "DIRECTIVE",      // Clear, decisive, action-oriented
  "COLLABORATIVE",  // Inclusive, consensus-seeking, relational
  "VISIONARY",      // Big-picture, inspirational, future-oriented
  "PRAGMATIC",      // Practical, implementation-focused, trade-off aware
]);
export type CommunicationStyle = z.infer<typeof CommunicationStyleSchema>;

/** How an executive approaches risk in their reasoning. */
export const RiskDispositionSchema = z.enum([
  "RISK_AVERSE",      // Prefers certainty, high burden of proof for action
  "RISK_CAUTIOUS",    // Weighs downsides heavily but open to calculated bets
  "RISK_BALANCED",    // Neutral — evaluates upside and downside equally
  "RISK_TOLERANT",    // Comfortable with uncertainty if upside is clear
  "RISK_SEEKING",     // Actively seeks high-variance opportunities
]);
export type RiskDisposition = z.infer<typeof RiskDispositionSchema>;

/** Time horizon an executive naturally gravitates toward. */
export const TimeHorizonBiasSchema = z.enum([
  "IMMEDIATE",   // Days to weeks — crisis / ops focus
  "SHORT_TERM",  // Weeks to months — tactical execution
  "MEDIUM_TERM", // Months to a year — program-level
  "LONG_TERM",   // 1-3 years — strategic planning
  "VISIONARY",   // 3-10+ years — transformational
]);
export type TimeHorizonBias = z.infer<typeof TimeHorizonBiasSchema>;

/** How strongly one executive relates to another. */
export const RelationshipAffinitySchema = z.enum([
  "STRONG_ALLY",     // Deep trust, frequent agreement, amplifies each other
  "ALLY",            // Generally aligned, constructive collaboration
  "NEUTRAL",         // No strong relationship pattern
  "CHALLENGER",      // Productive tension, often disagrees constructively
  "STRONG_CHALLENGER", // Frequent substantive disagreement, different worldviews
]);
export type RelationshipAffinity = z.infer<typeof RelationshipAffinitySchema>;

// ---------------------------------------------------------------------------
// Soul — the innermost identity layer
// ---------------------------------------------------------------------------

/** Core values and principles that guide this executive's reasoning. */
export const ExecutiveSoulSchema = z.object({
  /** One-line purpose statement — why this executive exists on the team. */
  mission: z.string().min(1),

  /** 3-7 core values ordered by priority (first = most important). */
  coreValues: z.array(z.string()).min(1).max(7),

  /** Principles this executive will not violate regardless of context. */
  redLines: z.array(z.string()).default([]),

  /** What this executive believes about the world / their domain. */
  worldview: z.string().optional(),
});
export type ExecutiveSoul = z.infer<typeof ExecutiveSoulSchema>;

// ---------------------------------------------------------------------------
// Voice — how the executive communicates
// ---------------------------------------------------------------------------

/** The executive's communication persona. */
export const ExecutiveVoiceSchema = z.object({
  /** Primary communication style. */
  style: CommunicationStyleSchema,

  /** Tone descriptors (e.g. "measured", "confident", "empathetic"). */
  toneDescriptors: z.array(z.string()).min(1).max(5),

  /** Sentence patterns or phrases this executive tends to use. */
  signaturePhrases: z.array(z.string()).default([]),

  /** How verbose this executive is (0 = terse, 1 = expansive). */
  verbosity: z.number().min(0).max(1).default(0.5),

  /**
   * How often this executive initiates challenges vs waits to be asked
   * (0 = only when asked, 1 = proactively challenges everything).
   */
  assertiveness: z.number().min(0).max(1).default(0.5),
});
export type ExecutiveVoice = z.infer<typeof ExecutiveVoiceSchema>;

// ---------------------------------------------------------------------------
// Decision Style — how the executive reasons
// ---------------------------------------------------------------------------

/** Behavioral traits that shape analysis and recommendations. */
export const DecisionStyleSchema = z.object({
  /** Risk disposition — how this executive weights uncertainty. */
  riskDisposition: RiskDispositionSchema,

  /** Natural time horizon — where this executive's thinking gravitates. */
  timeHorizonBias: TimeHorizonBiasSchema,

  /**
   * Evidence threshold — how much evidence this executive needs before
   * committing to a position (0 = intuition-driven, 1 = demands exhaustive proof).
   */
  evidenceThreshold: z.number().min(0).max(1).default(0.6),

  /**
   * Consensus orientation — how much this executive values agreement
   * vs independence of thought (0 = fully independent, 1 = strongly consensus-seeking).
   */
  consensusOrientation: z.number().min(0).max(1).default(0.5),

  /** Decision frameworks this executive favours, ordered by preference. */
  frameworkAffinities: z.array(z.string()).default([]),

  /** Cognitive biases this executive is prone to (for self-correction). */
  knownBiases: z.array(z.string()).default([]),
});
export type DecisionStyle = z.infer<typeof DecisionStyleSchema>;

// ---------------------------------------------------------------------------
// Skill Profile — domain-specific capabilities
// ---------------------------------------------------------------------------

/** A single domain skill with expertise level and context. */
export const DomainSkillSchema = z.object({
  domain: z.string(),
  level: ExpertiseLevelSchema,
  /** Specific sub-areas of strength within this domain. */
  specializations: z.array(z.string()).default([]),
});
export type DomainSkill = z.infer<typeof DomainSkillSchema>;

/** Complete skill profile for an executive. */
export const SkillProfileSchema = z.object({
  /** Primary domain skills. */
  domains: z.array(DomainSkillSchema).min(1),

  /** Industries this executive has deep context for. */
  industryExperience: z.array(z.string()).default([]),

  /** Methodologies this executive is trained in. */
  methodologies: z.array(z.string()).default([]),
});
export type SkillProfile = z.infer<typeof SkillProfileSchema>;

// ---------------------------------------------------------------------------
// Relationship Profile — how this executive relates to others
// ---------------------------------------------------------------------------

/** A relationship entry with another executive. */
export const ExecutiveRelationshipSchema = z.object({
  /** Name of the other executive. */
  executiveName: z.string(),

  /** Current affinity level. */
  affinity: RelationshipAffinitySchema,

  /** Domains where they tend to agree. */
  alignmentDomains: z.array(z.string()).default([]),

  /** Domains where they tend to disagree. */
  tensionDomains: z.array(z.string()).default([]),

  /** Preferred conflict resolution when disagreeing with this peer. */
  preferredResolution: ConflictResolutionMethodSchema.optional(),

  /**
   * Historical agreement rate (0-1), updated by the learning loop.
   * Null if no decision history exists yet.
   */
  historicalAgreementRate: z.number().min(0).max(1).nullable().default(null),
});
export type ExecutiveRelationship = z.infer<typeof ExecutiveRelationshipSchema>;

// ---------------------------------------------------------------------------
// Full Identity Profile
// ---------------------------------------------------------------------------

/**
 * The complete identity profile for an executive agent.
 *
 * This is the "soul file" — it defines who the executive IS, not just
 * what they DO (which is the BaseExecutive class concern).
 *
 * Identity profiles are:
 * - Persisted as `.identity.toml` files (snake_case keys)
 * - Loaded and validated against this schema (camelCase)
 * - Versioned — each decision records which identity version was active
 * - Evolved by the learning loop based on decision outcomes
 */
export const ExecutiveIdentityProfileSchema = z.object({
  /** Schema version for forward compatibility. */
  version: z.string().default("1.0.0"),

  /** Must match BaseExecutive.name exactly. */
  executiveName: z.string().min(1),

  /** Display title (e.g. "Chief Strategy Officer"). */
  title: z.string().min(1),

  /** Soul — mission, values, red lines. */
  soul: ExecutiveSoulSchema,

  /** Voice — communication style and persona. */
  voice: ExecutiveVoiceSchema,

  /** Decision style — reasoning patterns and biases. */
  decisionStyle: DecisionStyleSchema,

  /** Skill profile — domain capabilities. */
  skills: SkillProfileSchema,

  /** Relationships with other executives (keyed by executive name in TOML). */
  relationships: z.array(ExecutiveRelationshipSchema).default([]),

  /** ISO datetime of last identity update. */
  lastUpdated: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),

  /** Free-form metadata (tenant context, org-specific overrides, etc). */
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export type ExecutiveIdentityProfile = z.infer<typeof ExecutiveIdentityProfileSchema>;

// ---------------------------------------------------------------------------
// Identity Version Record (for audit trail)
// ---------------------------------------------------------------------------

/**
 * Snapshot reference linking a decision to the identity version used.
 * Stored alongside DecisionOutcome to enable audit trail reconstruction.
 */
export const IdentityVersionRecordSchema = z.object({
  executiveName: z.string(),
  identityVersion: z.string(),
  identityHash: z.string().describe("SHA-256 of the serialized identity at decision time"),
  timestamp: z.string().datetime(),
});
export type IdentityVersionRecord = z.infer<typeof IdentityVersionRecordSchema>;
