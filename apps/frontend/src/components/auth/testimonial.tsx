import { FC } from 'react';
import SafeImage from '@gitroom/react/helpers/safe.image';

/** Arizona-local calendar date — stable for SSR and hydration (no Date.now()). */
function formatPostedLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Phoenix',
  });
}

const PlatformX: FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    className="shrink-0 text-[#e7e7e7]"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const PlatformFacebook: FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    className="shrink-0 text-[#e7e7e7]"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export type RepresentativeFeedPlatform = 'x' | 'facebook';

export const Testimonial: FC<{
  picture: string;
  name: string;
  description: string;
  content: any;
  platform?: RepresentativeFeedPlatform;
  postedAt?: string;
  postUrl?: string;
}> = ({
  content,
  description,
  name,
  picture,
  platform,
  postedAt,
  postUrl,
}) => {
  const postedLabel = postedAt ? formatPostedLabel(postedAt) : '';
  const showMeta = platform && postedLabel;

  return (
    <div className="rounded-[16px] w-full flex flex-col gap-[16px] p-[20px] bg-[#1A1919] border border-[#2b2a2a]">
      <div className="flex gap-[12px] min-w-0">
        <div className="w-[36px] h-[36px] rounded-full overflow-hidden shrink-0">
          <SafeImage src={picture} alt={name} width={36} height={36} />
        </div>

        <div className="flex flex-col -mt-[4px] min-w-0 flex-1">
          <div className="text-[16px] font-[700] truncate">{name}</div>
          <div className="text-[11px] font-[400] text-[#D1D1D1]">
            {description}
          </div>
          {showMeta && (
            <div className="flex items-center gap-[6px] mt-[6px] text-[10px] font-[500] text-[#9a9a9a]">
              {platform === 'x' ? <PlatformX /> : <PlatformFacebook />}
              <span>
                {platform === 'x' ? 'X' : 'Facebook'}
                {postedLabel ? ` · ${postedLabel}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="text-[12px] font-[400] text-[#FFF] whitespace-pre-line w-full min-w-0">
        {typeof content === 'string' ? content.replace(/\\n/g, '\n') : content}
      </div>

      {postUrl ? (
        <a
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-[500] text-[#FC69FF] hover:underline w-fit"
        >
          {platform === 'facebook' ? 'View on Facebook' : 'View on X'}
        </a>
      ) : null}
    </div>
  );
};
