-- Step 1: Drop the unique constraint temporarily
ALTER TABLE question_sequences DROP CONSTRAINT IF EXISTS question_sequences_age_group_position_key;

-- Step 2: Shift all positions to negative to avoid conflicts
UPDATE question_sequences SET position = -position;

-- Step 3: Interleave using round-robin
WITH category_priorities AS (
  SELECT '18-35' as age_group, unnest(ARRAY['self','purpose','relationships','happiness','humor','life','achievements','values','adversity','family','childhood','wisdom','beliefs','legacy']) as category, generate_series(1,14) as priority
  UNION ALL
  SELECT '36-55', unnest(ARRAY['relationships','purpose','family','happiness','life','humor','achievements','self','adversity','values','childhood','wisdom','beliefs','legacy']), generate_series(1,14)
  UNION ALL
  SELECT '56-70', unnest(ARRAY['life','wisdom','family','relationships','childhood','happiness','achievements','purpose','humor','adversity','values','self','beliefs','legacy']), generate_series(1,14)
  UNION ALL
  SELECT '71+', unnest(ARRAY['family','life','childhood','wisdom','relationships','legacy','happiness','values','achievements','humor','adversity','purpose','self','beliefs']), generate_series(1,14)
),
numbered_questions AS (
  SELECT 
    qs.id,
    qs.age_group,
    q.category,
    ROW_NUMBER() OVER (
      PARTITION BY qs.age_group, q.category 
      ORDER BY 
        CASE q.depth WHEN 'surface' THEN 1 WHEN 'medium' THEN 2 WHEN 'deep' THEN 3 ELSE 4 END,
        q.id
    ) as q_num
  FROM question_sequences qs
  JOIN questions q ON q.id = qs.question_id
),
new_positions AS (
  SELECT 
    nq.id,
    ((nq.q_num - 1) * 14 + cp.priority) as new_position
  FROM numbered_questions nq
  JOIN category_priorities cp ON cp.age_group = nq.age_group AND cp.category = nq.category
)
UPDATE question_sequences qs
SET position = np.new_position
FROM new_positions np
WHERE qs.id = np.id;

-- Step 4: Re-add the unique constraint
ALTER TABLE question_sequences ADD CONSTRAINT question_sequences_age_group_position_key UNIQUE (age_group, position);
