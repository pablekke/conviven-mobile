import feedService from "../features/feed/services/feedService";

export async function prefetchMatchingFeed(): Promise<void> {
  try {
    await feedService.getMatchingFeed(1);
  } catch {}
}

export async function prefetchInitialData(): Promise<void> {
  await Promise.allSettled([prefetchMatchingFeed()]);
}
