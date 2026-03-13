/**
 * Consensus Builder -- Zod schemas and inferred types
 *
 * Models the consensus-building process among executive agents:
 * conflict detection, resolution strategies, participation tracking,
 * and final consensus outcomes.
 */

import { z } from "zod";
import { ExecutiveRecommendationSchema } from "./executive.js";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** How much agreement was reached across the executive team. */
export const ConsensusLevelSchema = z.enum([
  "STRONG_CONSENSUS",      // Near-unanimous agreement (>= 90%)
  "GENERAL_CONSENSUS",     // Strong majority (>= 75%)
  "MAJORITY_AGREEMENT",    // Simple majority (>= 60%)
  "DIVIDED_OPINION",       // Significant division (>= 40%)
  "STRONG_DISAGREEMENT",   // Fundamental conflicts (< 40%)
]);
export type ConsensusLevel = z.infer<typeof ConsensusLevelSchema>;

/** Category of conflict that arose during deliberation. */
export const ConflictTypeSchema = z.enum([
  "FACTUAL",           // Disagreement about facts
  "INTERPRETIVE",      // Different interpretations of the same data
  "VALUES",            // Different priorities or values
  "STRATEGIC",         // Different preferred approaches
  "ROLE_BASED",        // Conflicts arising from role perspectives
  "RISK_ASSESSMENT",   // Different risk evaluations
]);
export type ConflictType = z.infer<typeof ConflictTypeSchema>;

/** Strategy used to resolve a conflict between executives. */
export const ConflictResolutionMethodSchema = z.enum([
  "EVIDENCE_BASED",        // Additional data to resolve factual disputes
  "WEIGHTED_VOTING",       // Expertise-weighted voting
  "DELPHI_METHOD",         // Iterative anonymous feedback
  "COMPROMISE",            // Finding middle ground
  "INTEGRATIVE",           // Creative solution incorporating multiple viewpoints
  "ESCALATION",            // Escalation to human decision-makers
  "STRUCTURED_DEBATE",     // Formal debate process
  "DIALECTICAL_INQUIRY",   // Thesis-antithesis-synthesis
]);
export type ConflictResolutionMethod = z.infer<typeof ConflictResolutionMethodSchema>;

/** Severity rating for a detected conflict. */
export const ConflictSeveritySchema = z.enum(["low", "medium", "high"]);
export type ConflictSeverity = z.infer<typeof ConflictSeveritySchema>;

// ---------------------------------------------------------------------------
// Participation & evaluation
// ---------------------------------------------------------------------------

/** Record of an executive's participation in a decision. */
export const DecisionParticipationSchema = z.object({
  executiveId: z.string(),
  executiveRole: z.string(),
  /** "recommender" | "reviewer" | "contributor" etc. */
  participationType: z.string(),
  /** 0-1 influence weight for this executive in the current decision. */
  contributionWeight: z.number().min(0).max(1),
  /** 0-1 relevance of this executive's expertise to the decision at hand. */
  expertiseRelevance: z.number().min(0).max(1),
});
export type DecisionParticipation = z.infer<typeof DecisionParticipationSchema>;

/** An individual executive's evaluation of a recommendation. */
export const ConsensusEvaluationSchema = z.object({
  recommendationId: z.string(),
  evaluatorId: z.string(),
  evaluatorRole: z.string(),
  /** 0-1 agreement with the recommendation. */
  agreementLevel: z.number().min(0).max(1),
  /** Specific concerns with the recommendation. */
  concerns: z.array(z.string()).default([]),
  /** Suggestions for improvement. */
  suggestions: z.array(z.string()).default([]),
  /** Arguments supporting this evaluation. */
  supportingArguments: z.array(z.string()).default([]),
  /** 0-1 relevance of the evaluator's expertise. */
  expertiseLevel: z.number().min(0).max(1),
  /** 0-1 evaluator's confidence in their own assessment. */
  confidence: z.number().min(0).max(1),
});
export type ConsensusEvaluation = z.infer<typeof ConsensusEvaluationSchema>;

