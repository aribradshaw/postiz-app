'use client';

import { useMemo } from 'react';
import {
  RepresentativeFeedPlatform,
  Testimonial,
} from '@gitroom/frontend/components/auth/testimonial';
import authSocialFeedBundled from '../../data/auth-social-feed.json';

type FeedPost = {
  id: string;
  name: string;
  district: string;
  platform: RepresentativeFeedPlatform;
  picture: string;
  postedAt: string;
  content: string;
  postUrl?: string;
};

type FeedFile = { posts: FeedPost[] };

function ldDescription(district: string) {
  const n = district.replace(/^LD/i, '').trim();
  return n ? `State Representative, LD ${n}` : 'State Representative';
}

function splitColumns(posts: FeedPost[]) {
  const mid = Math.ceil(posts.length / 2);
  return [posts.slice(0, mid), posts.slice(mid)];
}

function normalizePosts(data: unknown): FeedPost[] {
  if (!data || typeof data !== 'object' || !('posts' in data)) {
    return [];
  }
  const posts = (data as FeedFile).posts;
  return Array.isArray(posts) ? posts : [];
}

export const TestimonialComponent = () => {
  const posts = useMemo(
    () => normalizePosts(authSocialFeedBundled),
    []
  );

  const [col1, col2] = useMemo(() => splitColumns(posts), [posts]);

  if (!posts.length) {
    return (
      <div className="flex-1 relative w-full min-w-0 max-w-[850px] min-h-[min(560px,60vh)] my-[30px] mx-auto" />
    );
  }

  return (
    <div className="flex-1 relative w-full min-w-0 max-w-[850px] min-h-[min(560px,60vh)] my-[30px] mx-auto">
      <div className="absolute inset-0 px-[40px] overflow-hidden">
        <div className="absolute w-full h-[120px] left-0 top-0 blackGradTopBg z-[100] pointer-events-none" />
        <div className="absolute w-full h-[120px] left-0 bottom-0 blackGradBottomBg z-[100] pointer-events-none" />
        <div className="flex justify-center gap-[12px] h-full min-h-0">
          <div className="flex flex-col animate-marqueeUp flex-1 gap-[12px] min-h-0 min-w-0">
            {[1, 2].flatMap((p) =>
              col1.flatMap((a) => (
                <div
                  key={p + '_' + a.id}
                  className="flex flex-col gap-[12px]"
                >
                  <Testimonial
                    picture={a.picture}
                    name={a.name}
                    description={ldDescription(a.district)}
                    content={a.content}
                    platform={a.platform}
                    postedAt={a.postedAt}
                    postUrl={a.postUrl || undefined}
                  />
                </div>
              ))
            )}
          </div>
          <div className="flex flex-col animate-marqueeDown flex-1 gap-[12px] min-h-0 min-w-0">
            {[1, 2].flatMap((p) =>
              col2.flatMap((a) => (
                <div
                  key={p + '_' + a.id}
                  className="flex flex-col gap-[12px]"
                >
                  <Testimonial
                    picture={a.picture}
                    name={a.name}
                    description={ldDescription(a.district)}
                    content={a.content}
                    platform={a.platform}
                    postedAt={a.postedAt}
                    postUrl={a.postUrl || undefined}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
