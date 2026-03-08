-- Drop unique constraint to allow reordering
ALTER TABLE question_sequences DROP CONSTRAINT IF EXISTS question_sequences_age_group_position_key;

-- Reset positions to negative to avoid conflicts
UPDATE question_sequences SET position = -position;

-- Reorder with tone-alternating categories and mixed depths
-- Category order alternates: engaging/neutral → light/fun → heavy/reflective
-- Depth ordering within each category: deep, surface, medium, deep, surface, medium... (hooks first)
WITH category_priorities AS (
  -- 18-35: Identity-focused hooks, alternating light/heavy
  SELECT '18-35' as age_group, unnest(ARRAY[
    'relationships','humor','purpose','happiness','self','childhood','adversity','achievements','life','wisdom','family','values','beliefs','legacy'
  ]) as category, generate_series(1,14) as priority
  UNION ALL
  -- 36-55: Relationship/purpose hooks, alternating tone
  SELECT '36-55', unnest(ARRAY[
    'purpose','humor','relationships','happiness','family','achievements','adversity','childhood','life','wisdom','self','values','beliefs','legacy'
  ]), generate_series(1,14)
  UNION ALL
  -- 56-70: Life reflection hooks, alternating tone
  SELECT '56-70', unnest(ARRAY[
    'life','humor','wisdom','happiness','family','achievements','relationships','childhood','adversity','values','purpose','self','beliefs','legacy'
  ]), generate_series(1,14)
  UNION ALL
  -- 71+: Family/legacy hooks, alternating tone
  SELECT '71+', unnest(ARRAY[
    'family','humor','wisdom','happiness','life','achievements','relationships','childhood','adversity','values','legacy','self','purpose','beliefs'
  ]), generate_series(1,14)
),
-- Number questions within each category with MIXED depth ordering
-- Pattern: deep(1), surface(1), medium(1), deep(2), surface(2), medium(2)...
-- This ensures deep "hook" questions appear from week 1
depth_ranked AS (
  SELECT 
    q.id as question_id,
    q.category,
    q.depth,
    -- Assign a depth group number: deep=1, surface=2, medium=3, profound=1 (treat as deep)
    CASE WHEN q.depth IN ('deep', 'profound') THEN 1 WHEN q.depth = 'surface' THEN 2 ELSE 3 END as depth_group,
    ROW_NUMBER() OVER (
      PARTITION BY q.category, 
        CASE WHEN q.depth IN ('deep', 'profound') THEN 1 WHEN q.depth = 'surface' THEN 2 ELSE 3 END
      ORDER BY q.id
    ) as within_depth_rank
  FROM questions q
),
interleaved AS (
  SELECT 
    question_id,
    category,
    -- Interleave: position within category = (within_depth_rank - 1) * 3 + depth_group
    -- deep questions get slots 1, 4, 7, 10...
    -- surface questions get slots 2, 5, 8, 11...
    -- medium questions get slots 3, 6, 9, 12...
    (within_depth_rank - 1) * 3 + depth_group as cat_position
  FROM depth_ranked
),
numbered_within_cat AS (
  -- Re-rank to handle uneven depth counts (some categories have more deep than surface)
  SELECT 
    question_id,
    category,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY cat_position, question_id) as q_num
  FROM interleaved
),
new_positions AS (
  SELECT 
    qs.id as seq_id,
    ((nwc.q_num - 1) * 14 + cp.priority) as new_position
  FROM question_sequences qs
  JOIN numbered_within_cat nwc ON nwc.question_id = qs.question_id
  JOIN category_priorities cp ON cp.age_group = qs.age_group AND cp.category = nwc.category
)
UPDATE question_sequences qs
SET position = np.new_position
FROM new_positions np
WHERE qs.id = np.seq_id;

-- Re-add constraint
ALTER TABLE question_sequences ADD CONSTRAINT question_sequences_age_group_position_key UNIQUE (age_group, position);
