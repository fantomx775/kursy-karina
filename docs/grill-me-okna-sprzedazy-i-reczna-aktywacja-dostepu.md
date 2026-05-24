# Grill-me: okna sprzedaży i ręczna aktywacja dostępu do kursu

Data: 2026-05-20  
Status: rekomendacja produktowo-techniczna przed implementacją

## Kontekst

Chcemy, żeby kurs był stale widoczny w panelu kursów, ale jego zakup był możliwy tylko w wybranych oknach sprzedażowych. Poza oknem sprzedaży kurs ma pozostać widoczny z komunikatem „Sprzedaż wkrótce”.

Dostęp do materiałów ma być niezależny od tego, czy sprzedaż jest aktualnie otwarta. Osoba, która już kupiła kurs i ma aktywny dostęp, korzysta z materiałów przez 12 miesięcy. Aktualizacje treści kursu są od razu widoczne dla wszystkich osób z aktywnym dostępem.

Nowa rzecz względem obecnej logiki aplikacji: sprzedaż i start dostępu nie zawsze są tym samym momentem. Możemy sprzedawać kurs od 1 do 14 czerwca, ale ręcznie aktywować dostęp 15 czerwca. Dopiero od aktywacji liczy się 12 miesięcy.

## Co już istnieje w aplikacji

- Kurs ma `status` jako `active` albo `inactive`.
- Publiczna lista kursów i strona kursu pokazują tylko kursy ze statusem `active`.
- Checkout pobiera tylko kursy ze statusem `active`.
- Dostęp użytkownika jest obecnie liczony z `order_items.access_expires_at`.
- Po zakupie aplikacja automatycznie ustawia `access_expires_at` jako data zakupu plus `access_duration_months`.
- Formularz kursu ma już pole „czas dostępu”, domyślnie 6 miesięcy, choć dla tego pomysłu rekomenduję ustawić dla wybranych kursów 12 miesięcy.
- Promocje mają osobne daty, ale dotyczą ceny, nie sprzedaży ani dostępu.

## Jak bym to rozegrał

Rozdzieliłbym trzy pojęcia, które dziś częściowo zlewają się w jedno:

1. Widoczność kursu: czy kurs jest opublikowany i widoczny publicznie.
2. Sprzedaż kursu: czy kurs można teraz kupić.
3. Dostęp do materiałów: czy konkretny użytkownik ma aktywny dostęp.

Najważniejsza decyzja: `status=active` nie powinien już znaczyć „można kupić”. Powinien znaczyć „kurs jest opublikowany i widoczny”. Możliwość zakupu powinna wynikać z osobnych okien sprzedażowych.

W MVP zrobiłbym to tak:

1. Dodać do kursu albo osobnej tabeli konfigurację okien sprzedaży.
2. Na stronie kursu zawsze pokazywać kurs opublikowany, ale przycisk zmieniać według stanu sprzedaży i dostępu.
3. Po zakupie w oknie sprzedaży tworzyć zakup z dostępem w stanie „oczekuje na aktywację”.
4. W panelu admina dodać widok osób, które kupiły kurs i czekają na aktywację.
5. Dodać akcję „Aktywuj dostęp” przy osobie oraz akcję zbiorczą „Aktywuj dostęp wszystkim z tego okna sprzedaży”.
6. W momencie aktywacji zapisać `access_activated_at`, `access_starts_at` i `access_expires_at = aktywacja + 12 miesięcy`.
7. Całą logikę nauki, dashboardu i assetów oprzeć na aktywnym dostępie, nie na samym zakupie.

## Rekomendowany model stanów

### Stan kursu

| Stan | Znaczenie | Czy widoczny publicznie? | Czy można kupić? |
|---|---|---:|---:|
| `published` / obecne `active` | Kurs jest pokazany w katalogu | Tak | Tylko jeśli jest aktywne okno sprzedaży |
| `draft` / obecne `inactive` | Kurs ukryty administracyjnie | Nie | Nie |

