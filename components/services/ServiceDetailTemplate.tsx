import type { ReactNode } from "react";
import { ImagePlaceholderFill } from "@/components/ui/ImagePlaceholder";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ButtonLink } from "@/components/ui/Button";

type Props = {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  imageSrc: string;
  imageSide?: "left" | "right";
};

export function ServiceDetailTemplate({
  eyebrow,
  title,
  intro,
  imageSrc,
  imageSide = "right",
}: Props) {
  void imageSrc;
  const imageBlock = (
    <div className="relative min-h-[320px] w-full lg:min-h-[560px]">
      <ImagePlaceholderFill />
    </div>
  );

  const copyBlock = (
    <div className="flex flex-col justify-center bg-cream px-8 py-16 lg:px-16 lg:py-24">
      <SectionLabel className="mb-4">{eyebrow}</SectionLabel>
      <h1 className="cc-no-heading-hover mb-6 text-burgundy">{title}</h1>
      <p className="cc-copy mb-10">{intro}</p>
      <ButtonLink href="/contactus" variant="burgundy" size="md" className="w-max">
        Book a discovery call
      </ButtonLink>
    </div>
  );

  return (
    <section className="grid min-h-[70vh] grid-cols-1 bg-cream lg:grid-cols-2">
      {imageSide === "left" ? (
        <>
          {imageBlock}
          {copyBlock}
        </>
      ) : (
        <>
          {copyBlock}
          {imageBlock}
        </>
      )}
    </section>
  );
}
