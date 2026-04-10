'use client';

import { BRAND_LOGO_SRC } from '@gitroom/frontend/utils/brand-logo';

export const Logo = () => {
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt=""
      width={1920}
      height={1135}
      className="mt-[8px] h-[52px] w-auto max-w-[min(100%,200px)] object-contain object-left"
    />
  );
};
