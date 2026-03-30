import type { SVGProps } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { SiFacebook, SiInstagram, SiPinterest, SiTiktok, SiYoutube } from "react-icons/si";

const cls = "inline-block shrink-0 align-middle";

export function SocialPlatformIcon({
  id,
  className = "h-4 w-4",
  ...rest
}: { id: string; className?: string } & SVGProps<SVGSVGElement>) {
  switch (id.toLowerCase()) {
    case "instagram":
      return <SiInstagram className={`${cls} ${className}`} aria-hidden {...rest} />;
    case "tiktok":
      return <SiTiktok className={`${cls} ${className}`} aria-hidden {...rest} />;
    case "facebook":
      return <SiFacebook className={`${cls} ${className}`} aria-hidden {...rest} />;
    case "linkedin":
      return <FaLinkedin className={`${cls} ${className}`} aria-hidden {...rest} />;
    case "pinterest":
      return <SiPinterest className={`${cls} ${className}`} aria-hidden {...rest} />;
    case "youtube":
      return <SiYoutube className={`${cls} ${className}`} aria-hidden {...rest} />;
    default:
      return null;
  }
}
