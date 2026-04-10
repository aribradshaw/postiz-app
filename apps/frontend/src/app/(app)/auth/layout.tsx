import { getT } from '@gitroom/react/translation/get.translation.service.backend';

export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';
import loadDynamic from 'next/dynamic';
import { TestimonialComponent } from '@gitroom/frontend/components/auth/testimonial.component';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';
const ReturnUrlComponent = loadDynamic(() => import('./return.url.component'));
export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getT();

  return (
    <div className="bg-[#0E0E0E] flex flex-1 p-[12px] gap-[12px] min-h-screen w-screen text-white">
      {/*<style>{`html, body {overflow-x: hidden;}`}</style>*/}
      <ReturnUrlComponent />
      <div className="flex flex-col py-[40px] px-[20px] flex-1 lg:w-[600px] lg:flex-none rounded-[12px] text-white p-[12px] bg-[#1A1919] items-center justify-center">
        <div className="w-full max-w-[480px] mx-auto flex flex-col items-center text-center gap-8 h-full justify-center">
          <LogoTextComponent variant="auth" />
          <div className="flex w-full justify-center">{children}</div>
        </div>
      </div>
      <div className="text-[36px] flex-1 min-h-0 min-w-0 pt-[88px] hidden lg:flex flex-col items-center w-full">
        <div className="text-center w-full max-w-[850px] px-[40px] mx-auto shrink-0">
          <span className="text-[42px] font-semibold text-azHouse-gold">
            {t('auth_hero_line1_lead', 'One Place')}
          </span>
          {t(
            'auth_hero_line1_rest',
            ' For the Arizona House Majority'
          )}
          <br />
          <span className="inline-block max-w-full text-[20px] lg:text-[22px] xl:text-[24px] font-normal leading-snug tracking-tight whitespace-nowrap">
            {t(
              'auth_hero_line2',
              'To Post, Analyze, and Schedule Social Content'
            )}
          </span>
        </div>
        <TestimonialComponent />
      </div>
    </div>
  );
}
