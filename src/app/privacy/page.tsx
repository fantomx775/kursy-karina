import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description:
    "Informacje o przetwarzaniu danych osobowych w serwisie szkoleń online Karina Koziara Beauty Studio.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Polityka prywatności"
      lead="Informujemy, w jaki sposób przetwarzamy dane osobowe użytkowników platformy szkoleniowej."
    >
      <h2>Administrator danych</h2>
      <p>
        Administratorem danych osobowych jest <strong>Karina Koziara Beauty Studio</strong>, NIP:
        6443568317, z siedzibą przy ul. Orla 24, 41-200 Sosnowiec. W sprawach związanych z
        ochroną danych osobowych można skontaktować się drogą mailową pod adresem:{" "}
        <a href="mailto:KarinaKoziarabrows@interia.pl">KarinaKoziarabrows@interia.pl</a>.
      </p>

      <h2>Jakie dane przetwarzamy</h2>
      <p>
        Administrator przetwarza dane osobowe użytkowników platformy szkoleniowej w zakresie
        niezbędnym do realizacji usług. W praktyce mogą to być w szczególności:
      </p>
      <ul>
        <li>imię i nazwisko,</li>
        <li>adres e-mail,</li>
        <li>
          dane konta i logowania (w tym hasło przechowywane w formie zabezpieczonej przez
          wykorzystywanego dostawcę usług uwierzytelniania),
        </li>
        <li>
          numer telefonu oraz dane do faktury (np. adres, NIP) –{" "}
          <strong>wyłącznie jeśli zostaną przez Ciebie podane</strong> w ramach zamówienia,
          płatności lub innego kontaktu z nami,
        </li>
        <li>
          dane dotyczące zakupionych szkoleń, realizacji zamówień i korzystania z platformy,
        </li>
        <li>
          dane techniczne, w tym adres IP, identyfikatory zapisane w plikach cookies oraz informacje
          o urządzeniu i przeglądarce, jeśli są przetwarzane automatycznie przy korzystaniu ze
          strony.
        </li>
      </ul>

      <h2>Cele i podstawy prawne</h2>
      <p>Dane osobowe przetwarzamy m.in. w celu:</p>
      <ul>
        <li>realizacji zamówień i umożliwienia dostępu do platformy szkoleniowej,</li>
        <li>kontaktu związanego z obsługą konta i zamówień,</li>
        <li>wystawiania i przechowywania dokumentów księgowych,</li>
        <li>obsługi płatności elektronicznych,</li>
        <li>
          prowadzenia statystyk i poprawy działania serwisu (np. pod kątem bezpieczeństwa i
          użyteczności),
        </li>
        <li>
          działań marketingowych –{" "}
          <strong>wyłącznie jeśli wyrazisz na to odrębną zgodę</strong> albo gdy przepisy prawa na
          to pozwalają w konkretnym przypadku.
        </li>
      </ul>
      <p>Podstawy prawne przetwarzania wynikają z RODO, w szczególności:</p>
      <ul>
        <li>art. 6 ust. 1 lit. b – realizacja umowy lub podjęcie działań przed jej zawarciem,</li>
        <li>
          art. 6 ust. 1 lit. c – spełnienie obowiązków prawnych (np. podatkowych i rachunkowych),
        </li>
        <li>art. 6 ust. 1 lit. a – zgoda, gdy ją wyrazisz (np. na marketing),</li>
        <li>
          art. 6 ust. 1 lit. f – prawnie uzasadniony interes administratora, np. zapewnienie
          bezpieczeństwa IT, prosta analityka lub statystyki dotyczące serwisu, o ile nie narusza to
          w pierwszej kolejności Twoich praw i wolności.
        </li>
      </ul>

      <h2>Komu możemy przekazać dane</h2>
      <p>
        Dane osobowe mogą być powierzane lub udostępniane podmiotom współpracującym z
        administratorem wyłącznie w zakresie niezbędnym do świadczenia usług, w szczególności:
      </p>
      <ul>
        <li>operatorom płatności elektronicznych wykorzystywanych w serwisie,</li>
        <li>
          dostawcom infrastruktury IT (hosting aplikacji, baza danych, uwierzytelnianie
          użytkowników),
        </li>
        <li>biuru rachunkowemu lub innym podmiotom świadczącym usługi księgowe – w razie potrzeby,</li>
        <li>
          innym podmiotom – wyłącznie na podstawie umów powierzenia lub innych instrumentów
          przewidzianych przez RODO, gdy wprowadzimy dodatkowe narzędzia (np. mailing), o ile będzie
          to wymagane.
        </li>
      </ul>

      <h2>Przekazywanie danych poza Europejski Obszar Gospodarczy</h2>
      <p>
        Niektórzy dostawcy usług (np. w zakresie płatności lub chmury) mogą przetwarzać dane poza
        EOG. W takich przypadkach stosujemy rozwiązania przewidziane przez RODO, w szczególności
        decyzje Komisji Europejskiej o odpowiednim stopniu ochrony, standardowe klauzule umowne lub
        inne mechanizmy dopuszczalne przez prawo, aby zapewnić odpowiedni poziom ochrony danych.
      </p>

      <h2>Okres przechowywania</h2>
      <p>
        Dane osobowe przechowujemy przez okres niezbędny do realizacji umowy oraz zapewnienia
        dostępu do szkolenia, a także przez okres wymagany przepisami prawa (w szczególności
        podatkowymi i księgowymi). Dane przetwarzane wyłącznie na podstawie zgody przechowujemy do
        momentu jej wycofania, a następnie przez czas potrzebny do rozliczenia ewentualnych
        roszczeń, o ile dłuższy okres nie wynika z prawa.
      </p>

      <h2>Twoje prawa</h2>
      <p>Każdej osobie, której dane dotyczą, przysługuje m.in. prawo do:</p>
      <ul>
        <li>dostępu do danych oraz ich kopii,</li>
        <li>sprostowania nieprawidłowych danych,</li>
        <li>żądania usunięcia danych („prawo do bycia zapomnianym”) – w przypadkach przewidzianych prawem,</li>
        <li>ograniczenia przetwarzania,</li>
        <li>przenoszenia danych – gdy przesłanki wynikają z RODO,</li>
        <li>wniesienia sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie,</li>
        <li>cofnięcia zgody w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania przed cofnięciem,</li>
        <li>
          wniesienia skargi do organu nadzorczego – w Polsce jest nim Prezes Urzędu Ochrony Danych
          Osobowych.
        </li>
      </ul>

      <h2>Pliki cookies</h2>
      <p>
        Strona wykorzystuje pliki cookies i podobne technologie. Służą one w szczególności do
        utrzymania sesji i bezpiecznego logowania, zapewnienia działania koszyka i płatności oraz –
        w ograniczonym zakresie – do zrozumienia, jak korzystasz z serwisu (np. prosta analityka
        techniczna po stronie serwisu). Możesz zarządzać cookies w ustawieniach przeglądarki; całkowite
        wyłączenie plików cookies może utrudnić lub uniemożliwić korzystanie z niektórych funkcji
        konta.
      </p>
      <p>
        Obecnie nie stosujemy w serwisie narzędzi reklamowych typu „tracking” od zewnętrznych
        sieci reklamowych; jeśli taki sposób przetwarzania zostanie włączony, uzupełnimy niniejszą
        politykę i – w razie wymogu prawnego – zapewnimy odpowiednie mechanizmy zgody.
      </p>

      <h2>Bezpieczeństwo</h2>
      <p>
        Administrator stosuje środki techniczne i organizacyjne odpowiednie do ryzyka, mające na
        celu ochronę danych osobowych przed nieuprawnionym dostępem, utratą lub zniszczeniem.
      </p>

      <h2>Zmiany polityki</h2>
      <p>
        Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej polityce prywatności. Aktualna
        wersja jest publikowana na tej stronie. Powiązane dokumenty:{" "}
        <Link href="/terms">Regulamin</Link>.
      </p>
    </LegalPageShell>
  );
}
