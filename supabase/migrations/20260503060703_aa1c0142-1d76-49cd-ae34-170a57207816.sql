
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS scraped_content text,
  ADD COLUMN IF NOT EXISTS feedback_rating text,
  ADD COLUMN IF NOT EXISTS feedback_text text,
  ADD COLUMN IF NOT EXISTS feedback_at timestamptz;

ALTER TABLE public.generations
  DROP CONSTRAINT IF EXISTS generations_feedback_rating_check;
ALTER TABLE public.generations
  ADD CONSTRAINT generations_feedback_rating_check
  CHECK (feedback_rating IS NULL OR feedback_rating IN ('good','bad'));

-- Owners can update feedback fields on their own generations
DROP POLICY IF EXISTS "Owners can update feedback on their generations" ON public.generations;
CREATE POLICY "Owners can update feedback on their generations"
ON public.generations
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = generations.product_id AND p.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM products p WHERE p.id = generations.product_id AND p.owner_id = auth.uid()));

-- Self-improving agent: rules learned from bad feedback
CREATE TABLE IF NOT EXISTS public.product_learnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  lesson text NOT NULL,
  source_generation_id uuid REFERENCES public.generations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_learnings_product ON public.product_learnings(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_product_created ON public.generations(product_id, created_at DESC);

ALTER TABLE public.product_learnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view learnings" ON public.product_learnings;
CREATE POLICY "Owners can view learnings"
ON public.product_learnings FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_learnings.product_id AND p.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can delete learnings" ON public.product_learnings;
CREATE POLICY "Owners can delete learnings"
ON public.product_learnings FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_learnings.product_id AND p.owner_id = auth.uid()));
