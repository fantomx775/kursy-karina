# Pytania do PM: dostęp do kursu na określony czas

## Kontekst

Chcemy dodać możliwość ustawienia czasu dostępu do kursu podczas tworzenia kursu, np. 6 miesięcy. Obecnie system traktuje dostęp jako stały: użytkownik ma dostęp, jeśli ma opłacone zamówienie z danym kursem. W UI istnieje tekst „Dostęp po zakupie: 12 miesięcy”, ale nie jest on obecnie egzekwowany przez logikę dostępu.

Cel dokumentu: zebrać decyzje PM przed implementacją, żeby uniknąć niejasności przy koszyku, dashboardzie, wygasaniu dostępu, ponownym zakupie, certyfikatach i migracji istniejących zakupów.

## 1. Model produktu

| Pytanie | Dlaczego pytamy | Rekomendacja | Odpowiedź PM |
|---|---|---|---|
| Czy każdy kurs ma mieć własny czas dostępu ustawiany przy tworzeniu kursu? | To wpływa na formularz tworzenia kursu i strukturę danych. | Tak. Dodać pole „Czas dostępu” na poziomie kursu. | |
| Czy ma istnieć opcja „bezterminowo / dożywotnio”? | Część kursów może być sprzedawana bez limitu czasu. | Nie. Kursy sprzedawane klientom nigdy nie są bezterminowe; bezterminowy podgląd ma wyłącznie admin. | Potwierdzone: nie, tylko admin ma bezterminowy podgląd. |
| Jakie jednostki obsługujemy: dni, miesiące, lata? | Miesiące bywają różnej długości; dni są precyzyjniejsze, ale mniej wygodne marketingowo. | Dla PM/admina: miesiące. Technicznie można przeliczać i zapisywać datę wygaśnięcia przy zakupie. | |
| Jakie wartości mają być dozwolone? | Walidacja formularza i spójność oferty. | Presety: 1, 3, 6, 12 miesięcy itd. Bez opcji bezterminowej dla kursu. | Potwierdzone: 1, 3, 6, 12 miesięcy itd.; nigdy bezterminowo. |
| Jaka ma być wartość domyślna przy tworzeniu nowego kursu? | Bez domyślnej wartości admin może przypadkowo utworzyć kurs z błędną ofertą. | 6 miesięcy. | Potwierdzone: 6 miesięcy. |
| Czy można zmieniać czas dostępu po utworzeniu kursu? | To wpływa na edycję kursu i konsekwencje dla istniejących klientów. | Tak, ale zmiana dotyczy tylko nowych zakupów, nie istniejących dostępów. | Potwierdzone: tak, tylko nowe zakupy. |
| Czy status kursu „nieaktywny” ma odbierać dostęp już kupującym? | Obecnie status blokuje zakup/stronę publiczną, ale nie jest jasną regułą dla kupionych kursów. | Nie. Nieaktywny kurs nie powinien być sprzedawany, ale aktywni kupujący powinni zachować dostęp do końca swojego okresu. | |

## 2. Moment rozpoczęcia i zakończenia dostępu

| Pytanie | Dlaczego pytamy | Rekomendacja | Odpowiedź PM |
|---|---|---|---|
| Od kiedy liczymy czas dostępu: od zakupu, od pierwszego otwarcia kursu, czy od aktywacji kursu? | To najważniejsza decyzja biznesowa. | Od zakupu, czyli od potwierdzenia płatności. Jest to najprostsze i najbardziej przewidywalne. | Potwierdzone: od potwierdzenia zakupu. |
| Czy liczymy od momentu potwierdzenia płatności w Stripe, czy od utworzenia zamówienia w naszej bazie? | Mogą wystąpić opóźnienia między płatnością a zapisem zamówienia. | Od utworzenia opłaconego dostępu w naszej bazie po pozytywnej weryfikacji Stripe. | |
| Jak dokładnie rozumieć „6 miesięcy”? | Przykład: zakup 31 stycznia + 1 miesiąc jest niejednoznaczny. | Używać kalendarzowego dodawania miesięcy w bazie, a w UI pokazywać konkretną datę wygaśnięcia. | |
| Do której godziny trwa dostęp w dniu wygaśnięcia? | Ważne dla reklamacji i komunikatów. | Do końca dnia w strefie Europe/Warsaw albo do dokładnej godziny zakupu. Preferuję dokładną godzinę zakupu, ale w UI pokazywać datę. | |
| Jaką strefę czasową stosujemy w komunikatach? | Użytkownicy są w Polsce, baza zapisuje timestampy. | Komunikaty w UI: Europe/Warsaw. Dane techniczne: timestamp z timezone. | |

