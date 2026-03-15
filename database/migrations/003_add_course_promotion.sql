-- Pola promocji w kursach (jak w kuponach: typ, wartość, daty)
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS promotion_discount_type discount_type,
  ADD COLUMN IF NOT EXISTS promotion_discount_value INTEGER,
  ADD COLUMN IF NOT EXISTS promotion_start_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS promotion_end_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_promotion_check;
ALTER TABLE courses
  ADD CONSTRAINT courses_promotion_check CHECK (
    (
      promotion_discount_type IS NULL
      AND promotion_discount_value IS NULL
      AND promotion_start_date IS NULL
      AND promotion_end_date IS NULL
    )
    OR (
      promotion_discount_type IS NOT NULL
      AND promotion_discount_value IS NOT NULL
      AND promotion_start_date IS NOT NULL
      AND (
        (promotion_discount_type = 'percentage' AND promotion_discount_value BETWEEN 1 AND 100)
        OR (promotion_discount_type = 'fixed' AND promotion_discount_value >= 0)
      )
    )
  );

COMMENT ON COLUMN courses.promotion_discount_type IS 'Promotion discount type: percentage or fixed amount';
COMMENT ON COLUMN courses.promotion_discount_value IS 'Promotion value: 1-100 for percentage, amount in grosze for fixed';
COMMENT ON COLUMN courses.promotion_start_date IS 'Promotion valid from (inclusive)';
COMMENT ON COLUMN courses.promotion_end_date IS 'Promotion valid until (inclusive), NULL = no end';
