-- Dodanie kolumny zdjęcia głównego do kursów
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS main_image_url TEXT;

COMMENT ON COLUMN courses.main_image_url IS 'URL of the main course image displayed on course cards and detail pages';
