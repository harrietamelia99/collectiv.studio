import { redirect } from "next/navigation";

type Props = { params: { projectId: string } };

/** Legacy URL — canonical route is `/website/brand-kit`. */
export default function WebsiteKitLegacyRedirect({ params }: Props) {
  redirect(`/portal/project/${params.projectId}/website/brand-kit`);
}
