# Reguły Testowania Unitarnych w Next.js

Zasady te mają na celu zapewnienie wysokiej jakości, czytelności i łatwości utrzymania testów jednostkowych oraz komponentowych w aplikacjach Next.js (App Router).

<activation>
- Always On
- Glob: **/*.test.{ts,tsx}
- Glob: **/*.spec.{ts,tsx}
</activation>

<general_principles>
- **Wzorce AAA (Arrange-Act-Assert)**: Każdy test musi być wyraźnie podzielony na trzy sekcje: przygotowanie danych (Arrange), wykonanie akcji (Act) i sprawdzenie rezultatów (Assert).
- **Izolacja**: Testy muszą być od siebie niezależne. Nie mogą polegać na stanie pozostawionym przez poprzednie testy.
- **Pojedyncza odpowiedzialność**: Jeden blok `it` powinien testować tylko jedną rzecz/zachowanie. Unikaj wielu asercji testujących różne aspekty w jednym bloku.
- **Mów Ludzkim Głosem**: Opisy testów powinny jasno komunikować intencję. Unikaj słowa "should" na rzecz twierdzeń ("returns 5", "renders error").
- **Nazewnictwo T1-T2-T3**: Dla większej czytelności stosuj strukturę: `System_Pod_Testem | Scenariusz | Oczekiwany_Rezultat`.
- **Mockowanie Server Actions**: Ponieważ Server Actions to zwykłe funkcje, testuj je osobno jako unit testy logiki biznesowej, mockując dostęp do bazy danych.
- **Testowanie Z-Index i Portali**: W przypadku modalów i tooltipów (często używanych w Shadcn/UI), upewnij się, że test sprawdzający widoczność szuka elementu w całym `document.body`.
- **Wsparcie dla i18n**: Jeśli aplikacja jest wielojęzyczna, zdefiniuj regułę mockowania hooków tłumaczeń (np. `useTranslation`), aby testy nie zależały od plików JSON z tłumaczeniami.
- **Accessibility (A11y)**: Warto dodać wymóg używania `jest-axe` do automatycznego sprawdzania podstawowych zasad dostępności w każdym teście komponentu.
- **Environment Variables**: Pamiętaj o regule zapewniającej dostęp do zmiennych `.env.test` podczas uruchamiania testów, aby uniknąć błędów `undefined`.
</general_principles>

<component_testing>
- **React Testing Library (RTL)**: Używaj RTL do testowania komponentów. Testuj zachowanie widoczne dla użytkownika, a nie detale implementacyjne (np. stan wewnętrzny).
- **data-testid**: Do selekcji elementów w testach używaj atrybutu `data-testid` zamiast tagów HTML czy klas CSS, które mogą ulec zmianie.
- **User Event**: Preferuj bibliotekę `@testing-library/user-event` nad `fireEvent` dla bardziej realistycznej symulacji interakcji użytkownika (np. wpisywanie tekstu, kliknięcia).
- **Server Components**: Dla asynchronicznych Server Components (Next.js 13+) preferuj testy E2E (Playwright/Cypress), dopóki wsparcie dla unit testów nie będzie pełne.
</component_testing>

<mocking_and_dependencies>
- **Mockowanie next/navigation**: Zawsze mockuj hooki takie jak `useRouter`, `usePathname` czy `useSearchParams` przy użyciu `jest.mock` lub `vi.mock`.
- **API Fetching**: Nigdy nie wykonuj realnych zapytań API w unit testach. Używaj mockowanych danych (Mock Data) i mockuj globalną funkcję `fetch` lub używaj narzędzi typu MSW (Mock Service Worker).
- **Zależności zewnętrzne**: Usługi (Services) i moduły zewnętrzne powinny być zastępowane przez "stubs" lub "spies", aby skupić się na logice testowanego komponentu.
</mocking_and_dependencies>

<organization>
- **Kolokacja (Colocation)**: Pliki testowe `*.test.tsx` powinny znajdować się w tym samym folderze co komponent/funkcja, którą testują.
- **Test Utils**: Narzędzia pomocnicze (np. customowe renderery z providerami) powinny znajdować się jak najbliżej kodu, który ich używa. Globalne narzędzia umieść w `tests/utils`.
- **Stałe testowe**: Unikaj zahardkodowanych ciągów znaków (np. "foo"). Twórz dedykowane pliki ze stałymi testowymi (np. `constants.menu.ts`), aby zapewnić unikalność danych (np. dodawanie indeksu do nazw).
- **Grupowanie (Describe)**: Używaj bloków `describe` do logicznego grupowania testów dla konkretnej funkcji lub komponentu.
</organization>

<async_testing>
- **Wait For**: Przy testowaniu zmian asynchronicznych (np. po pobraniu danych) używaj funkcji `waitFor` z RTL, aby poczekać na pojawienie się elementów w DOM.
- **Async/Await**: Każdy test wchodzący w interakcję z UI (user events) lub asynchronicznym kodem musi być oznaczony jako `async` i używać `await`.
</async_testing>
