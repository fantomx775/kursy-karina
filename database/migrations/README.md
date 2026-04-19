# Migracje bazy danych

Uruchamiaj w **Supabase SQL Editor**.

## Jedno uruchomienie (zalecane)

W katalogu `database/` jest plik **`full_schema.sql`** - idempotentny: najpierw usuwa tabele, typy, funkcje i polityki, potem tworzy wszystko od zera. Mozna go odpalac wielokrotnie. Po nim uruchom **`seed_test_data.sql`**, jesli chcesz dane testowe.

## Migracje pojedynczo (od zera)

W podanej kolejnosci:

1. **001_initial_schema.sql** - tabele, enumy, indeksy, triggery, RLS
2. **002_add_course_image.sql** - kolumna `main_image_url` w `courses`
3. **003_add_course_promotion.sql** - kolumny promocji w `courses`
4. **004_create_course_with_content.sql** - funkcja RPC tworzenia kursu
5. **005_update_course_with_content.sql** - funkcja RPC aktualizacji kursu
6. **006_setup_course_images_storage.sql** - bucket i polityki Storage
7. **007_fix_rls_recursion_users.sql** - poprawka polityk RLS bez rekurencji
8. **008_add_quiz_to_course_items.sql** - obsluga quizow w `course_items`
9. **009_add_admin_managed_course_certificates.sql** - certyfikaty nadawane przez admina

## Baza z juz dzialajacym projektem

- Jesli masz juz schemat z `init.sql`: uruchom brakujace migracje po **001**. W aktualnej wersji zwykle beda to **002**-**009**.
- Jesli brakuje tylko promocji: **003**, **004**, **005**.
- Jesli brakuje tylko zdjec kursow: **002**, **006** oraz ewentualnie **004**/**005**, jesli RPC nie zapisuje jeszcze `main_image_url`.
- Jesli chcesz wlaczyc admin-controlled certyfikaty na istniejacej bazie: uruchom co najmniej **007** i **009**.

## Dane testowe

Po migracjach mozesz uruchomic opcjonalnie:
`../seed_test_data.sql`
