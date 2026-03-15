# Migracje bazy danych

Uruchamiaj w **Supabase SQL Editor**.

## Jedno uruchomienie (zalecane)

W katalogu `database/` jest plik **`full_schema.sql`** – idempotentny: najpierw usuwa tabele, typy, funkcje i polityki, potem tworzy wszystko od zera. Można go odpalać wielokrotnie (np. po błędach „type already exists”). Po nim uruchom **`seed_test_data.sql`**, jeśli chcesz dane testowe.

## Migracje pojedynczo (od zera)

W podanej kolejności (od góry):

1. **001_initial_schema.sql** – tabele, enumy, indeksy, triggery, RLS  
2. **002_add_course_image.sql** – kolumna `main_image_url` w `courses`  
3. **003_add_course_promotion.sql** – kolumny promocji w `courses`  
4. **004_create_course_with_content.sql** – funkcja RPC tworzenia kursu  
5. **005_update_course_with_content.sql** – funkcja RPC aktualizacji kursu  
6. **006_setup_course_images_storage.sql** – bucket i polityki Storage  

## Baza z już działającym projektem

- Jeśli masz już schemat z `init.sql`: uruchom tylko **002**, **003**, **004**, **005**, **006** (pomiń 001).  
- Jeśli brakuje tylko promocji: **003**, **004**, **005**.  
- Jeśli brakuje tylko zdjęć kursów: **002**, **006** (oraz ewentualnie **004**/**005**, jeśli RPC nie mają jeszcze `main_image_url` – w obecnej wersji RPC nie zapisują `main_image_url`).

## Dane testowe

Po migracjach możesz uruchomić (opcjonalnie):  
`../seed_test_data.sql`
