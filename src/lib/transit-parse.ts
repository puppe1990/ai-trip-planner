export type TransitSectionKey = 'rideApps' | 'routes' | 'metro' | 'buses' | 'fares' | 'tips' | 'other';

export interface TransitSection {
  key: TransitSectionKey;
  title: string;
  icon: string;
  content: string;
}

function detectSectionKey(loweredTitle: string): TransitSectionKey {
  if (
    loweredTitle.includes('corrida') ||
    loweredTitle.includes('táxi') ||
    loweredTitle.includes('taxi') ||
    loweredTitle.includes('car') ||
    loweredTitle.includes('ride')
  ) {
    return 'rideApps';
  }
  if (
    loweredTitle.includes('rota') ||
    loweredTitle.includes('navegação') ||
    loweredTitle.includes('navigation') ||
    loweredTitle.includes('map') ||
    loweredTitle.includes('route')
  ) {
    return 'routes';
  }
  if (
    loweredTitle.includes('metrô') ||
    loweredTitle.includes('metro') ||
    loweredTitle.includes('trem') ||
    loweredTitle.includes('train') ||
    loweredTitle.includes('rail')
  ) {
    return 'metro';
  }
  if (
    loweredTitle.includes('ônibus') ||
    loweredTitle.includes('onibus') ||
    loweredTitle.includes('bus') ||
    loweredTitle.includes('barco') ||
    loweredTitle.includes('ferry')
  ) {
    return 'buses';
  }
  if (
    loweredTitle.includes('tarifa') ||
    loweredTitle.includes('pagamento') ||
    loweredTitle.includes('fare') ||
    loweredTitle.includes('payment') ||
    loweredTitle.includes('card')
  ) {
    return 'fares';
  }
  if (
    loweredTitle.includes('dica') ||
    loweredTitle.includes('conselho') ||
    loweredTitle.includes('tip') ||
    loweredTitle.includes('general') ||
    loweredTitle.includes('mobilidade')
  ) {
    return 'tips';
  }

  return 'other';
}

export function parseTransitSections(rawText: string): TransitSection[] {
  const parts = rawText.split('###');
  const sections: TransitSection[] = [];

  for (let i = 1; i < parts.length; i++) {
    const segment = parts[i].trim();
    if (!segment) continue;

    const lines = segment.split('\n');
    const titleLine = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    const loweredTitle = titleLine.toLowerCase();
    const key = detectSectionKey(loweredTitle);

    let icon = 'Bus';
    if (key === 'rideApps') {
      icon = 'Car';
    } else if (key === 'routes') {
      icon = 'Smartphone';
    } else if (key === 'metro') {
      icon = 'Train';
    } else if (key === 'buses') {
      icon = 'Bus';
    } else if (key === 'fares') {
      icon = 'CreditCard';
    } else if (key === 'tips') {
      icon = 'Lightbulb';
    }

    const cleanTitle = titleLine
      .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
      .trim();

    sections.push({ key, title: cleanTitle || titleLine, icon, content });
  }

  return sections;
}