// ---------------------------------------------------------------------------
// Conflict record
// ---------------------------------------------------------------------------

/** A detected conflict between executives. */
export const DetectedConflictSchema = z.object({
  type: z.string(),
  description: z.string(),
  severity: ConflictSeveritySchema,
  /** IDs of executives affected (shared-concern / polarized / role-based). */
  affectedExecutives: z.array(z.string()).optional(),
  supportingExecutives: z.array(z.string()).optional(),
  opposingExecutives: z.array(z.string()).optional(),
  supportingRole: z.string().optional(),
  opposingRole: z.string().optional(),
  agreementDifference: z.number().optional(),
});
export type DetectedConflict = z.infer<typeof DetectedConflictSchema>;

// ---------------------------------------------------------------------------
// Support metrics (internal, but useful to expose for audit)
// ---------------------------------------------------------------------------

export const SupportMetricsSchema = z.object({
  weightedSupport: z.number().min(0).max(1),
  unweightedSupport: z.number().min(0).max(1),
  participationRate: z.number().min(0).max(1),
  strongSupport: z.number().int().nonnegative(),
  moderateSupport: z.number().int().nonnegative(),
  neutral: z.number().int().nonnegative(),
  moderateOpposition: z.number().int().nonnegative(),
  strongOpposition: z.number().int().nonnegative(),
});
export type SupportMetrics = z.infer<typeof SupportMetricsSchema>;

// ---------------------------------------------------------------------------
// Opinion cluster (from disagreement analysis)
// ---------------------------------------------------------------------------

export const OpinionClusterSchema = z.object({
  agreementLevel: z.enum(["high", "medium", "low"]),
  members: z.array(z.string()),
  avgAgreement: z.number().min(0).max(1),
  size: z.number().int().positive(),
});
export type OpinionCluster = z.infer<typeof OpinionClusterSchema>;

// ---------------------------------------------------------------------------
// Disagreement analysis result
// ---------------------------------------------------------------------------

export const DisagreementAnalysisSchema = z.object({
  meanAgreement: z.number(),
  agreementStdDev: z.number(),
  agreementRange: z.number(),
  polarizationIndex: z.number(),
  opinionClusters: z.array(OpinionClusterSchema),
  primaryConcerns: z.record(z.string(), z.number()),
  roleBasedPatterns: z.record(z.string(), z.unknown()),
  disagreementLevel: z.string(),
});
export type DisagreementAnalysis = z.infer<typeof DisagreementAnalysisSchema>;

// ---------------------------------------------------------------------------
// Consensus outcome
// ---------------------------------------------------------------------------

/** Final result of the consensus-building process. */
export const ConsensusOutcomeSchema = z.object({
  recommendation: ExecutiveRecommendationSchema,
  consensusLevel: ConsensusLevelSchema,
  /** Weighted percentage of support (0-1). */
  supportPercentage: z.number().min(0).max(1),
  supportingExecutives: z.array(z.string()),
  opposingExecutives: z.array(z.string()),
  abstainingExecutives: z.array(z.string()),
  keyConflicts: z.array(DetectedConflictSchema),
  resolutionMethod: z.string(),
  modifiedFromOriginal: z.boolean().default(false),
  modificationSummary: z.string().optional(),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
});
export type ConsensusOutcome = z.infer<typeof ConsensusOutcomeSchema>;

// ---------------------------------------------------------------------------
// Builder configuration (for constructor overrides)
// ---------------------------------------------------------------------------

export const ConsensusBuilderConfigSchema = z.object({
  /** Support level required to declare consensus (0-1). */
  consensusThreshold: z.number().min(0).max(1).default(0.7),
  /** Minimum participation level from eligible executives (0-1). */
  minParticipation: z.number().min(0).max(1).default(0.5),
  /** Threshold above which conflicts are automatically resolved (0-1). */
  automaticResolutionThreshold: z.number().min(0).max(1).default(0.85),
});
export type ConsensusBuilderConfig = z.infer<typeof ConsensusBuilderConfigSchema>;
