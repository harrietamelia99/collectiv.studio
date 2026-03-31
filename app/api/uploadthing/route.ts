/** Route handler for UploadThing v7 (`uploadthing/next` export from the `uploadthing` package). */
import { createRouteHandler } from "uploadthing/next";
import { uploadthingFileRouter } from "@/lib/uploadthing";

export const { GET, POST } = createRouteHandler({
  router: uploadthingFileRouter,
});
