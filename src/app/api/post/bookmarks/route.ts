import { auth } from "@/lib/auth";
import {
  getBookmarkedPosts,
  getBookmarkedPostsByProviderId,
} from "@/server/bookmark/service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    const session = await auth();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    return Response.json(await getBookmarkedPosts(session.user.id), {
      statusText: "OK",
    });
  }

  const bookmarked = await getBookmarkedPostsByProviderId(userId);
  return Response.json(bookmarked, {
    statusText: "OK",
  });
}