## 3. Zakup, ponowny zakup i przedłużanie

| Pytanie | Dlaczego pytamy | Rekomendacja | Odpowiedź PM |
|---|---|---|---|
| Czy użytkownik może ponownie kupić kurs, jeśli obecny dostęp jeszcze trwa? | Obecnie system blokuje ponowny zakup kupionego kursu. | Nie. Aktywny dostęp blokuje ponowny zakup. | Potwierdzone: aktywny dostęp blokuje zakup. |
| Czy użytkownik może kupić kurs ponownie po wygaśnięciu dostępu? | Bez tego wygasły kurs byłby nieodnawialny. | Tak. Po wygaśnięciu pokazujemy CTA „Przedłuż dostęp” i sprzedajemy dostęp ponownie w tej samej cenie. | Potwierdzone: tak, jako przedłużenie w tej samej cenie. |
| Jeśli użytkownik kupi ponownie po wygaśnięciu, czy zachowuje stary postęp? | To wpływa na motywację i dane w dashboardzie. | Tak, postęp i historia zostają zachowane. Nowy zakup odnawia tylko okres dostępu. | |
| Jeśli PM chce przedłużenie aktywnego dostępu, od kiedy liczyć nowy okres? | Można liczyć od dzisiaj albo od starej daty wygaśnięcia. | Nie dotyczy MVP, bo aktywny dostęp blokuje zakup. Przedłużenie jest dostępne dopiero po wygaśnięciu. | Potwierdzone: aktywny dostęp blokuje zakup; wygasły można przedłużyć. |
| Czy koszyk powinien pozwolić dodać kurs, który użytkownik ma aktywny? | Obecnie zakupione kursy są pomijane przy checkout. | Nie. Aktywne dostępy blokują zakup. Wygasłe dostępy pozwalają kupić ponownie. | |
| Co zapisujemy przy zakupie, jeśli później admin zmieni czas dostępu kursu? | Trzeba rozstrzygnąć, czy klient kupił według starej czy nowej oferty. | Zapisujemy snapshot okresu dostępu i datę wygaśnięcia na pozycji zakupu. Zmiany kursu dotyczą tylko przyszłych zakupów. | Potwierdzone: tak. |
| Czy zniżki i kupony działają normalnie przy ponownym zakupie po wygaśnięciu? | Może być ograniczenie biznesowe. | Tak, traktować odnowienie po wygaśnięciu jak nowy zakup. | |

## 4. Widoczność w UI

| Pytanie | Dlaczego pytamy | Rekomendacja | Odpowiedź PM |
|---|---|---|---|
| Gdzie pokazujemy czas dostępu przed zakupem? | Użytkownik powinien znać warunki przed płatnością. | Strona kursu, karta zakupu, koszyk i checkout line item/opis. | |
| Jaką treść pokazać dla kursów czasowych? | Copy musi być jasne i zgodne z ofertą. | „Dostęp po zakupie: 6 miesięcy” oraz po zakupie „Dostęp aktywny do: 17.11.2026”. | |
| Jaką treść pokazać dla kursów bezterminowych? | Unikamy daty wygaśnięcia, gdy jej nie ma. | Nie dotyczy kursów klienckich. Tylko admin ma bezterminowy podgląd techniczny. | Potwierdzone: kursy nie są bezterminowe. |
| Co pokazujemy w dashboardzie przy aktywnym dostępie? | Użytkownik musi widzieć, ile czasu zostało. | Badge/status: „Aktywny do: DD.MM.RRRR”. Dla admina można pokazać „Podgląd admina”. | |
| Co pokazujemy w dashboardzie po wygaśnięciu dostępu? | Obecnie kurs znika albo jest traktowany jako zakupiony; trzeba ustalić. | Pokazać kurs jako „Dostęp wygasł” z przyciskiem „Przedłuż dostęp”. To lepsze niż „Kup ponownie”, bo użytkownik już zna kurs i zachowuje postęp/certyfikat. | Potwierdzone: po wygaśnięciu widać kurs jako wygasły; CTA: „Przedłuż dostęp”. |
| Czy wygasły kurs ma być ukryty z „Moje kursy”? | Ukrycie utrudnia odnowienie i kontakt supportowy. | Nie ukrywać. Pokazać osobny status wygasłego dostępu. | |
| Co widzi użytkownik po wejściu na `/learn/...` z wygasłym dostępem? | Potrzebny jasny stan blokady. | Ekran „Dostęp wygasł” z datą wygaśnięcia i CTA „Przedłuż dostęp”. | |
| Czy wysyłamy ostrzeżenia przed wygaśnięciem dostępu? | To może zwiększyć odnowienia, ale wymaga maili/cron. | Nie w pierwszym zakresie. Zostawić jako follow-up. | |

