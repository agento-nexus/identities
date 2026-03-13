/**
 * Decision Framework Schemas
 *
 * Zod schemas and inferred types for the decision-framework domain:
 * uncertainty classification, complexity levels, decision context,
 * and structured recommendations.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Types of uncertainty encountered during decision-making. */
export const UncertaintyTypeSchema = z.enum([
  "statistical",            // Known probabilities
  "scenario",               // Known outcomes, unknown probabilities
  "recognized_ignorance",   // Known unknowns
  "total_ignorance",        // Unknown unknowns
]);
export type UncertaintyType = z.infer<typeof UncertaintyTypeSchema>;

/** Cynefin-inspired complexity levels for a decision situation. */
export const ComplexityLevelSchema = z.enum([
  "simple",       // Clear cause-effect, established practices apply
  "complicated",  // Multiple factors but analyzable
  "complex",      // Emergent patterns, unpredictable interactions
  "chaotic",      // No clear patterns, rapid change
]);
export type ComplexityLevel = z.infer<typeof ComplexityLevelSchema>;

// ---------------------------------------------------------------------------
// Decision Context
// ---------------------------------------------------------------------------

/**
 * Everything the framework needs to reason about a decision.
 *
 * Mirrors the Python `DecisionContext` TypedDict while adding Zod
 * validation (non-empty problem statement, weight values in [0,1]).
 */
export const DecisionContextSchema = z.object({
  /** The problem or opportunity to decide on. */
  problemStatement: z.string().min(1, "Problem statement must not be empty"),

  /** Alternatives being evaluated, each as a free-form record. */
  alternatives: z
    .array(z.record(z.string(), z.unknown()))
    .min(1, "At least one alternative is required"),

  /** Hard constraints and boundaries. */
  constraints: z.array(z.string()),

  /**
   * Organisational values mapped to their relative importance (0-1).
   * Weights do not need to sum to 1 -- they are normalised at evaluation time.
   */
  organizationalValues: z.record(
    z.string(),
    z.number().min(0).max(1),
  ),

  /** Supporting data available for analysis. */
  availableData: z.record(z.string(), z.unknown()),

  /** Stakeholders who are affected by or involved in the decision. */
  stakeholders: z.array(z.string()),

  /** Related historical decisions (optional). */
  previousDecisions: z
    .array(z.record(z.string(), z.unknown()))
    .optional(),

  /** Domain-specific information that may influence the decision (optional). */
  domainSpecificContext: z.record(z.string(), z.unknown()).optional(),
});
export type DecisionContext = z.infer<typeof DecisionContextSchema>;

// ---------------------------------------------------------------------------
// Decision Recommendation
// ---------------------------------------------------------------------------

/** Structured risk entry surfaced by a framework. */
export const IdentifiedRiskSchema = z.object({
  description: z.string(),
  severity: z.string().optional(),
  likelihood: z.string().optional(),
  mitigation: z.string().optional(),
}).passthrough();
export type IdentifiedRisk = z.infer<typeof IdentifiedRiskSchema>;

/** A rejected alternative with the reason it was dropped. */
export const RejectedAlternativeSchema = z
  .record(z.string(), z.unknown())
  .and(
    z.object({ rejectionReason: z.string().optional() }).passthrough(),
  );
export type RejectedAlternative = z.infer<typeof RejectedAlternativeSchema>;

/**
 * The output of applying a decision framework to a context.
 *
 * Captures the recommendation, its justification, confidence level,
 * trade-offs, risks, assumptions, and any framework-specific artefacts.
 */
export const DecisionRecommendationSchema = z.object({
  /** The recommended alternative (free-form record). */
  recommendedAlternative: z.record(z.string(), z.unknown()),

  /** Human-readable reasoning that justifies the recommendation. */
  reasoning: z.string().min(1),

  /** Confidence in this recommendation on a 0-1 scale. */
  confidenceLevel: z.number().min(0).max(1),

  /** Key factors that most influenced the recommendation. */
  keyFactors: z.array(z.string()).min(1),

  /** Trade-offs the framework weighed. */
  tradeOffs: z.array(z.string()).default([]),

  /** Risks identified during analysis. */
  risks: z.array(IdentifiedRiskSchema).default([]),

  /** Assumptions baked into the recommendation. */
  assumptions: z.array(z.string()).default([]),

  /** Arbitrary outputs specific to the framework implementation. */
  frameworkSpecificOutputs: z.record(z.string(), z.unknown()).default({}),

  /** Alternatives considered but not recommended. */
  rejectedAlternatives: z.array(RejectedAlternativeSchema).default([]),
});
export type DecisionRecommendation = z.infer<typeof DecisionRecommendationSchema>;

// ---------------------------------------------------------------------------
// Framework Info (returned by BaseDecisionFramework.frameworkInfo)
// ---------------------------------------------------------------------------

export const FrameworkInfoSchema = z.object({
  name: z.string(),
  description: z.string(),
  className: z.string(),
});
export type FrameworkInfo = z.infer<typeof FrameworkInfoSchema>;

// ---------------------------------------------------------------------------
// Applicability Assessment (returned by evaluateApplicability)
// ---------------------------------------------------------------------------

export const ApplicabilityAssessmentSchema = z.object({
  /** 0-1 score indicating how well the framework fits the context. */
  score: z.number().min(0).max(1),
  /** Human-readable explanation. */
  explanation: z.string(),
  /** Any additional detail the framework wants to surface. */
  details: z.record(z.string(), z.unknown()).optional(),
});
export type ApplicabilityAssessment = z.infer<typeof ApplicabilityAssessmentSchema>;