Rekomendacja: na start można wykorzystać obecne `active/inactive`, ale mentalnie traktować `active` jako „opublikowany”, nie jako „sprzedawany”.

### Stan sprzedaży

| Stan | Warunek | UI |
|---|---|---|
| Sprzedaż otwarta | Teraz mieści się w aktywnym oknie sprzedaży | „Dodaj do koszyka” / „Kup teraz” |
| Sprzedaż zamknięta | Brak aktywnego okna sprzedaży | „Sprzedaż wkrótce” |
| Dostęp aktywny | Użytkownik ma aktywowany, niewygasły dostęp | „Otwórz kurs” |
| Dostęp oczekuje | Użytkownik kupił, ale admin jeszcze nie aktywował dostępu | „Zakup potwierdzony. Dostęp zostanie aktywowany wkrótce.” |
| Dostęp wygasł | Użytkownik miał dostęp, ale minęła data końca | Jeśli sprzedaż otwarta: „Przedłuż dostęp”; jeśli zamknięta: „Sprzedaż wkrótce” |

### Stan dostępu użytkownika

| Stan | Warunek | Czy widzi materiały? |
|---|---|---:|
| Brak zakupu | Nie ma opłaconego zakupu | Nie |
| Oczekuje na aktywację | Zakup opłacony, `access_activated_at` puste | Nie |
| Aktywny | `access_activated_at` ustawione i `access_expires_at > now()` | Tak |
| Wygasły | `access_expires_at <= now()` | Nie |
| Cofnięty | Refund/chargeback/ręczne odebranie | Nie |

Rekomendacja: status „wygasły” liczyć z daty, nie zapisywać ręcznie jako stały stan. Dzięki temu nie potrzeba crona tylko po to, żeby odbierać dostęp po 12 miesiącach.

## Sesja grill-me: pytania, rekomendacje i odpowiedzi

