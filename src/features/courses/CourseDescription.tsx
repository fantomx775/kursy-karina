import { getCourseDescriptionHtml } from "@/lib/courseDescription";

type CourseDescriptionProps = {
  description: string;
};

export function CourseDescription({ description }: CourseDescriptionProps) {
  return (
    <div
      className="space-y-4 text-[var(--coffee-espresso)] text-base sm:text-lg leading-relaxed [&_a]:font-medium [&_a]:text-[var(--coffee-mocha)] [&_a]:underline [&_h2]:pt-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-[var(--coffee-charcoal)] [&_h3]:pt-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:leading-tight [&_h3]:text-[var(--coffee-charcoal)] [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc"
      dangerouslySetInnerHTML={{
        __html: getCourseDescriptionHtml(description),
      }}
    />
  );
}
