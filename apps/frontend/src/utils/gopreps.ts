/**
 * Arizona House GOP rep headshots (57th Legislature), copied from our dashboard
 * pipeline. Files live under `public/gopreps/{memberId}.jpg`.
 *
 * Manifest: `/gopreps/members.json` (id, name, district, imageUrl, …).
 */
export const GOPREPS_PUBLIC_DIR = '/gopreps' as const

export function goprepPhotoUrl(memberId: string, ext: 'jpg' | 'png' | 'webp' = 'jpg'): string {
  return `${GOPREPS_PUBLIC_DIR}/${memberId}.${ext}`
}

export const GOPREPS_MEMBERS_JSON_URL = `${GOPREPS_PUBLIC_DIR}/members.json` as const
