import { renderToStaticMarkup } from 'react-dom/server';
import { Compass } from 'lucide-react';

const FAVICON_SIZE = 32;
const ICON_SIZE = 20;
const ICON_OFFSET = (FAVICON_SIZE - ICON_SIZE) / 2;

export function getAppFaviconHref(): string {
  const iconMarkup = renderToStaticMarkup(
    <Compass color="#ffffff" size={ICON_SIZE} strokeWidth={2.5} absoluteStrokeWidth />,
  );

  const iconContent = iconMarkup.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FAVICON_SIZE} ${FAVICON_SIZE}">
  <rect width="${FAVICON_SIZE}" height="${FAVICON_SIZE}" rx="8" fill="#4f46e5"/>
  <svg x="${ICON_OFFSET}" y="${ICON_OFFSET}" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    ${iconContent}
  </svg>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;
}