| Pytanie | Dlaczego pytam | Moja rekomendacja | Odpowiedź robocza do przyjęcia |
|---|---|---|---|
| Czy kurs ma być widoczny, gdy nie można go kupić? | Obecnie `inactive` ukrywa kurs. Nowe wymaganie mówi o stałej widoczności. | Tak. Widoczność oddzielić od sprzedaży. | Kurs opublikowany jest widoczny zawsze; zamknięta sprzedaż zmienia tylko CTA i komunikat. |
| Czy `status=active` ma nadal oznaczać możliwość zakupu? | To jest źródło przyszłych błędów. | Nie. `active` powinien oznaczać „opublikowany”. | Zakup wynika z aktywnego okna sprzedaży, nie z samego statusu kursu. |
| Czy sprzedaż ma być ustawiana datami na poziomie kursu czy osobnymi oknami sprzedaży? | Jeden kurs może mieć wiele edycji sprzedaży. | Osobne okna sprzedaży. | Tworzymy np. okno 1-14 czerwca dla kursu X. Po nim można dodać kolejne okno. |
| Czy wystarczy jedno pole `sale_start` i `sale_end` na kursie? | To prostsze, ale słabsze przy kolejnych edycjach. | Nie jako docelowe rozwiązanie. | Dla MVP można zacząć od jednego aktywnego okna, ale struktura powinna obsługiwać wiele okien. |
| Co pokazujemy poza oknem sprzedaży? | Użytkownik nie powinien widzieć pustki ani błędu. | Komunikat „Sprzedaż wkrótce” i brak możliwości dodania do koszyka. | Kurs widoczny, cena może być widoczna, ale CTA jest zablokowane. |
| Czy komunikat o ponownym uruchomieniu sprzedaży trzymamy w opisie kursu? | Użytkowniczka wskazuje, że opis kursu ma być jedynym aktualizowanym elementem. | Krótkoterminowo tak, ale lepiej dodać osobne pole „komunikat sprzedażowy”. | MVP może korzystać z opisu. Docelowo dodałbym oddzielny tekst pod CTA, żeby nie mieszać opisu merytorycznego z informacją operacyjną. |
| Czy zakup ma od razu dawać dostęp do materiałów? | W nowym przykładzie sprzedaż kończy się 14 czerwca, a dostęp startuje 15 czerwca. | Nie zawsze. Okno sprzedaży powinno mieć tryb aktywacji. | Dla tego scenariusza zakup tworzy oczekujący dostęp, który admin aktywuje ręcznie. |
| Czy aktywacja ma być ręczna czy automatyczna w zaplanowanej dacie? | Automatyczna data zmniejsza pracę, ręczna daje kontrolę. | MVP: ręczna aktywacja plus akcja zbiorcza. Later: opcjonalna automatyczna aktywacja w zaplanowanej dacie. | Admin po zakończeniu sprzedaży klika „Aktywuj dostęp” przy osobie albo „Aktywuj wszystkim”. |
| Czy 12 miesięcy liczymy od zakupu czy od aktywacji? | To najważniejsza decyzja biznesowa. | Od aktywacji dostępu. | Jeśli zakup był 5 czerwca, a aktywacja 15 czerwca, dostęp trwa do 15 czerwca kolejnego roku. |
| Czy okres 12 miesięcy powinien być ustawieniem kursu? | Aplikacja ma już `access_duration_months`. | Tak. Dla tego kursu ustawić 12 miesięcy. | Nie kodować „12 miesięcy” na sztywno; używać istniejącego pola czasu dostępu. |
| Czy osoby, które kupiły kurs, tracą dostęp, gdy sprzedaż zostanie zamknięta? | To częsty błąd przy mieszaniu sprzedaży i dostępu. | Nie. | Zamknięcie sprzedaży blokuje nowe zakupy, ale nie rusza aktywnych dostępów. |
| Czy użytkownik z aktywnym dostępem widzi aktualizacje kursu? | Treść kursu może być zmieniana po zakupie. | Tak. | Dostęp dotyczy bieżącej wersji kursu; aktualizacje są widoczne wszystkim aktywnym uczestnikom. |
| Czy oczekujący użytkownik widzi kurs w dashboardzie? | Po zakupie potrzebuje potwierdzenia, że wszystko jest OK. | Tak, ale jako „Oczekuje na aktywację”. | Dashboard pokazuje kurs, status płatności i komunikat o planowanym uruchomieniu. |
| Czy oczekujący użytkownik może wejść na `/learn/...`? | Sam zakup nie powinien omijać daty startu. | Nie. | Strona nauki pokazuje ekran blokady: „Dostęp nie został jeszcze aktywowany”. |
| Czy oczekujący użytkownik może pobierać assety przez API? | UI nie wystarczy, trzeba chronić dane. | Nie. | API assetów i trasy nauki sprawdzają aktywny dostęp, nie sam zakup. |
| Czy osoba z wygasłym dostępem może kupić ponownie? | Wcześniejsze ustalenia mówiły o przedłużeniu po wygaśnięciu. | Tak, ale tylko gdy sprzedaż jest otwarta. | Jeśli sprzedaż zamknięta, widzi „Sprzedaż wkrótce”; jeśli otwarta, widzi „Przedłuż dostęp”. |
| Czy osoba z aktywnym dostępem może kupić drugi raz w oknie sprzedaży? | Może przypadkiem kupić dubel. | Nie. | Aktywny dostęp blokuje ponowny zakup. |
| Czy osoba oczekująca na aktywację może kupić drugi raz? | Też może zrobić duplikat. | Nie. | Oczekujący zakup blokuje ponowny zakup tego samego kursu. |
| Czy zakup po wygaśnięciu ma zachować stary postęp? | Postęp jest wartością dla użytkownika. | Tak. | Nowy dostęp reaktywuje możliwość nauki, ale nie czyści postępu ani certyfikatów. |
| Czy certyfikat po wygaśnięciu zostaje dostępny? | Wcześniej było to ustalone pozytywnie. | Tak. | Wygaśnięcie dostępu blokuje materiały, nie usuwa certyfikatu. |
| Czy refund ma cofać dostęp? | Płatność i dostęp muszą być spójne. | Tak. | Refund/chargeback powinien oznaczać brak aktywnego dostępu lub stan „cofnięty”. |
| Co z kuponami i promocjami? | Są już w aplikacji. | Zostawić niezależnie od okien sprzedaży. | Kupony i promocje liczą cenę w aktywnym oknie sprzedaży; nie decydują o samym otwarciu sprzedaży. |
| Czy okno sprzedaży powinno mieć planowaną datę startu kursu? | Pomaga w komunikatach i panelu admina. | Tak, opcjonalnie. | `planned_access_starts_at` można pokazać użytkownikowi, ale faktyczny start to ręczna aktywacja. |
| Czy ręczna aktywacja powinna działać per osoba czy zbiorczo? | Przy większej sprzedaży klikanie każdej osoby będzie męczące. | Oba warianty. | W MVP koniecznie akcja zbiorcza dla całego okna sprzedaży, a per osoba jako wyjątek/support. |
| Czy aktywacja zbiorcza ma aktywować wszystkie opłacone zakupy? | Trzeba uniknąć aktywacji nieopłaconych lub anulowanych. | Tylko opłacone i oczekujące. | Akcja pomija refundy, chargebacki, błędne płatności i już aktywowane osoby. |
| Czy admin może aktywować dostęp przed końcem sprzedaży? | Ręczna kontrola może być potrzebna. | Tak, ale UI powinno ostrzegać. | Admin może, bo to jej decyzja, ale panel pokazuje, że okno sprzedaży jeszcze trwa. |
| Czy można aktywować dostęp z datą wsteczną albo przyszłą? | Przydatne w korektach, ale komplikuje UI. | MVP: aktywacja „teraz”. Later: ręczna data startu. | Kliknięcie ustawia start na aktualny moment. |
| Co jeśli admin zapomni aktywować dostęp? | To realne ryzyko operacyjne. | Dodać w panelu admina licznik oczekujących dostępów. | W dashboardzie admina widoczna sekcja „Oczekują na aktywację”. |
| Czy potrzebujemy automatycznych maili? | Użytkownik powinien wiedzieć, co się stało po zakupie i aktywacji. | Nie blokowałbym MVP, ale zaprojektowałbym zdarzenia pod maile. | MVP może mieć komunikaty w aplikacji; później mail „Zakup potwierdzony” i „Dostęp aktywny”. |
| Czy „Sprzedaż wkrótce” ma być ręcznym tekstem czy wynikiem dat? | Daty ograniczają pomyłki. | Wynik dat plus opcjonalny tekst. | System sam wie, czy sprzedaż jest zamknięta; admin aktualizuje tylko tekst z terminem. |
| Czy cena ma być widoczna, gdy sprzedaż zamknięta? | Marketingowo może być różnie. | Tak, jeśli nie ma powodu jej ukrywać. | Cena może zostać widoczna, ale bez aktywnego CTA zakupu. |
| Czy koszyk powinien ponownie walidować okno sprzedaży? | Użytkownik mógł dodać kurs przed zamknięciem okna. | Tak. | Checkout jest źródłem prawdy: jeśli sprzedaż zamknięta, zakup nie przechodzi. |
| Co jeśli sprzedaż zamknie się w trakcie płatności Stripe? | Graniczny przypadek. | Honorować sesję utworzoną w trakcie aktywnego okna przez krótki czas. | Jeśli sesja Stripe powstała w oknie sprzedaży, weryfikacja może ją przyjąć; nowe sesje po zamknięciu są blokowane. |
| Czy aktywni uczestnicy widzą kurs, jeśli admin ustawi kurs jako nieaktywny? | `inactive` dziś ukrywa kurs publicznie. | Aktywni uczestnicy powinni zachować dostęp, chyba że kurs jest awaryjnie wyłączony. | Potrzebne są dwa pojęcia: ukrycie ze sprzedaży i awaryjne wyłączenie dostępu. Na MVP nie używać `inactive` do zamykania sprzedaży. |
| Czy potrzebujemy historii okien sprzedaży? | Przy raportach i supportcie będzie potrzebna. | Tak. | Każdy zakup powinien wiedzieć, z którego okna sprzedaży pochodzi. |
| Czy statystyki mają rozróżniać kupujących i aktywne dostępy? | Przy oczekujących dostępach to już nie to samo. | Tak. | Raport: kupili, oczekują, aktywni, wygasli, cofnięci. |
| Czy opis kursu wystarczy do informowania o kolejnej sprzedaży? | Użytkowniczka chce aktualizować tylko opis. | Wystarczy na start, ale osobne pole będzie czytelniejsze. | MVP: opis. Docelowo: „komunikat sprzedażowy” przy oknach sprzedaży. |
| Czy w panelu kursów kurs ma mieć status „Sprzedaż wkrótce” zamiast „Nieaktywny”? | Obecny status może mylić. | Tak. | Dla użytkownika nie pokazywać „Nieaktywny”; pokazywać stan sprzedaży albo dostępu. |
| Czy admin powinien widzieć datę końca dostępu przy każdej osobie? | To ważne dla supportu. | Tak. | Lista kupujących pokazuje: zakup, status dostępu, aktywacja, wygaśnięcie. |
| Czy wygasanie dostępu wymaga automatycznego zadania? | Może kusić cronem. | Nie dla samego blokowania. | Wystarczy sprawdzanie `access_expires_at > now()`. Cron może być potrzebny później do maili. |
| Czy aktualizacja treści kursu powinna resetować 12 miesięcy? | Użytkownik dostaje dostęp do bieżącej treści, ale to nie nowy zakup. | Nie. | Aktualizacje nie zmieniają daty wygaśnięcia. |

