# Produktowo: okna sprzedaży i dostęp do kursu

Data: 2026-05-20  
Odbiorca: PM, właścicielka produktu, support  
Cel: opisać, jak funkcja ma działać z perspektywy użytkownika i administracji, bez szczegółów technicznych.

## Krótko

Kurs może być widoczny w katalogu przez cały czas, ale nie zawsze musi być dostępny do zakupu.

Sprzedaż kursu działa w wybranych oknach czasowych, np. od 1 do 14 czerwca. Poza takim oknem użytkownik nadal widzi kurs, ale zamiast zakupu widzi komunikat „Sprzedaż wkrótce”.

Zakup kursu i dostęp do materiałów to dwie różne rzeczy:

- zakup oznacza, że użytkownik opłacił udział,
- dostęp oznacza, że może wejść do materiałów kursu.

W scenariuszu sprzedaży przedsprzedażowej użytkownik może kupić kurs wcześniej, ale dostęp do materiałów dostaje dopiero wtedy, gdy administracja ręcznie go aktywuje. Od tej aktywacji liczy się 12 miesięcy dostępu.

## Główne zasady

1. Kurs opublikowany jest widoczny w katalogu kursów cały czas.
2. Możliwość zakupu zależy od tego, czy trwa okno sprzedaży.
3. Poza oknem sprzedaży kurs pokazuje komunikat „Sprzedaż wkrótce”.
4. Osoba, która już ma aktywny dostęp, może korzystać z kursu niezależnie od tego, czy sprzedaż jest otwarta czy zamknięta.
5. Dostęp trwa 12 miesięcy od momentu aktywacji dostępu.
6. Aktualizacje treści kursu są widoczne dla wszystkich osób z aktywnym dostępem.
7. Po 12 miesiącach dostęp do materiałów wygasa automatycznie.
8. Po wygaśnięciu użytkownik zachowuje historię zakupu, postęp i certyfikat, ale nie może już korzystać z materiałów.
9. Przedłużenie dostępu jest możliwe tylko wtedy, gdy kurs jest aktualnie dostępny w sprzedaży.
10. Aktywny albo oczekujący dostęp blokuje ponowny zakup tego samego kursu.

## Słownik

**Kurs widoczny**  
Kurs pojawia się w katalogu i ma swoją stronę opisu.

**Sprzedaż otwarta**  
Użytkownik może kupić kurs.

**Sprzedaż zamknięta**  
Kurs jest widoczny, ale nie można go kupić. Użytkownik widzi „Sprzedaż wkrótce”.

**Zakup opłacony**  
Płatność została zakończona poprawnie.

**Dostęp oczekuje na aktywację**  
Użytkownik kupił kurs, ale administracja jeszcze nie uruchomiła dostępu do materiałów.

**Dostęp aktywny**  
Użytkownik może korzystać z materiałów kursu.

**Dostęp wygasły**  
Minęło 12 miesięcy od aktywacji. Użytkownik nie ma już dostępu do materiałów.

## Jak wygląda podstawowy scenariusz

Przykład:

- sprzedaż trwa od 1 do 14 czerwca,
- kurs startuje 15 czerwca,
- dostęp trwa 12 miesięcy.

Przebieg:

1. Przed 1 czerwca kurs jest widoczny, ale pokazuje „Sprzedaż wkrótce”.
2. Od 1 do 14 czerwca użytkownicy mogą kupić kurs.
3. Po zakupie użytkownik widzi informację, że zakup jest potwierdzony, a dostęp zostanie aktywowany wkrótce.
4. Do 15 czerwca użytkownik nie widzi jeszcze materiałów kursu.
5. 15 czerwca administracja aktywuje dostęp uczestnikom.
6. Od momentu aktywacji użytkownik ma dostęp przez 12 miesięcy.
7. Jeśli sprzedaż zostanie zamknięta po 14 czerwca, osoby z aktywnym dostępem nadal normalnie korzystają z kursu.

## Drzewo decyzyjne: co widzi użytkownik na stronie kursu

### 1. Czy użytkownik ma aktywny dostęp?

Jeśli tak:

- widzi przycisk „Otwórz kurs”,
- widzi informację „Dostęp aktywny do: DD.MM.RRRR”,
- może korzystać z materiałów,
- nie może kupić kursu drugi raz.

Jeśli nie, przechodzimy dalej.

### 2. Czy użytkownik kupił kurs, ale dostęp czeka na aktywację?

Jeśli tak:

