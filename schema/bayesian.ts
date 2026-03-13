/**
 * Bayesian Decision Framework Schemas
 *
 * Zod schemas and inferred types for probabilistic outcomes,
 * Bayesian alternatives, and risk analysis results.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Probabilistic Outcome
// ---------------------------------------------------------------------------

/** A single possible outcome with its probability, utility, and confidence. */
export const ProbabilisticOutcomeSchema = z.object({
  /** Human-readable description of the outcome. */
  description: z.string().min(1),
  /** Probability of this outcome occurring (0-1). */
  probability: z.number().min(0).max(1),
  /** Utility (value) of this outcome -- can be negative. */
  utility: z.number(),
  /** Confidence in the probability estimate (0-1). */
  confidence: z.number().min(0).max(1),
});
export type ProbabilisticOutcome = z.infer<typeof ProbabilisticOutcomeSchema>;

// ---------------------------------------------------------------------------
// Bayesian Alternative
// ---------------------------------------------------------------------------

/**
 * An alternative under evaluation, comprising a set of probabilistic
 * outcomes and a prior probability that can be updated via Bayes' rule.
 */
export const BayesianAlternativeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  outcomes: z.array(ProbabilisticOutcomeSchema).min(1),
  /** Prior probability assigned to this alternative (defaults to 1). */
  priorProbability: z.number().min(0).default(1),
});
export type BayesianAlternative = z.infer<typeof BayesianAlternativeSchema>;

// ---------------------------------------------------------------------------
// Risk Assessment
// ---------------------------------------------------------------------------

/** Risk profile produced by analysing an alternative's outcome distribution. */
export const BayesianRiskAssessmentSchema = z.object({
  expectedUtility: z.number(),
  variance: z.number().min(0),
  standardDeviation: z.number().min(0),
  worstCase: z.number(),
  worstCaseProbability: z.number().min(0).max(1),
  /**
   * Coefficient of variation (stddev / expectedUtility).
   * `Infinity` when expected utility is zero.
   */
  coefficientOfVariation: z.number(),
});
export type BayesianRiskAssessment = z.infer<typeof BayesianRiskAssessmentSchema>;

// ---------------------------------------------------------------------------
// Bayesian Framework-specific outputs (embedded in DecisionRecommendation)
// ---------------------------------------------------------------------------

export const BayesianAnalysisOutputSchema = z.object({
  expectedUtility: z.number(),
  riskAssessment: BayesianRiskAssessmentSchema,
  priorProbability: z.number(),
  riskAdjustedUtility: z.number(),
  detailedOutcomes: z.array(ProbabilisticOutcomeSchema),
});
export type BayesianAnalysisOutput = z.infer<typeof BayesianAnalysisOutputSchema>;

// ---------------------------------------------------------------------------
// Helpers -- pure functions that operate on the schemas' types
// ---------------------------------------------------------------------------

/** Calculate expected utility for an alternative's outcome distribution. */
export function computeExpectedUtility(outcomes: ProbabilisticOutcome[]): number {
  return outcomes.reduce((sum, o) => sum + o.probability * o.utility, 0);
}

/** Full risk profile for a set of outcomes. */
export function computeRiskAssessment(
  outcomes: ProbabilisticOutcome[],
): BayesianRiskAssessment {
  // Normalise probabilities so they sum to 1
  const totalProb = outcomes.reduce((s, o) => s + o.probability, 0);
  const probs =
    totalProb > 0
      ? outcomes.map((o) => o.probability / totalProb)
      : outcomes.map(() => 0);
  const utilities = outcomes.map((o) => o.utility);

  const expectedUtility = utilities.reduce(
    (s, u, i) => s + u * probs[i]!,
    0,
  );

  const variance = utilities.reduce(
    (s, u, i) => s + probs[i]! * (u - expectedUtility) ** 2,
    0,
  );

  const standardDeviation = Math.sqrt(Math.max(0, variance));

  const worstCase = Math.min(...utilities);
  const worstCaseProbability = utilities.reduce(
    (s, u, i) => (u === worstCase ? s + probs[i]! : s),
    0,
  );

  const coefficientOfVariation =
    expectedUtility !== 0 ? standardDeviation / expectedUtility : Infinity;

  return {
    expectedUtility,
    variance,
    standardDeviation,
    worstCase,
    worstCaseProbability,
    coefficientOfVariation,
  };
}