## Proponowane zmiany techniczne

### Dane

Rekomenduję dodać tabelę okien sprzedaży, np. `course_sale_windows`:

| Pole | Znaczenie |
|---|---|
| `id` | Id okna sprzedaży |
| `course_id` | Kurs, którego dotyczy okno |
| `sale_starts_at` | Początek sprzedaży |
| `sale_ends_at` | Koniec sprzedaży |
| `planned_access_starts_at` | Informacyjna planowana data startu kursu |
| `activation_mode` | Na start: `manual` |
| `public_note` | Opcjonalny komunikat pod CTA |
| `created_at`, `updated_at` | Audyt |

Na `order_items` rekomenduję dodać albo dostosować pola:

| Pole | Znaczenie |
|---|---|
| `sale_window_id` | Z którego okna sprzedaży pochodzi zakup |
| `access_activated_at` | Kiedy admin aktywował dostęp |
| `access_starts_at` | Od kiedy liczymy dostęp |
| `access_expires_at` | Do kiedy trwa dostęp; dla oczekujących może być puste |
| `access_revoked_at` | Cofnięcie dostępu po refundzie/chargebacku |

Uwaga techniczna: obecnie `access_expires_at` jest wymagane od razu po zakupie. Dla nowego modelu oczekującej aktywacji trzeba albo pozwolić na `NULL` do momentu aktywacji, albo stworzyć osobną tabelę dostępów. Przy obecnej strukturze najniższy koszt ma rozszerzenie `order_items`, ale docelowo czystsza byłaby tabela typu `course_access_grants`.

