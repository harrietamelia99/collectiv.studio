import type { TeamHighlight } from "@/components/ui/TeamCard";
import {
  IconBrandSpark,
  IconBriefcase,
  IconCamera,
  IconCompass,
  IconKanban,
  IconMessages,
  IconPalette,
  IconSocialNodes,
  IconUsers,
} from "@/components/ui/TeamHighlightIcons";

const iconClass = "h-[19px] w-[19px]";

export const teamHighlightsHarriet: TeamHighlight[] = [
  {
    text: "7+ years in marketing across projects and industries - bringing ideas to life through thoughtful design.",
    icon: <IconBriefcase className={iconClass} />,
  },
  {
    text: "Qualified graphic designer; creativity has always been at the heart of the work.",
    icon: <IconPalette className={iconClass} />,
  },
  {
    text: "Strategic brand, web and social vision - helping businesses build beautiful, purposeful marketing and design.",
    icon: <IconCompass className={iconClass} />,
  },
];

export const teamHighlightsIsabella: TeamHighlight[] = [
  {
    text: "End-to-end project management so every engagement runs smoothly from start to finish.",
    icon: <IconKanban className={iconClass} />,
  },
  {
    text: "Client relationships across industries - clear expectations and steady support throughout.",
    icon: <IconUsers className={iconClass} />,
  },
  {
    text: "Organised timelines and transparent communication so nothing falls through the cracks.",
    icon: <IconMessages className={iconClass} />,
  },
];

export const teamHighlightsMay: TeamHighlight[] = [
  {
    text: "Day-to-day social management - content stays consistent, engaging, and on-brand.",
    icon: <IconSocialNodes className={iconClass} />,
  },
  {
    text: "Works closely with clients so online presence reflects each business at its best.",
    icon: <IconBrandSpark className={iconClass} />,
  },
  {
    text: "Content days capturing photo and video for use across social platforms.",
    icon: <IconCamera className={iconClass} />,
  },
];