- widzi informację „Zakup potwierdzony”,
- widzi komunikat „Dostęp zostanie aktywowany wkrótce”,
- nie widzi materiałów kursu,
- nie może kupić kursu drugi raz,
- jeśli znana jest planowana data startu, można pokazać „Planowany start: DD.MM.RRRR”.

Jeśli nie, przechodzimy dalej.

### 3. Czy użytkownik miał kurs, ale dostęp wygasł?

Jeśli tak i sprzedaż jest otwarta:

- widzi przycisk „Przedłuż dostęp”,
- po zakupie przechodzi przez standardowy proces nowego dostępu,
- po aktywacji znowu ma 12 miesięcy dostępu,
- jego poprzedni postęp zostaje zachowany.

Jeśli tak i sprzedaż jest zamknięta:

- widzi komunikat „Sprzedaż wkrótce”,
- nie może od razu przedłużyć dostępu,
- może wrócić, gdy sprzedaż zostanie ponownie otwarta.

Jeśli nie miał wcześniej dostępu, przechodzimy dalej.

### 4. Czy sprzedaż jest aktualnie otwarta?

Jeśli tak:

- użytkownik widzi przycisk „Dodaj do koszyka” albo „Kup teraz”,
- może kupić kurs.

Jeśli nie:

- użytkownik widzi „Sprzedaż wkrótce”,
- nie może kupić kursu.

## Drzewo decyzyjne: co dzieje się po zakupie

### 1. Czy płatność się udała?

Jeśli nie:

- użytkownik nie dostaje kursu,
- nie pojawia się oczekujący dostęp,
- może spróbować kupić ponownie, o ile sprzedaż nadal jest otwarta.

Jeśli tak:

- zakup zostaje potwierdzony,
- użytkownik trafia do stanu „oczekuje na aktywację”.

### 2. Czy kurs ma startować od razu czy po ręcznej aktywacji?

Rekomendowany scenariusz dla tego produktu: ręczna aktywacja.

Po zakupie:

- użytkownik ma potwierdzony zakup,
- nie ma jeszcze dostępu do materiałów,
- czeka na aktywację przez administrację.

### 3. Kiedy zaczyna się 12 miesięcy?

12 miesięcy zaczyna się dopiero w momencie aktywacji dostępu.

Przykłady:

- zakup 5 czerwca, aktywacja 15 czerwca: dostęp do 15 czerwca kolejnego roku,
- zakup 14 czerwca, aktywacja 15 czerwca: dostęp do 15 czerwca kolejnego roku,
- zakup 1 lipca, aktywacja 3 lipca: dostęp do 3 lipca kolejnego roku.

## Drzewo decyzyjne: przedłużenie dostępu

### 1. Czy użytkownik ma jeszcze aktywny dostęp?

Jeśli tak:

- nie może przedłużyć dostępu przez zakup kolejnej sztuki kursu,
- widzi „Otwórz kurs”,
- system nie powinien pozwolić na podwójny zakup.

Rekomendacja produktowa: aktywnego dostępu nie przedłużamy samodzielnie przez użytkownika. Unikamy bałaganu typu „kupiłam drugi raz, ale od kiedy liczy się nowy rok?”.

### 2. Czy dostęp już wygasł?

Jeśli tak:

- użytkownik może przedłużyć dostęp tylko wtedy, gdy sprzedaż jest aktualnie otwarta,
- CTA powinno brzmieć „Przedłuż dostęp”, a nie „Kup kurs”, bo użytkownik już zna ten kurs,
- po zakupie i aktywacji dostaje nowy 12-miesięczny okres,
- zachowuje dotychczasowy postęp i certyfikaty.

### 3. Czy sprzedaż jest zamknięta?

Jeśli tak:

- użytkownik z wygasłym dostępem nie może odnowić dostępu od razu,
- widzi „Sprzedaż wkrótce”,
- opis kursu albo komunikat przy kursie powinien informować, kiedy planowana jest kolejna sprzedaż.

## Co widzi użytkownik w panelu „Moje kursy”

### Dostęp oczekuje na aktywację

Karta kursu powinna pokazywać:

- tytuł kursu,
- status „Zakup potwierdzony”,
- status „Dostęp oczekuje na aktywację”,
- opcjonalnie planowaną datę startu,
- brak przycisku „Otwórz kurs”.

Przykładowy komunikat:

„Twój zakup został potwierdzony. Dostęp do kursu zostanie aktywowany w wybranym terminie.”

### Dostęp aktywny

Karta kursu powinna pokazywać:

