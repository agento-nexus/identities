/**
 * Team Identity — Zod schemas for branded executive teams.
 *
 * A team is an emergent entity: a named group of executives with a shared
 * brand voice, governance overrides, and collaboration patterns that evolve
 * from decision history. Teams are NOT just "a list of members" — they have
 * their own personality that shapes how the group deliberates.
 *
 * Teams are defined in `.team.toml` files (snake_case) and validated here (camelCase).
 */

import { z } from "zod";
import { ConflictResolutionMethodSchema } from "./consensus.js";

// ---------------------------------------------------------------------------
// Team Governance Overrides
// ---------------------------------------------------------------------------

/**
 * Team-level governance settings that override individual executive defaults.
 * These take precedence over ExecutiveTeamConfig when the team is active.
 */
export const TeamGovernanceSchema = z.object({
  /** Minimum consensus threshold for this team (overrides orchestrator default). */
  consensusThreshold: z.number().min(0).max(1).optional(),

  /** Default conflict resolution method for this team. */
  defaultResolutionMethod: ConflictResolutionMethodSchema.optional(),

  /** Domains that require unanimous agreement (no majority override). */
  unanimityRequiredDomains: z.array(z.string()).default([]),

  /** Whether any team member can escalate to human without consensus. */
  individualEscalationAllowed: z.boolean().default(true),

  /** Maximum rounds of deliberation before forcing a decision. */
  maxDeliberationRounds: z.number().int().min(1).default(3),
});
export type TeamGovernance = z.infer<typeof TeamGovernanceSchema>;

// ---------------------------------------------------------------------------
// Team Brand Voice
// ---------------------------------------------------------------------------

/**
 * The team's collective communication persona.
 * Applied to consensus outputs and team-level reports.
 */
export const TeamBrandVoiceSchema = z.object({
  /** How the team presents itself (e.g. "Executive Advisory Council"). */
  displayName: z.string().min(1),

  /** Tone of team-level outputs (e.g. "authoritative yet approachable"). */
  toneDescription: z.string().optional(),

  /** Opening framing for team recommendations. */
  reportPreamble: z.string().optional(),

  /** Closing framing for team recommendations. */
  reportClosing: z.string().optional(),
});
export type TeamBrandVoice = z.infer<typeof TeamBrandVoiceSchema>;

// ---------------------------------------------------------------------------
// Collaboration Pattern (learned from decision history)
// ---------------------------------------------------------------------------

/**
 * An observed collaboration pattern between team members.
 * These are discovered and updated by the learning loop.
 */
export const CollaborationPatternSchema = z.object({
  /** Descriptive label (e.g. "strategy-risk tension on market expansion"). */
  label: z.string(),

  /** Executive names involved. */
  participants: z.array(z.string()).min(2),

  /** What typically happens (e.g. "Strategy proposes, Risk challenges scope"). */
  description: z.string(),

  /** How frequently this pattern appears (0-1). */
  frequency: z.number().min(0).max(1),

  /** Whether this pattern is productive or needs intervention. */
  sentiment: z.enum(["productive", "neutral", "counterproductive"]),

  /** Number of decisions where this pattern was observed. */
  observationCount: z.number().int().nonnegative().default(0),
});
export type CollaborationPattern = z.infer<typeof CollaborationPatternSchema>;

// ---------------------------------------------------------------------------
// Team Member Reference
// ---------------------------------------------------------------------------

/** Reference to a team member with their role within this team. */
export const TeamMemberRefSchema = z.object({
  /** Must match an ExecutiveIdentityProfile.executiveName. */
  executiveName: z.string(),

  /** Role within this team (may differ from their global title). */
  teamRole: z.string().optional(),

  /** Weight of this member's vote in team decisions (0-1). */
  votingWeight: z.number().min(0).max(1).default(1.0),
});
export type TeamMemberRef = z.infer<typeof TeamMemberRefSchema>;

// ---------------------------------------------------------------------------
// Full Team Identity
// ---------------------------------------------------------------------------

/**
 * The complete identity for a branded executive team.
 *
 * A team is more than its members — it has its own voice, governance rules,
 * and learned collaboration patterns. Teams evolve as the learning loop
 * processes decision outcomes and updates patterns.
 */
export const TeamIdentitySchema = z.object({
  /** Schema version. */
  version: z.string().default("1.0.0"),

  /** Unique team identifier (kebab-case). */
  teamId: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Must be kebab-case"),

  /** Brand voice — how this team presents itself. */
  brandVoice: TeamBrandVoiceSchema,

  /** Team members with their team-specific roles. */
  members: z.array(TeamMemberRefSchema).min(1),

  /** Governance overrides for this team. */
  governance: TeamGovernanceSchema.default({}),

  /** Learned collaboration patterns (populated by learning loop). */
  collaborationPatterns: z.array(CollaborationPatternSchema).default([]),

  /** Domains this team is responsible for (used for routing decisions). */
  responsibleDomains: z.array(z.string()).default([]),

  /** ISO datetime of last update. */
  lastUpdated: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),

  /** Free-form metadata. */
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export type TeamIdentity = z.infer<typeof TeamIdentitySchema>;
