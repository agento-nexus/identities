/**
 * Orchestrator Schemas
 *
 * Zod schemas and inferred types for the executive team orchestrator:
 * decision requests, team member records, configuration, and outcomes.
 */

import { z } from "zod";
import { ComplexityLevelSchema, UncertaintyTypeSchema } from "./framework.js";
import { ExecutiveRecommendationSchema } from "./executive.js";
import { ConsensusOutcomeSchema } from "./consensus.js";

// ---------------------------------------------------------------------------
// Decision Request
// ---------------------------------------------------------------------------

/**
 * A request for the executive team to deliberate on a decision.
 *
 * Captures the query, surrounding context, constraints, domain requirements,
 * and urgency/importance ratings that drive executive selection and framework
 * choice.
 */
export const DecisionRequestSchema = z.object({
  /** Unique identifier for this decision (auto-generated if omitted). */
  decisionId: z
    .string()
    .uuid()
    .default(() => crypto.randomUUID()),

  /** The decision query or question to deliberate on. */
  query: z.string().min(1, "Query must not be empty"),

  /** Relevant context information for the decision. */
  context: z.record(z.string(), z.unknown()),

  /** Hard constraints bounding the decision space. */
  constraints: z.array(z.string()).default([]),

  /** Domain expertise areas that must participate in this decision. */
  requiredDomains: z.array(z.string()).default([]),

  /** Urgency level (1 = routine, 5 = crisis). */
  urgency: z.number().int().min(1).max(5).default(1),

  /** Importance level (1 = low impact, 5 = existential). */
  importance: z.number().int().min(1).max(5).default(1),

  /** Optional complexity classification to steer framework selection. */
  complexityLevel: ComplexityLevelSchema.optional(),

  /** Types of uncertainty present in this decision. */
  uncertaintyTypes: z.array(UncertaintyTypeSchema).default([]),

  /** When the decision is needed by. */
  deadline: z.coerce.date().optional(),
});
export type DecisionRequest = z.infer<typeof DecisionRequestSchema>;

// ---------------------------------------------------------------------------
// Team Member
// ---------------------------------------------------------------------------

/**
 * Registration record for an executive on the team.
 *
 * Stored internally by the orchestrator -- not a Pydantic/Zod-validated
 * API payload but typed for compile-time safety. The `executive` field
 * is typed as `unknown` here because the schema layer should not depend
 * on the class layer; the orchestrator casts at runtime.
 */
export const TeamMemberSchema = z.object({
  /** Name key (matches BaseExecutive.name). */
  executiveName: z.string(),

  /** Maps decision domains to priority level (higher = more relevant). */
  rolePriority: z.record(z.string(), z.number().int().min(0)),

  /** Domains where this executive has veto authority. */
  vetoRights: z.array(z.string()).default([]),

  /** Whether this member is currently active on the team. */
  isActive: z.boolean().default(true),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

// ---------------------------------------------------------------------------
// Executive Team Configuration
// ---------------------------------------------------------------------------

/**
 * Tunable parameters for the executive team orchestrator.
 */
export const ExecutiveTeamConfigSchema = z.object({
  /** Support level required to declare consensus (0-1). */
  consensusThreshold: z.number().min(0).max(1).default(0.7),

  /** Minimum fraction of executives that must participate (0-1). */
  minExecutiveParticipation: z.number().min(0).max(1).default(0.6),

  /** Framework key to use when auto-selection is disabled. */
  defaultDecisionFramework: z.string().default("bayesian"),

  /** Maximum iterations to attempt conflict resolution. */
  maxResolutionAttempts: z.number().int().min(1).default(3),

  /** Support level below which human escalation is triggered (0-1). */
  humanEscalationThreshold: z.number().min(0).max(1).default(0.3),

  /** Whether executives can exercise veto power in their domains. */
  enableVeto: z.boolean().default(true),

  /** Whether to persist decisions in the in-memory history. */
  logDecisions: z.boolean().default(true),

  /** Whether to auto-select the best framework based on request attributes. */
  autoSelectFramework: z.boolean().default(true),
});
export type ExecutiveTeamConfig = z.infer<typeof ExecutiveTeamConfigSchema>;

// ---------------------------------------------------------------------------
// Decision Metrics
// ---------------------------------------------------------------------------

/** Operational metrics captured during the decision process. */
export const DecisionMetricsSchema = z.object({
  resolutionAttempts: z.number().int().nonnegative(),
  finalSupportPercentage: z.number().min(0).max(1),
  vetoApplied: z.boolean(),
  executiveCount: z.number().int().nonnegative(),
  framework: z.string(),
  leadExecutive: z.string(),
});
export type DecisionMetrics = z.infer<typeof DecisionMetricsSchema>;

// ---------------------------------------------------------------------------
// Veto Result
// ---------------------------------------------------------------------------

/**
 * Result of the veto check -- either no veto or a veto with full context.
 */
export const VetoResultSchema = z.discriminatedUnion("vetoApplied", [
  z.object({
    vetoApplied: z.literal(false),
  }),
  z.object({
    vetoApplied: z.literal(true),
    vetoExecutive: z.string(),
    vetoRole: z.string(),
    vetoDomain: z.string(),
    agreementLevel: z.number().min(0).max(1),
    concerns: z.array(z.string()),
  }),
]);
export type VetoResult = z.infer<typeof VetoResultSchema>;

// ---------------------------------------------------------------------------
// Decision Outcome
// ---------------------------------------------------------------------------

/**
 * Complete outcome of a decision process, including the final recommendation,
 * consensus result, participating executives, and operational metrics.
 */
export const DecisionOutcomeSchema = z.object({
  decisionId: z.string(),
  query: z.string(),
  recommendation: ExecutiveRecommendationSchema,
  consensus: ConsensusOutcomeSchema,
  participatingExecutives: z.array(z.string()),
  selectedFramework: z.string(),
  resolutionAttempts: z.number().int().min(1).default(1),
  decisionRequest: DecisionRequestSchema,
  escalatedToHuman: z.boolean().default(false),
  humanFeedback: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
  decisionMetrics: DecisionMetricsSchema,
});
export type DecisionOutcome = z.infer<typeof DecisionOutcomeSchema>;

// ---------------------------------------------------------------------------
// Executive Insights
// ---------------------------------------------------------------------------

/** Per-executive performance summary. */
export const ExecutiveInsightSchema = z.object({
  role: z.string(),
  decisionsParticipated: z.number().int().nonnegative(),
  leadDecisions: z.number().int().nonnegative(),
  avgSupportPercentage: z.number().min(0).max(1),
});
export type ExecutiveInsight = z.infer<typeof ExecutiveInsightSchema>;

/** Aggregate insights response (all executives). */
export const TeamInsightsSchema = z.object({
  totalDecisions: z.number().int().nonnegative(),
  executiveInsights: z.record(z.string(), ExecutiveInsightSchema),
  frameworkUsage: z.record(z.string(), z.number().int().nonnegative()),
});
export type TeamInsights = z.infer<typeof TeamInsightsSchema>;

/** Per-executive insights response. */
export const SingleExecutiveInsightsSchema = z.object({
  executive: z.string(),
  decisionsParticipated: z.number().int().nonnegative(),
  leadDecisions: z.number().int().nonnegative(),
  avgSupportPercentage: z.number().min(0).max(1),
  decisions: z.array(
    z.object({
      id: z.string(),
      query: z.string(),
      timestamp: z.string(),
    }),
  ),
});
export type SingleExecutiveInsights = z.infer<typeof SingleExecutiveInsightsSchema>;
