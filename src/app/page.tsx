import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import type { Course } from "@/types/course";
import { isPromoActive, getEffectivePriceCents, getPromoLabel } from "@/lib/coursePromo";

export const dynamic = "force-dynamic";

function CourseCard({
  title,
  description,
  priceCents,
  originalPriceCents,
  slug,
  mainImageUrl,
  showPromoBadge,
  promoLabel,
}: {
  title: string;
  description: string;
  priceCents: number;
  originalPriceCents?: number;
  slug: string;
  mainImageUrl?: string | null;
  showPromoBadge?: boolean;
  promoLabel?: string | null;
}) {
  const priceFormatted = (priceCents / 100).toFixed(2).replace(".", ",") + " zł";
  const hasStrikethrough = showPromoBadge && originalPriceCents != null && originalPriceCents !== priceCents;
  const originalFormatted =
    hasStrikethrough && originalPriceCents != null
      ? (originalPriceCents / 100).toFixed(2).replace(".", ",") + " zł"
      : null;

  return (
    <Card
      variant="elevated"
      padding="none"
      className="overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-[var(--shadow-lg)] group"
    >
      <div className="relative">
        <Link href={`/courses/${slug}`} className="block relative h-48 sm:h-56 lg:h-64">
          <div className="absolute inset-0 bg-[var(--coffee-cappuccino)] flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02] overflow-hidden">
            {mainImageUrl ? (
              <Image
                src={mainImageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <span className="text-[var(--coffee-espresso)] text-lg relative z-0">
                Kurs Image
              </span>
            )}
          </div>
        </Link>
        {showPromoBadge && (
          <div className="absolute top-3 right-3 flex flex-row flex-wrap gap-1.5 items-center justify-end">
            <span className="bg-[var(--coffee-mocha)] text-white px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              PROMOCJA
            </span>
            {promoLabel && (
              <span className="bg-[var(--coffee-mocha)] text-white px-3 py-1 text-xs font-semibold">
                {promoLabel}
              </span>
            )}
          </div>
        )}
      </div>
      <CardContent className="pt-5 pb-6 px-5 sm:px-6 flex flex-col flex-1">
        <h3 className="text-lg sm:text-xl font-semibold text-[var(--coffee-charcoal)] mb-2 leading-tight">
          {title}
        </h3>
        <div className="flex items-center mb-3">
          <div className="w-7 h-7 bg-[var(--coffee-macchiato)] rounded-full mr-2 flex-shrink-0"></div>
          <span className="text-sm text-[var(--coffee-espresso)]">KARINA KOZIARA</span>
        </div>
        <p className="text-[var(--coffee-espresso)] text-sm mb-5 leading-relaxed flex-1 line-clamp-3">
          {description}
        </p>
        <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-[var(--coffee-cappuccino)]">
          <span className="text-xl sm:text-2xl font-bold text-[var(--coffee-charcoal)] whitespace-nowrap flex flex-wrap items-baseline gap-2">
            {hasStrikethrough && originalFormatted && (
              <span className="line-through text-base font-normal text-[var(--coffee-espresso)]">
                {originalFormatted}
              </span>
            )}
            {priceFormatted}
          </span>
          <Link
            href={`/courses/${slug}`}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-radius bg-[var(--coffee-espresso)] text-white hover:bg-[var(--coffee-dark)] focus:ring-[var(--coffee-macchiato)] border border-[var(--coffee-espresso)] px-4 py-2 text-base min-h-[2.5rem] whitespace-nowrap text-sm"
          >
            Zobacz kurs
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function HomePage() {
  const admin = createAdminSupabaseClient();
  const { data: courses } = await admin
    .from("courses")
    .select(
      "id, title, slug, description, price, main_image_url, promotion_discount_type, promotion_discount_value, promotion_start_date, promotion_end_date",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--coffee-cream)]">
      {/* Hero Section with Courses */}
      <section className="py-10 sm:py-14 lg:py-20">
        <div className="page-width">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--coffee-charcoal)] mb-3">
              Szkolenia online
            </h1>
            <p className="text-[var(--coffee-espresso)] text-base sm:text-lg max-w-2xl mx-auto">
              Profesjonalne kursy stylizacji brwi od Kariny Koziara
            </p>
          </div>
          <div className="grid gap-5 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses && courses.length > 0 ? (
              (courses as Course[]).map((course) => {
                const promoActive = isPromoActive(course);
                const effectiveCents = getEffectivePriceCents(course);
                return (
                  <CourseCard
                    key={course.id}
                    title={course.title}
                    description={course.description}
                    priceCents={effectiveCents}
                    originalPriceCents={promoActive ? course.price : undefined}
                    slug={course.slug}
                    mainImageUrl={course.main_image_url}
                    showPromoBadge={promoActive}
                    promoLabel={getPromoLabel(course)}
                  />
                );
              })
            ) : (
              <div className="col-span-full bg-white/80 border border-[var(--coffee-cappuccino)] border-radius p-8 sm:p-12 text-center text-[var(--coffee-espresso)]">
                Aktualnie brak aktywnych kursów. Wróć wkrótce.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Oferta szkoleniowa Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="page-width">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--coffee-charcoal)] mb-6 sm:mb-8">
              Oferta szkoleniowa
            </h2>
            <p className="text-[var(--coffee-espresso)] leading-relaxed text-base sm:text-lg">
              Niezależnie od tego, czy dopiero zaczynasz swoją drogę jako stylistka brwi, czy
              pracujesz w zawodzie i chcesz uporządkować oraz pogłębić swoją wiedzę - moje
              szkolenia zostały stworzone po to, aby realnie podnieść jakość Twoich stylizacji i
              wejść na wyższy poziom.
            </p>
            <p className="text-[var(--coffee-espresso)] leading-relaxed text-base sm:text-lg mt-5">
              Program szkoleń został zaprojektowany w oparciu o kompleksowe przekazanie
              wiedzy, łącząc dokładnie opracowaną teorię w formie pisanej z materiałami
              wideo omawiającymi kluczowe schematy pracy. Dzięki temu możesz nie tylko
              zrozumieć każdy etap stylizacji, ale również zobaczyć go w praktyce i wracać
              do materiałów wtedy, gdy tego potrzebujesz. Całość została uzupełniona
              nagraniami pracy na modelkach, co pozwala skutecznie przełożyć wiedzę
              teoretyczną na realne działania.
            </p>
          </div>
        </div>
      </section>

      {/* Dlaczego warto Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="page-width">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--coffee-charcoal)] mb-8 sm:mb-12 text-center">
              Dlaczego warto?
            </h2>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <p className="text-[var(--coffee-espresso)] leading-relaxed text-base sm:text-lg">
                  To nie jest zwykłe szkolenie online. To dopracowana platforma edukacyjna,
                  zaprojektowana z najwyższą starannością, aby maksymalnie ułatwić przyswajanie
                  wiedzy, zrozumienie procesów oraz świadome budowanie własnego schematu
                  pracy.
                </p>
                <p className="text-[var(--coffee-espresso)] leading-relaxed text-base sm:text-lg mt-5">
                  Moje doświadczenie ze szkoleń stacjonarnych jasno pokazało, że łączenie
                  intensywnej teorii i praktyki w jednym dniu nie daje najlepszych efektów.
                  Dlatego stworzyłam rozwiązanie, które pozwala Ci uczyć się we własnym
                  tempie - bez presji i chaosu informacyjnego.
                </p>
                <p className="text-[var(--coffee-espresso)] leading-relaxed text-base sm:text-lg mt-5">
                  Najpierw dokładnie przyswajasz teorię, a moment wdrożenia jej w praktyce podczas
                  pracy ze mną jest Twoją indywidualną decyzją. Taki model nauki daje znacznie lepsze
                  rezultaty, większą pewność w działaniu i realny rozwój umiejętności.
                  To forma nauki, która naprawdę działa - sprawdzona w praktyce i oparta na
                  doświadczeniu.
                </p>
              </div>
              <div className="relative order-first md:order-last">
                <div className="h-72 sm:h-80 lg:h-96 bg-[var(--coffee-cappuccino)] border-radius flex items-center justify-center">
                  <span className="text-[var(--coffee-espresso)] text-lg">Image Placeholder</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O mnie Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="page-width">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--coffee-charcoal)] mb-6 sm:mb-8">
              O mnie
            </h2>
            <p className="text-[var(--coffee-espresso)] leading-relaxed text-base sm:text-lg">
              Jestem stylistką brwi z wieloletnim doświadczeniem w branży beauty. Prowadzę
              salon kosmetyczny Beauty Studio Karina Koziara w Sosnowcu, gdzie stawiam na
              wysoką jakość usług i indywidualne podejście do każdej klientki.
            </p>
            <p className="text-[var(--coffee-espresso)] leading-relaxed text-base sm:text-lg mt-5">
              Działam jako niezależny instruktor stylizacji brwi oraz prelegentka na wydarzeniach
              branżowych. Jestem ambasadorką marki Pimp My Lashes oraz wielokrotną
              zwyciężczynią międzynarodowych mistrzostw w stylizacji brwi. Zdobyte
              doświadczenie wykorzystuję w autorskich programach szkoleniowych, opartych na
              świadomym podejściu do pracy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
