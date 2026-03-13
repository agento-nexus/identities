/**
 * Executive Intelligence -- Zod schemas and inferred types
 *
 * Covers confidence levels, expertise levels, stakeholder impacts,
 * risk assessments, recommendations, and the context envelope that
 * flows between executives during deliberation.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/**
 * Numeric confidence scale (1-5) used across recommendations, risk
 * assessments, and stakeholder impact ratings.
 */
export const DecisionConfidenceSchema = z.enum([
  "VERY_LOW",
  "LOW",
  "MODERATE",
  "HIGH",
  "VERY_HIGH",
]);
export type DecisionConfidence = z.infer<typeof DecisionConfidenceSchema>;

/** Maps each confidence label to its numeric rank (1-5). */
export const CONFIDENCE_RANK: Record<DecisionConfidence, number> = {
  VERY_LOW: 1,
  LOW: 2,
  MODERATE: 3,
  HIGH: 4,
  VERY_HIGH: 5,
} as const;

/**
 * Expertise level for a domain of knowledge. Used in executive
 * profiles to express depth of capability.
 */
export const ExpertiseLevelSchema = z.enum([
  "NOVICE",
  "BASIC",
  "PROFICIENT",
  "ADVANCED",
  "EXPERT",
]);
export type ExpertiseLevel = z.infer<typeof ExpertiseLevelSchema>;

export const EXPERTISE_RANK: Record<ExpertiseLevel, number> = {
  NOVICE: 1,
  BASIC: 2,
  PROFICIENT: 3,
  ADVANCED: 4,
  EXPERT: 5,
} as const;

/**
 * Directional impact a decision may have on a stakeholder group.
 */
export const ImpactLevelSchema = z.enum([
  "negative",
  "neutral",
  "positive",
  "mixed",
]);
export type ImpactLevel = z.infer<typeof ImpactLevelSchema>;

// ---------------------------------------------------------------------------
// Domain models
// ---------------------------------------------------------------------------

/** Impact of a decision on a specific stakeholder group. */
export const StakeholderImpactSchema = z.object({
  stakeholderGroup: z.string(),
  impactLevel: ImpactLevelSchema,
  impactDescription: z.string(),
  confidence: DecisionConfidenceSchema,
  mitigationStrategies: z.array(z.string()).optional(),
});
export type StakeholderImpact = z.infer<typeof StakeholderImpactSchema>;

/** Risk assessment for a recommendation or decision. */
export const RiskAssessmentSchema = z.object({
  riskCategory: z.string(), // e.g. "financial", "reputational", "operational", "compliance"
  likelihood: DecisionConfidenceSchema,
  impact: DecisionConfidenceSchema,
  riskDescription: z.string(),
  mitigationStrategies: z.array(z.string()),
});
export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;

/** Alternative option considered but not selected as the primary recommendation. */
export const RecommendationAlternativeSchema = z.object({
  title: z.string(),
  description: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  whyNotSelected: z.string(),
});
export type RecommendationAlternative = z.infer<typeof RecommendationAlternativeSchema>;

/** A formal recommendation produced by an executive agent. */
export const ExecutiveRecommendationSchema = z.object({
  title: z.string().describe("Concise title of the recommendation"),
  summary: z.string().describe("Brief executive summary"),
  detailedDescription: z.string().describe("Complete description of the recommendation"),
  supportingEvidence: z.array(z.string()).describe("Evidence supporting this recommendation"),
  confidence: DecisionConfidenceSchema.describe("Confidence level in this recommendation"),
  alternativesConsidered: z
    .array(RecommendationAlternativeSchema)
    .default([])
    .describe("Alternative options that were considered"),
  risks: z
    .array(RiskAssessmentSchema)
    .default([])
    .describe("Risks associated with this recommendation"),
  stakeholderImpacts: z
    .array(StakeholderImpactSchema)
    .default([])
    .describe("Impact on various stakeholders"),
  resourceRequirements: z
    .record(z.string(), z.unknown())
    .default({})
    .describe("Resources required to implement this recommendation"),
  implementationTimeline: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Timeline for implementation"),
  successMetrics: z
    .array(z.string())
    .default([])
    .describe("Metrics to evaluate success"),
  domainSpecificAnalyses: z
    .record(z.string(), z.unknown())
    .default({})
    .describe("Domain-specific analyses relevant to this executive's expertise"),
  uncertaintyFactors: z
    .array(z.string())
    .default([])
    .describe("Factors contributing to uncertainty"),
  frameworkUsed: z
    .string()
    .default("")
    .describe("Decision framework used to arrive at this recommendation"),
});
export type ExecutiveRecommendation = z.infer<typeof ExecutiveRecommendationSchema>;

/** Context envelope passed to executives when requesting analysis. */
export const ExecutiveContextSchema = z.object({
  query: z.string(),
  backgroundInformation: z.record(z.string(), z.unknown()),
  constraints: z.array(z.string()),
  availableData: z.record(z.string(), z.unknown()),
  previousDecisions: z.record(z.string(), z.unknown()),
  organizationalPriorities: z.array(z.string()),
  relevantMetrics: z.record(z.string(), z.unknown()),
});
export type ExecutiveContext = z.infer<typeof ExecutiveContextSchema>;

// ---------------------------------------------------------------------------
// Executive profile (read-only snapshot returned by the getter)
// ---------------------------------------------------------------------------

export const ExecutiveProfileSchema = z.object({
  name: z.string(),
  role: z.string(),
  expertiseDomains: z.record(z.string(), ExpertiseLevelSchema),
  decisionsMade: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});
export type ExecutiveProfile = z.infer<typeof ExecutiveProfileSchema>;

// ---------------------------------------------------------------------------
// Decision record (audit trail entry)
// ---------------------------------------------------------------------------

export const DecisionRecordSchema = z.object({
  timestamp: z.string().datetime(),
  context: ExecutiveContextSchema,
  recommendation: ExecutiveRecommendationSchema,
});
export type DecisionRecord = z.infer<typeof DecisionRecordSchema>;

// ---------------------------------------------------------------------------
// Evaluation result (returned by evaluateRecommendation)
// ---------------------------------------------------------------------------

export const RecommendationEvaluationSchema = z.object({
  evaluator: z.string(),
  agreementLevel: DecisionConfidenceSchema,
  concerns: z.array(z.string()),
  suggestedModifications: z.array(z.string()),
  additionalInsights: z.record(z.string(), z.unknown()).default({}),
});
export type RecommendationEvaluation = z.infer<typeof RecommendationEvaluationSchema>;