## 5. Postęp, certyfikaty i materiały

| Pytanie | Dlaczego pytamy | Rekomendacja | Odpowiedź PM |
|---|---|---|---|
| Czy po wygaśnięciu dostępu użytkownik zachowuje postęp kursu? | Dane postępu są osobną tabelą i mogą zostać bez aktywnego dostępu. | Tak. Postęp zostaje, ale nie daje dostępu do materiałów. | Potwierdzone: tak. |
| Czy po wygaśnięciu użytkownik może pobrać wcześniej przyznany certyfikat? | Certyfikat może być dowodem ukończenia, niezależnym od dostępu. | Tak, certyfikat pozostaje dostępny. | Potwierdzone: tak. |
| Czy można przyznać certyfikat po wygaśnięciu dostępu? | Admin może obsługiwać zaległe przypadki. | Tak, admin może przyznać certyfikat, jeśli PM nie widzi ryzyka. | |
| Czy użytkownik może kontynuować quizy i oznaczać lekcje po wygaśnięciu? | To jest część dostępu do kursu. | Nie. Po wygaśnięciu blokujemy interakcje edukacyjne. | |
| Czy preview/free lesson ma działać po wygaśnięciu? | `course_items` mają pole `is_preview`, ale obecny flow może go nie wykorzystywać w pełni. | Tak, jeśli preview działa publicznie. Nie powinno wymagać aktywnego dostępu. | |
| Czy linki do zasobów kursu/API assetów mają być blokowane po wygaśnięciu? | Samo zablokowanie strony nauki może nie wystarczyć. | Tak. Reguła dostępu musi obowiązywać także API/asset routes, nie tylko UI. | |

## 6. Admin, support i wyjątki

| Pytanie | Dlaczego pytamy | Rekomendacja | Odpowiedź PM |
|---|---|---|---|
| Czy admin ma zawsze bezterminowy dostęp do wszystkich kursów? | Obecnie admin ma dostęp specjalny. | Tak. Admin nie powinien być ograniczany datą dostępu. | Potwierdzone: tak. |
| Czy potrzebujemy ręcznego przyznania kursu użytkownikowi na X czasu przez admina? | Nazwa „przyznawanie kursu” może oznaczać też grant supportowy, nie tylko ustawienie czasu przy kursie. | Nie wdrażać w MVP. Feature dotyczy ustawiania czasu dostępu przy kursie i zakupie. | Potwierdzone: nie wdrażać teraz. |
| Czy support/admin może ręcznie przedłużyć albo skrócić dostęp konkretnego użytkownika? | Przydatne dla reklamacji i wyjątków. | Nie wdrażać w MVP. | Potwierdzone: nie wdrażać teraz. |
| Czy refund ma odbierać dostęp natychmiast? | Obecnie mamy status zamówienia, ale trzeba ustalić politykę. | Tak, jeśli zamówienie przestaje być `paid`, dostęp powinien zniknąć. | |
| Co z chargebackiem lub ręcznym anulowaniem zamówienia? | Potrzebna spójna reguła z refundem. | Traktować jak brak opłaconego dostępu. | |

## 7. Istniejące dane i migracja