- tytuł kursu,
- status „Dostęp aktywny”,
- datę końca dostępu,
- przycisk „Otwórz kurs” albo „Kontynuuj naukę”,
- postęp kursu.

Przykładowy komunikat:

„Dostęp aktywny do: 15.06.2027.”

### Dostęp wygasł

Karta kursu powinna pokazywać:

- tytuł kursu,
- status „Dostęp wygasł”,
- datę, do której dostęp był aktywny,
- zachowany postęp,
- dostępny certyfikat, jeśli został wcześniej przyznany,
- przycisk „Przedłuż dostęp”, jeśli sprzedaż jest otwarta,
- komunikat „Sprzedaż wkrótce”, jeśli sprzedaż jest zamknięta.

## Co widzi użytkownik po wejściu do materiałów kursu

### Ma aktywny dostęp

Może wejść do kursu i korzystać z materiałów.

### Ma zakup, ale dostęp oczekuje

Nie widzi materiałów. Zamiast tego widzi ekran informacyjny:

„Dostęp do kursu nie został jeszcze aktywowany. Wróć w dniu startu kursu.”

Jeśli znana jest data:

„Planowany start kursu: 15.06.2026.”

### Dostęp wygasł

Nie widzi materiałów. Zamiast tego widzi ekran:

„Twój dostęp do kursu wygasł.”

Jeśli sprzedaż jest otwarta:

- widzi przycisk „Przedłuż dostęp”.

Jeśli sprzedaż jest zamknięta:

- widzi „Sprzedaż wkrótce”.

## Co robi administracja

### Przygotowanie kursu

Administracja:

1. Publikuje kurs, żeby był widoczny.
2. Ustawia okno sprzedaży, np. od 1 do 14 czerwca.
3. W opisie kursu albo komunikacie sprzedażowym wpisuje informację o planowanym starcie.
4. Ustawia czas dostępu: 12 miesięcy.

### W trakcie sprzedaży

Administracja widzi:

- ile osób kupiło kurs,
- kto ma zakup potwierdzony,
- kto czeka na aktywację,
- kiedy kończy się okno sprzedaży.

### Po zakończeniu sprzedaży

Administracja może:

- aktywować dostęp wszystkim osobom z danego okna sprzedaży,
- aktywować dostęp pojedynczej osobie,
- zostawić wybrane osoby bez aktywacji, jeśli zakup wymaga wyjaśnienia.

Rekomendacja: potrzebny jest przycisk zbiorczy „Aktywuj dostęp wszystkim oczekującym”, bo ręczne klikanie każdej osoby będzie męczące przy większej sprzedaży.

## Edge case’y

### Ktoś kupił kurs w lipcu, a w sierpniu sprzedaż została zamknięta

Użytkownik nadal ma dostęp do kursu przez swoje 12 miesięcy.

Zamknięcie sprzedaży nie odbiera dostępu osobom, które już go mają.

### Ktoś kupił kurs 1 czerwca, ale dostęp aktywowano 15 czerwca

12 miesięcy liczy się od 15 czerwca, nie od 1 czerwca.

### Ktoś kupił kurs ostatniego dnia sprzedaży

Jeśli płatność została poprawnie zakończona, trafia do tej samej grupy oczekującej na aktywację co pozostali kupujący.

### Ktoś dodał kurs do koszyka, ale sprzedaż zamknęła się przed płatnością

Nie powinien móc dokończyć nowego zakupu po zamknięciu sprzedaży.

Rekomendacja PM: zakup jest możliwy tylko wtedy, gdy sprzedaż była otwarta w momencie rozpoczęcia właściwej płatności. W razie wątpliwości system powinien pokazać komunikat, że sprzedaż została zakończona.

### Ktoś ma aktywny dostęp i próbuje kupić drugi raz

System blokuje zakup.

Użytkownik widzi przycisk „Otwórz kurs”, nie „Kup”.

### Ktoś czeka na aktywację i próbuje kupić drugi raz

System blokuje zakup.

Użytkownik widzi informację, że zakup jest już potwierdzony i czeka na aktywację.

### Ktoś ma wygasły dostęp i chce przedłużyć

Jeśli sprzedaż jest otwarta:

- może kupić ponownie,
- po aktywacji dostaje nowy 12-miesięczny dostęp,
- postęp i certyfikat zostają.

Jeśli sprzedaż jest zamknięta:

- nie może przedłużyć teraz,
- widzi „Sprzedaż wkrótce”.

### Ktoś ukończył kurs i dostał certyfikat, a potem dostęp wygasł

