import type { StaticImageData } from 'next/image';

import { sharedImages as rootSharedImages } from '../../../shared-assets/images';

type SharedImage = StaticImageData | { src?: string } | string;

function toImageUrl(image: SharedImage) {
  if (typeof image === 'string') {
    return image;
  }

  return image.src ?? '';
}

export const sharedImages = {
  hero: toImageUrl(rootSharedImages.hero),
  apartment: toImageUrl(rootSharedImages.apartment),
  villa: toImageUrl(rootSharedImages.villa),
  townhouse: toImageUrl(rootSharedImages.townhouse),
} as const;
