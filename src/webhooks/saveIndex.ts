import { postIndex } from "@/lib/algolia";
import {
  getAllPostsForIndexing,
  getPostByIdForIndexing,
  getManyPostsForIndexing,
} from "@/server/post/service";

export async function saveIndex(id: string) {
  const post = await getPostByIdForIndexing(id);
  await postIndex.saveObject(post);
}

export async function saveManyIndices() {
  const posts = await getAllPostsForIndexing();
  await postIndex.saveObjects(posts);
}

export async function saveManyIndicesByIds(ids: string[]) {
  const posts = await getManyPostsForIndexing(ids);
  await postIndex.saveObjects(posts);
}

export async function deleteIndex(id: string) {
  await postIndex.deleteObject(id);
}

export async function deleteManyIndices(ids: string[]) {
  await postIndex.deleteObjects(ids);
}