Certyfikat zostaje dostępny.

Wygaśnięcie dostępu blokuje materiały kursu, ale nie usuwa potwierdzenia ukończenia.

### Kurs został zaktualizowany po zakupie

Wszyscy użytkownicy z aktywnym dostępem widzą aktualną wersję kursu.

Aktualizacja treści nie wydłuża dostępu.

### Administracja zapomniała aktywować dostęp

Użytkownicy pozostają w stanie „oczekuje na aktywację” i nie widzą materiałów.

Rekomendacja: panel administracyjny powinien wyraźnie pokazywać liczbę osób oczekujących na aktywację.

### Administracja aktywowała dostęp wcześniej niż planowano

Od tej wcześniejszej aktywacji zaczyna się 12 miesięcy.

Jeśli aktywacja nastąpi 13 czerwca zamiast 15 czerwca, dostęp trwa od 13 czerwca.

### Administracja aktywowała dostęp później niż planowano

Od tej późniejszej aktywacji zaczyna się 12 miesięcy.

Jeśli aktywacja nastąpi 17 czerwca zamiast 15 czerwca, użytkownik nie traci dwóch dni; dostęp trwa od 17 czerwca.

### Płatność została anulowana albo nieudana

Nie ma zakupu i nie ma dostępu.

Użytkownik może spróbować ponownie, jeśli sprzedaż nadal jest otwarta.

### Zwrot pieniędzy lub chargeback

Dostęp powinien zostać cofnięty.

Użytkownik nie powinien mieć dostępu do materiałów, jeśli finalnie zakup nie jest opłacony.

### Kurs jest widoczny, ale cena lub termin kolejnej sprzedaży się zmienia

Administracja aktualizuje opis kursu albo komunikat sprzedażowy.

Nie wpływa to na osoby, które już kupiły kurs i mają aktywny dostęp.

## Rekomendowane komunikaty

### Sprzedaż zamknięta

„Sprzedaż wkrótce”

Opcjonalnie:

„Kolejna sprzedaż planowana jest w czerwcu.”

### Po zakupie, przed aktywacją

„Zakup potwierdzony. Dostęp do kursu zostanie aktywowany w wybranym terminie.”

### Dostęp aktywny

„Dostęp aktywny do: 15.06.2027.”

### Dostęp wygasł

„Twój dostęp do kursu wygasł.”

Jeśli sprzedaż otwarta:

„Przedłuż dostęp”

Jeśli sprzedaż zamknięta:

„Sprzedaż wkrótce”

## Decyzje produktowe do zatwierdzenia

| Decyzja | Rekomendacja |
|---|---|
| Czy kurs jest widoczny poza sprzedażą? | Tak |
| Czy sprzedaż działa w oknach czasowych? | Tak |
| Czy dostęp może startować później niż zakup? | Tak |
| Kto aktywuje dostęp? | Administracja ręcznie |
| Od kiedy liczy się 12 miesięcy? | Od aktywacji dostępu |
| Czy zamknięcie sprzedaży odbiera dostęp aktywnym osobom? | Nie |
| Czy aktywny użytkownik może kupić drugi raz? | Nie |
| Czy oczekujący użytkownik może kupić drugi raz? | Nie |
| Czy wygasły użytkownik może przedłużyć dostęp? | Tak, jeśli sprzedaż jest otwarta |
| Czy postęp zostaje po wygaśnięciu? | Tak |
| Czy certyfikat zostaje po wygaśnięciu? | Tak |
| Czy aktualizacje kursu są widoczne dla aktywnych osób? | Tak |

## Finalny opis działania

Kurs jest publicznie widoczny jako stała oferta. Sprzedaż jest otwierana tylko w określonych terminach. W trakcie sprzedaży użytkownik może kupić kurs, ale dostęp do materiałów może zostać uruchomiony później, ręcznie przez administrację.

Od momentu aktywacji użytkownik ma 12 miesięcy dostępu. W tym czasie może korzystać z aktualnej wersji kursu, a zamknięcie sprzedaży nie wpływa na jego dostęp. Po upływie 12 miesięcy dostęp wygasa automatycznie. Użytkownik zachowuje postęp i certyfikat, ale nie widzi już materiałów.

Jeśli chce wrócić do kursu po wygaśnięciu, może przedłużyć dostęp podczas kolejnego otwartego okna sprzedaży. Jeśli sprzedaż jest zamknięta, widzi „Sprzedaż wkrótce” i czeka na kolejną edycję sprzedaży.

