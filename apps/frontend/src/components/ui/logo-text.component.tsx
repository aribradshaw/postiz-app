import React from 'react';
import { BRAND_LOGO_SRC } from '@gitroom/frontend/utils/brand-logo';

type LogoTextProps = {
  /** Larger, centered mark for auth screens; compact left-aligned for billing etc. */
  variant?: 'default' | 'auth';
};

export const LogoTextComponent = ({ variant = 'default' }: LogoTextProps) => {
  const imgClass =
    variant === 'auth'
      ? 'h-[4.75rem] w-auto max-w-[min(100%,520px)] object-contain object-center mx-auto sm:h-[6rem] md:h-[7rem]'
      : 'h-9 w-auto max-w-[min(100%,280px)] object-contain object-left sm:h-10';

  return (
    <img
      src={BRAND_LOGO_SRC}
      alt=""
      width={1920}
      height={1135}
      className={imgClass}
    />
  );
};