### Logika backendu

1. Lista kursów pokazuje kursy opublikowane, niezależnie od sprzedaży.
2. Strona kursu liczy stan sprzedaży z aktualnego okna sprzedaży.
3. Checkout pozwala kupić tylko kurs z otwartą sprzedażą.
4. Checkout blokuje zakup, jeśli użytkownik ma aktywny albo oczekujący dostęp do tego kursu.
5. Weryfikacja Stripe tworzy `order_items` w stanie oczekującym, jeśli okno wymaga ręcznej aktywacji.
6. Akcja admina aktywuje dostęp i wylicza datę końca.
7. Nauka, progres i assety są dostępne tylko przy aktywnym dostępie.

### UI użytkownika

| Sytuacja | CTA / komunikat |
|---|---|
| Brak zakupu, sprzedaż otwarta | „Dodaj do koszyka” |
| Brak zakupu, sprzedaż zamknięta | „Sprzedaż wkrótce” |
| Zakup opłacony, dostęp oczekuje | „Dostęp zostanie aktywowany wkrótce” |
| Dostęp aktywny | „Otwórz kurs” + „Dostęp do DD.MM.RRRR” |
| Dostęp wygasł, sprzedaż otwarta | „Przedłuż dostęp” |
| Dostęp wygasł, sprzedaż zamknięta | „Sprzedaż wkrótce” |

