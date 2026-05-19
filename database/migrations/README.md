# Migracje bazy danych

Uruchamiaj w **Supabase SQL Editor**.

## Jedno uruchomienie

W katalogu `database/` jest plik **`full_schema.sql`** - idempotentny: najpierw usuwa tabele, typy, funkcje i polityki, potem tworzy wszystko od zera. Historycznym zrodlem prawdy sa jednak migracje ponizej, bo zawieraja najnowsze poprawki RLS i hardening dostepu do RPC/Storage. Po migracjach uruchom **`seed_test_data.sql`**, jesli chcesz dane testowe.

## Migracje pojedynczo (od zera)

W podanej kolejnosci:

1. **001_initial_schema.sql** - tabele, enumy, indeksy, triggery, RLS
2. **002_add_course_image.sql** - kolumna `main_image_url` w `courses`
3. **003_add_course_promotion.sql** - kolumny promocji w `courses`
4. **004_create_course_with_content.sql** - funkcja RPC tworzenia kursu
5. **005_update_course_with_content.sql** - funkcja RPC aktualizacji kursu
6. **006_setup_course_images_storage.sql** - bucket i polityki Storage
7. **007_fix_rls_recursion_users.sql** - poprawka polityk RLS bez rekurencji
8. **008_add_quiz_to_course_items.sql** - wartosc enuma `quiz`
9. **009_add_quiz_course_item_payload.sql** - payload quizow i RPC z quizami
10. **010_add_admin_managed_course_certificates.sql** - certyfikaty nadawane przez admina
11. **011_harden_rls_and_rpc_access.sql** - hardening funkcji RPC i Storage
12. **012_move_rls_helper_to_private_schema.sql** - prywatny helper dla RLS
13. **013_optimize_rls_policies_and_fk_indexes.sql** - optymalizacja polityk RLS i indeksy FK
14. **014_add_course_certificate_template_key.sql** - wybor szablonu certyfikatu per kurs
15. **015_add_certificate_storage_and_generation_state.sql** - storage i stan generowania certyfikatow
16. **015_add_course_access_duration.sql** - czas dostepu do kursu i data wygasniecia pozycji zamowienia
17. **016_tune_certificate_template_indexes_and_policies.sql** - indeksy i polityki dla szablonow certyfikatow
18. **017_add_coupon_course_rules.sql** - przypisanie kuponow do kursow i wymagane kursy w koszyku

## Baza z juz dzialajacym projektem

- Jesli masz juz schemat z `init.sql`: uruchom brakujace migracje po **001**. W aktualnej wersji zwykle beda to **002**-**016**.
- Jesli brakuje tylko promocji: **003**, **004**, **005**.
- Jesli brakuje tylko zdjec kursow: **002**, **006** oraz ewentualnie **004**/**005**, jesli RPC nie zapisuje jeszcze `main_image_url`.
- Jesli chcesz wlaczyc admin-controlled certyfikaty na istniejacej bazie: uruchom co najmniej **007** i **010**.
- Jesli chcesz wlaczyc czasowy dostep do kursow: uruchom **015_add_course_access_duration.sql**.

## Dane testowe

Po migracjach mozesz uruchomic opcjonalnie:
`../seed_test_data.sql`
