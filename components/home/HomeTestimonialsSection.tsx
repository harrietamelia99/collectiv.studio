import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MotionSection } from "@/components/ui/SectionReveal";
import { TestimonialCarousel } from "@/components/ui/TestimonialCarousel";

const getFeaturedReviews = unstable_cache(
  async () => {
    try {
      return await prisma.publishedClientReview.findMany({
        where: { featuredOnHome: true, rating: 5 },
        orderBy: { submittedAt: "desc" },
        take: 12,
        select: { id: true, reviewText: true, reviewerName: true },
      });
    } catch {
      return [];
    }
  },
  ["home-featured-reviews"],
  { revalidate: 300, tags: ["published-client-reviews"] },
);

export async function HomeTestimonialsSection() {
  const featuredReviews = await getFeaturedReviews();
  const dbTestimonials = featuredReviews.map((r) => ({
    id: r.id,
    text: r.reviewText,
    name: r.reviewerName,
  }));

  return (
    <MotionSection className="flex min-h-0 items-center justify-center bg-burgundy px-5 py-10 md:min-h-[min(62vh,34rem)] md:px-6 md:py-24">
      <TestimonialCarousel dbQuotes={dbTestimonials} />
    </MotionSection>
  );
}
