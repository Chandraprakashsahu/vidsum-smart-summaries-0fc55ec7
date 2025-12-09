-- Add bilingual content columns to summaries table
ALTER TABLE public.summaries 
ADD COLUMN IF NOT EXISTS content_en jsonb,
ADD COLUMN IF NOT EXISTS content_hi jsonb;

-- Migrate existing data: copy key_points and intro to content_en (assuming existing content is English)
UPDATE public.summaries 
SET content_en = jsonb_build_object('intro', intro, 'keyPoints', key_points)
WHERE content_en IS NULL;