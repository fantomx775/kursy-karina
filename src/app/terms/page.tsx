import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Regulamin",
  description:
    "Regulamin platformy szkoleniowej i sprzedaży szkoleń online Karina Koziara Beauty Studio.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Regulamin platformy szkoleniowej i sprzedaży szkoleń online"
      lead="Dokument określa zasady korzystania z platformy oraz zakupu szkoleń online."
    >
      <p>
        Niniejszy regulamin określa zasady korzystania z platformy szkoleniowej oraz zasady
        zakupu szkoleń online oferowanych przez{" "}
        <strong>Karina Koziara Beauty Studio</strong>, NIP: 6443568317, z siedzibą przy ul. Orla
        24, 41-200 Sosnowiec, adres e-mail:{" "}
        <a href="mailto:KarinaKoziarabrows@interia.pl">KarinaKoziarabrows@interia.pl</a>.
      </p>

      <h2>Platforma i wymagania techniczne</h2>
      <p>
        Platforma szkoleniowa umożliwia zakup oraz dostęp do szkoleń online z zakresu stylizacji
        brwi. Warunkiem korzystania z platformy jest posiadanie urządzenia z dostępem do Internetu
        oraz aktualnej przeglądarki internetowej.
      </p>

      <h2>Zakup i dostęp do szkolenia</h2>
      <p>
        Zakup szkolenia następuje poprzez złożenie zamówienia za pośrednictwem strony internetowej.
        Po dokonaniu płatności użytkownik otrzymuje dostęp do zakupionych materiałów
        szkoleniowych. Dostęp do szkolenia jest udzielany na czas określony lub nieokreślony –
        zgodnie z informacją podaną w ofercie konkretnego szkolenia.
      </p>

      <h2>Ceny i płatności</h2>
      <p>
        Ceny szkoleń podawane są w złotych polskich i są cenami brutto. Płatność za szkolenie
        odbywa się za pośrednictwem dostępnych metod płatności wskazanych na stronie.
      </p>

      <h2>Odstąpienie od umowy</h2>
      <p>
        Z chwilą uzyskania dostępu do szkolenia, użytkownik wyraża zgodę na rozpoczęcie
        świadczenia usługi przed upływem 14 dni od zawarcia umowy, co skutkuje utratą prawa do
        odstąpienia od umowy zgodnie z obowiązującymi przepisami prawa konsumenckiego.
      </p>
      <p>
        Użytkownik ma prawo odstąpić od umowy w terminie 14 dni od jej zawarcia, z wyjątkiem
        sytuacji, gdy za jego wyraźną zgodą rozpoczęto świadczenie usługi przed upływem tego
        terminu. W takim przypadku użytkownik traci prawo do odstąpienia od umowy.
      </p>

      <h2>Prawa autorskie</h2>
      <p>
        Materiały szkoleniowe udostępniane w ramach platformy stanowią własność intelektualną
        Karina Koziara Beauty Studio i są chronione prawem autorskim. Zabrania się ich
        kopiowania, rozpowszechniania, udostępniania osobom trzecim oraz wykorzystywania w celach
        komercyjnych bez uprzedniej zgody.
      </p>

      <h2>Zakazy i odpowiedzialność</h2>
      <p>
        Użytkownik zobowiązuje się do korzystania z platformy w sposób zgodny z prawem oraz
        niniejszym regulaminem. Zabronione jest dostarczanie treści o charakterze bezprawnym oraz
        podejmowanie działań mogących zakłócić funkcjonowanie platformy.
      </p>
      <p>
        Administrator dokłada wszelkich starań, aby zapewnić ciągłość działania platformy, jednak
        nie ponosi odpowiedzialności za przerwy wynikające z przyczyn technicznych niezależnych od
        niego.
      </p>

      <h2>Reklamacje</h2>
      <p>
        Reklamacje dotyczące funkcjonowania platformy lub zakupionych szkoleń można składać drogą
        mailową na adres:{" "}
        <a href="mailto:KarinaKoziarabrows@interia.pl">KarinaKoziarabrows@interia.pl</a>.
        Reklamacja powinna zawierać dane umożliwiające identyfikację użytkownika oraz opis
        problemu. Reklamacje rozpatrywane są w terminie do 14 dni.
      </p>

      <h2>Zmiany regulaminu</h2>
      <p>
        Administrator zastrzega sobie prawo do wprowadzania zmian w regulaminie. Zmiany wchodzą w
        życie z chwilą ich publikacji na stronie internetowej.
      </p>

      <h2>Prawo właściwe</h2>
      <p>
        W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy prawa
        polskiego, w szczególności Kodeksu cywilnego oraz ustawy o prawach konsumenta.
      </p>

      <p className="pt-4 border-t border-[var(--coffee-cappuccino)] text-sm">
        Powiązany dokument: <Link href="/privacy">Polityka prywatności</Link>.
      </p>
    </LegalPageShell>
  );
}
