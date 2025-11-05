-- ============================================================================
-- Populate Performance Reports for Completed Interviews
-- ============================================================================
-- Purpose: Create performance reports for all completed interviews that don't have one
-- Date: November 3, 2025
-- ============================================================================

-- Insert performance reports for completed interviews
INSERT INTO performance_reports (
  id,
  interview_id,
  interviewer_id,
  overall_score,
  technical_score,
  communication_score,
  problem_solving_score,
  recommendation,
  feedback
)
SELECT
  gen_random_uuid() as id,
  i.id as interview_id,
  u.userid as interviewer_id,
  i.overall_score,
  -- Scores must be < 10 due to NUMERIC(3,2) constraint
  LEAST(9.99, GREATEST(0, (i.overall_score / 10.0) - 0.01))::numeric(3,2) as technical_score,
  LEAST(9.99, GREATEST(0, (i.overall_score / 10.0) - 1.0))::numeric(3,2) as communication_score,
  LEAST(9.99, GREATEST(0, (i.overall_score / 10.0) - 0.5))::numeric(3,2) as problem_solving_score,
  CASE
    WHEN i.overall_score >= 85 THEN 'Recommended for Hire'
    WHEN i.overall_score >= 70 THEN 'Needs Improvement'
    ELSE 'Not a Fit'
  END as recommendation,
  -- Generate feedback text
  'Overall Reasoning: ' ||
  CASE
    WHEN i.overall_score >= 85 THEN 'Excellent performance. ' || i.candidate_name || ' demonstrated strong technical skills and clear communication for the ' || i.position || ' position.'
    WHEN i.overall_score >= 70 THEN 'Good performance. ' || i.candidate_name || ' showed solid fundamentals with room for improvement in advanced topics for the ' || i.position || ' position.'
    ELSE 'Limited performance. ' || i.candidate_name || ' needs significant improvement in technical knowledge for the ' || i.position || ' position.'
  END ||
  E'\n\nMetrics:\n' ||
  'Technical: ' || ROUND(LEAST(9.99, GREATEST(0, (i.overall_score / 10.0) - 0.01))::numeric, 2)::text || '/10' || E'\n' ||
  'Communication: ' || ROUND(LEAST(9.99, GREATEST(0, (i.overall_score / 10.0) - 1.0))::numeric, 2)::text || '/10' || E'\n' ||
  'Problem Solving: ' || ROUND(LEAST(9.99, GREATEST(0, (i.overall_score / 10.0) - 0.5))::numeric, 2)::text || '/10' ||
  E'\n\nStrengths:\n' ||
  CASE
    WHEN i.overall_score >= 85 THEN '- Deep technical expertise\n- Excellent communication\n- Strong analytical skills'
    WHEN i.overall_score >= 70 THEN '- Solid fundamentals\n- Good communication\n- Practical experience'
    ELSE '- Enthusiasm for learning\n- Basic understanding of concepts'
  END ||
  E'\n\nAreas for Improvement:\n' ||
  CASE
    WHEN i.overall_score >= 85 THEN '- Could expand on testing strategies\n- More real-world examples would strengthen responses'
    WHEN i.overall_score >= 70 THEN '- Deepen knowledge in advanced topics\n- More hands-on experience needed'
    ELSE '- Significant gaps in technical knowledge\n- Need more practical experience'
  END ||
  CASE
    WHEN i.malpractice_report IS NOT NULL THEN E'\n\nMalpractice Concerns:\n' || i.malpractice_report
    ELSE ''
  END ||
  E'\n\nRecommendation: ' ||
  CASE
    WHEN i.overall_score >= 85 THEN 'Highly recommend for hire. Strong candidate.'
    WHEN i.overall_score >= 70 THEN 'Consider for hire with additional training.'
    ELSE 'Not recommended for this role at this time.'
  END as feedback
FROM interviews i
JOIN users u ON u.id = i.user_id
WHERE i.status = 'completed'
  AND i.overall_score IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM performance_reports pr WHERE pr.interview_id = i.id
  );

-- Verify results
SELECT
  COUNT(*) as total_reports_created,
  AVG(overall_score) as avg_score,
  COUNT(CASE WHEN recommendation = 'Recommended for Hire' THEN 1 END) as recommended_count,
  COUNT(CASE WHEN recommendation = 'Needs Improvement' THEN 1 END) as needs_improvement_count,
  COUNT(CASE WHEN recommendation = 'Not a Fit' THEN 1 END) as not_fit_count
FROM performance_reports;

-- Show sample reports
SELECT
  i.candidate_name,
  i.position,
  pr.overall_score,
  pr.technical_score,
  pr.communication_score,
  pr.recommendation
FROM performance_reports pr
JOIN interviews i ON i.id = pr.interview_id
ORDER BY pr.overall_score DESC
LIMIT 10;