| Pytanie | Dlaczego pytamy | Rekomendacja | Odpowiedź PM |
|---|---|---|---|
| Jaki czas dostępu przypisać istniejącym kursom? | Po migracji każde aktywne/płatne szkolenie musi mieć spójną ofertę. | 6 miesięcy jako nowa wartość domyślna, chyba że konkretny kurs zostanie ustawiony inaczej. | Potwierdzone: domyślnie 6 miesięcy. |
| Jaki dostęp przypisać istniejącym zakupom? | Najbardziej ryzykowna decyzja dla obecnych klientów. | Brak klientów produkcyjnych, tylko dane testowe, więc nie wymaga decyzji PM/legal. Dane testowe można zresetować albo zmigrować technicznie. | Potwierdzone: nie przejmować się, nie jesteśmy na prod. |
| Czy wygaszamy istniejące zakupy, które według nowej reguły miałyby już minąć? | Może wywołać reklamacje. | Nie dotyczy produkcji; istnieją tylko dane testowe. | Potwierdzone: nie ma klientów. |
| Czy istniejący tekst „Dostęp po zakupie: 12 miesięcy” był widoczny klientom w produkcji? | Jeśli tak, PM może uznać 12 miesięcy za obowiązującą obietnicę. | Nie dotyczy, bo nie ma klientów produkcyjnych. Przy wdrożeniu zmieniamy komunikat na właściwy czas kursu. | Potwierdzone: nie przejmować się danymi historycznymi. |
| Czy mamy poinformować obecnych użytkowników o zmianie zasad? | Wymaganie biznesowe/prawne. | Nie dotyczy, bo nie ma klientów produkcyjnych. | Potwierdzone: nie dotyczy. |

## 8. Raportowanie i analityka

| Pytanie | Dlaczego pytamy | Rekomendacja | Odpowiedź PM |
|---|---|---|---|
| Czy statystyki kursu mają liczyć użytkowników z wygasłym dostępem jako kupujących? | Obecne statystyki bazują na zakupach. | Liczyć osobno: „kupujący łącznie” i „aktywni z dostępem”. | |
| Czy panel kursantów ma pokazywać datę wygaśnięcia dostępu? | Admin/support potrzebuje tej informacji. | Tak, przy każdym kursie kursanta. | |
| Czy chcemy filtrować kursantów po statusie dostępu: aktywny/wygasły/bezterminowy? | Może być użyteczne, ale zwiększa zakres. | Nie w pierwszym zakresie; wystarczy status w szczegółach kursanta. | |

## 9. Proponowany minimalny zakres MVP

Do potwierdzenia przez PM:

1. W formularzu tworzenia/edycji kursu admin ustawia czas dostępu: 1, 3, 6, 12 miesięcy itd. Kurs nigdy nie jest bezterminowy dla klienta.
2. Domyślna wartość nowego kursu: 6 miesięcy.
3. Czas dostępu liczy się od potwierdzenia zakupu.
4. Przy zakupie zapisujemy konkretną datę wygaśnięcia dla danej pozycji zamówienia.
5. Zmiana czasu dostępu kursu wpływa tylko na nowe zakupy.
6. Aktywny dostęp blokuje ponowny zakup. Wygasły dostęp pozwala przedłużyć dostęp w tej samej cenie.
7. W UI po wygaśnięciu pokazujemy CTA „Przedłuż dostęp”.
8. Po wygaśnięciu użytkownik widzi kurs w dashboardzie jako wygasły, zachowuje postęp i certyfikat, ale nie ma dostępu do materiałów.
9. Admin ma bezterminowy podgląd/dostęp techniczny.
10. Istniejące zakupy nie są problemem, bo nie ma jeszcze klientów produkcyjnych; mamy tylko dane testowe.

## 10. Decyzje blokujące implementację

Status: najważniejsze decyzje są już potwierdzone.

1. Istniejące zakupy: nie blokują implementacji, bo nie ma klientów produkcyjnych; są tylko dane testowe.
2. Kursy bezterminowe: nie. Bezterminowy dostęp/podgląd dotyczy tylko admina.
3. Ponowny zakup po wygaśnięciu: tak, jako „Przedłuż dostęp”, w tej samej cenie.
4. Certyfikat po wygaśnięciu: pozostaje dostępny.
5. Ręczne przyznawanie/przedłużanie dostępu przez admina: nie wdrażać teraz.

Założenia przyjęte do implementacji dla pytań bez wpisanej odpowiedzi:

1. Admin może wpisać dowolną dodatnią liczbę miesięcy; UI nie ogranicza się do zamkniętej listy presetów.
2. Dostęp wygasa o dokładnej godzinie wynikającej z momentu potwierdzenia zakupu; w UI pokazujemy czytelną datę.
3. MVP aktualizuje dashboard użytkownika, blokadę dostępu do nauki i assetów, panel kursanta oraz statystyki kursów.
