export interface TransitSection {
  title: string;
  icon: string;
  content: string;
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

    let icon = 'Bus';
    if (loweredTitle.includes('corrida') || loweredTitle.includes('táxi') || loweredTitle.includes('taxi') || loweredTitle.includes('car') || loweredTitle.includes('ride')) {
      icon = 'Car';
    } else if (loweredTitle.includes('rota') || loweredTitle.includes('navegação') || loweredTitle.includes('map') || loweredTitle.includes('route')) {
      icon = 'Smartphone';
    } else if (loweredTitle.includes('metrô') || loweredTitle.includes('metro') || loweredTitle.includes('trem') || loweredTitle.includes('train') || loweredTitle.includes('rail')) {
      icon = 'Train';
    } else if (loweredTitle.includes('ônibus') || loweredTitle.includes('bus') || loweredTitle.includes('barco') || loweredTitle.includes('ferry')) {
      icon = 'Bus';
    } else if (loweredTitle.includes('tarifa') || loweredTitle.includes('pagamento') || loweredTitle.includes('fare') || loweredTitle.includes('payment') || loweredTitle.includes('card')) {
      icon = 'CreditCard';
    } else if (loweredTitle.includes('dica') || loweredTitle.includes('conselho') || loweredTitle.includes('tip') || loweredTitle.includes('general')) {
      icon = 'Lightbulb';
    }

    const cleanTitle = titleLine.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim();

    sections.push({ title: cleanTitle || titleLine, icon, content });
  }

  return sections;
}