### UI admina

Najważniejszy ekran do dodania:

- Lista okien sprzedaży przy kursie.
- Liczba zakupów w oknie.
- Liczba osób oczekujących na aktywację.
- Przycisk „Aktywuj wszystkim”.
- Lista osób z przyciskiem „Aktywuj dostęp”.
- Kolumny: imię, nazwisko, e-mail, data zakupu, status płatności, status dostępu, data aktywacji, data wygaśnięcia.

## Minimalny zakres MVP

1. Kurs opublikowany pozostaje widoczny poza sprzedażą.
2. Admin ustawia okno sprzedaży: od kiedy, do kiedy, opcjonalnie planowany start.
3. Poza oknem sprzedaży CTA pokazuje „Sprzedaż wkrótce”.
4. Checkout twardo blokuje zakup poza oknem sprzedaży.
5. Zakup w oknie sprzedaży tworzy oczekujący dostęp.
6. Admin może aktywować dostęp per osoba i zbiorczo.
7. 12 miesięcy liczy się od aktywacji, nie od zakupu.
8. Zamknięcie sprzedaży nie odbiera dostępu aktywnym uczestnikom.
9. Aktywny dostęp daje dostęp do zawsze aktualnej treści kursu.
10. Dashboard użytkownika pokazuje stany: oczekuje, aktywny do, wygasł.

## Co odłożyłbym na później

- Automatyczna aktywacja w zaplanowanej dacie.
- Automatyczne maile przed startem kursu i przed wygaśnięciem dostępu.
- Osobne pole „komunikat sprzedażowy” zamiast ręcznej edycji opisu kursu.
- Zaawansowane raporty cohort sprzedażowych.
- Ręczna zmiana daty startu/końca dostępu po aktywacji.
- Waitlista albo formularz zapisu na powiadomienie o kolejnej sprzedaży.

## Największe ryzyka

1. Pomylenie „kurs opublikowany” ze „sprzedaż otwarta”. To trzeba rozdzielić w nazwach, UI i backendzie.
2. Umożliwienie wejścia do materiałów po samym zakupie, przed aktywacją.
3. Blokowanie aktywnych użytkowników tylko dlatego, że sprzedaż została zamknięta.
4. Brak walidacji checkoutu po stronie serwera.
5. Brak widocznego panelu oczekujących aktywacji, przez co admin może zapomnieć aktywować kurs.

## Moja decyzja końcowa

Wprowadziłbym ten feature jako model cohortowy: kurs jest opublikowany stale, sprzedaż działa w oknach, a dostęp jest osobnym uprawnieniem aktywowanym ręcznie przez admina. Wtedy przykład z czerwcem działa naturalnie:

1. Kurs jest widoczny cały czas.
2. Od 1 do 14 czerwca można kupić.
3. Po zakupie użytkownik widzi, że dostęp czeka na aktywację.
4. 15 czerwca admin klika „Aktywuj wszystkim”.
5. Każdy aktywowany uczestnik ma dostęp przez 12 miesięcy od aktywacji.
6. Jeśli w sierpniu sprzedaż jest zamknięta, aktywni uczestnicy nadal normalnie korzystają z kursu.

