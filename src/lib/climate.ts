// Interfaces for rich seasonal weather analytics
export interface ClimateMonth {
  month: string;
  tempMax: number;
  tempMin: number;
  precip: number; // rainfall percentage or days index
  sunHours: number; // average daily sunshine hours
  recommendation: string; // actionable packing advisory for this month
}

export interface ClimateProfile {
  climateType: string;
  description: string;
  bestMonths: string;
  months: ClimateMonth[];
}

// Heuristic engine to fetch custom monthly weather averages for any destination on earth
export function getDestinationClimate(destination: string): ClimateProfile {
  const dest = (destination || '').toLowerCase();

  // 1. Alpine Cold / Snow / Ski / Polar
  if (
    dest.includes('suíça') || dest.includes('switzerland') || dest.includes('alp') ||
    dest.includes('neve') || dest.includes('ski') || dest.includes('bariloche') ||
    dest.includes('lap') || dest.includes('islând') || dest.includes('noruega') ||
    dest.includes('finlând') || dest.includes('canadá') || dest.includes('alpes') ||
    dest.includes('chamonix') || dest.includes('aspen') || dest.includes('siberia') ||
    dest.includes('patagônia') || dest.includes('ushuaia') || dest.includes('himalaia') ||
    dest.includes('alaska') || dest.includes('alasca')
  ) {
    return {
      climateType: 'Alpino / Frio de Montanha',
      description: 'Clima caracterizado por invernos rigorosos com neve abundante e verões amenos. O ar é seco e os ventos de altitude podem intensificar consideravelmente a sensação de frio.',
      bestMonths: 'Dezembro a Março (para Neve e Esqui) ou Julho a Agosto (para Trilhas)',
      months: [
        { month: 'Jan', tempMax: 1, tempMin: -6, precip: 65, sunHours: 3, recommendation: 'Extremo: Use 3 camadas (térmica, fleece, corta-vento impermeável). Gorro, luvas e botas forradas.' },
        { month: 'Fev', tempMax: 2, tempMin: -5, precip: 60, sunHours: 4, recommendation: 'Frio e neve: Casacos de pluma grossos, meias térmicas e botas com antiderrapante.' },
        { month: 'Mar', tempMax: 6, tempMin: -2, precip: 70, sunHours: 5, recommendation: 'Transição fria: Jaquetas acolchoadas, calçados resistentes e blusas de lã grossa.' },
        { month: 'Abr', tempMax: 11, tempMin: 2, precip: 75, sunHours: 6, recommendation: 'Fresco e instável: Capa de chuva leve, jaqueta corta-vento e sapatos fechados impermeáveis.' },
        { month: 'Mai', tempMax: 15, tempMin: 6, precip: 90, sunHours: 7, recommendation: 'Agradável com chuva: Suéteres leves, lenços, e sapatos confortáveis para caminhar.' },
        { month: 'Jun', tempMax: 19, tempMin: 10, precip: 100, sunHours: 8, recommendation: 'Verão ameno: Roupas leves para o dia e cardigan/jaqueta leve para o entardecer.' },
        { month: 'Jul', tempMax: 22, tempMin: 12, precip: 95, sunHours: 9, recommendation: 'Perfeito para trilhas: Camisetas dry-fit, shorts/calças leves, óculos de sol, boné e bota de trilha.' },
        { month: 'Ago', tempMax: 21, tempMin: 12, precip: 95, sunHours: 8, recommendation: 'Quente de dia, fresco à noite: Estilo cebola (camadas fáceis de tirar). Traga óculos e protetor.' },
        { month: 'Set', tempMax: 17, tempMin: 9, precip: 85, sunHours: 6, recommendation: 'Fresco de outono: Jaqueta leve ou suéter aconchegante, calças jeans e botas.' },
        { month: 'Out', tempMax: 12, tempMin: 5, precip: 75, sunHours: 4, recommendation: 'Frio moderado: Casaco corta-vento de outono, cachecol leve e sapatos totalmente fechados.' },
        { month: 'Nov', tempMax: 6, tempMin: 0, precip: 70, sunHours: 3, recommendation: 'Frio acentuado: Sobretudo ou jaqueta invernal pesada, luvas finas e golas altas.' },
        { month: 'Dez', tempMax: 2, tempMin: -4, precip: 65, sunHours: 2, recommendation: 'Inverno rigoroso de neve: Proteção total contra congelamento. Segunda pele é indispensável.' }
      ]
    };
  }

  // 2. Tropical / Beach / Island / Hot
  if (
    dest.includes('rio de janeiro') || dest.includes('copacabana') || dest.includes('bahia') ||
    dest.includes('nordeste') || dest.includes('praia') || dest.includes('beach') ||
    dest.includes('cancún') || dest.includes('caribe') || dest.includes('maldivas') ||
    dest.includes('miami') || dest.includes('hawaii') || dest.includes('havaí') ||
    dest.includes('tailândia') || dest.includes('phuket') || dest.includes('bali') ||
    dest.includes('ceará') || dest.includes('recife') || dest.includes('salvador') ||
    dest.includes('porto de galinhas') || dest.includes('natal') || dest.includes('jericoacoara') ||
    dest.includes('maragogi') || dest.includes('fernando de noronha') || dest.includes('caravelas') ||
    dest.includes('ibiza') || dest.includes('grécia') || dest.includes('santorini') ||
    dest.includes('amazon') || dest.includes('manaus') || dest.includes('pantanal')
  ) {
    return {
      climateType: 'Tropical Marítimo / Quente',
      description: 'Clima ensolarado e úmido quase todo o ano. Os verões são quentes e podem trazer pancadas de chuva de fim de tarde. Os invernos são bastante amenos e ótimos para praia.',
      bestMonths: 'Janeiro a Setembro (fuga de chuvas fortes de entardecer dependendo da região)',
      months: [
        { month: 'Jan', tempMax: 31, tempMin: 23, precip: 80, sunHours: 8, recommendation: 'Muito quente: Trajes de banho, shorts, camisetas bem leves, chinelos, chapéu e muito protetor solar.' },
        { month: 'Fev', tempMax: 32, tempMin: 24, precip: 75, sunHours: 8, recommendation: 'Calor intenso: Prefira tecidos super respiráveis (linho/viscose). Óculos escuros e hidratação constante.' },
        { month: 'Mar', tempMax: 31, tempMin: 23, precip: 90, sunHours: 7, recommendation: 'Úmido e abafado: Guarda-chuva de bolso ou capa leve é uma boa pedida para pancadas rápidas de verão.' },
        { month: 'Abr', tempMax: 29, tempMin: 22, precip: 65, sunHours: 7, recommendation: 'Super agradável: Ótimo clima para passear. Roupas de praia de dia, blusa fina para ar condicionado à noite.' },
        { month: 'Mai', tempMax: 27, tempMin: 20, precip: 50, sunHours: 6, recommendation: 'Fresco tropical: Perfeito para explorar a pé. Use calçados confortáveis e roupas casuais respiráveis.' },
        { month: 'Jun', tempMax: 26, tempMin: 19, precip: 40, sunHours: 6, recommendation: 'Noites frescas: Jaqueta jeans ou cardigan leve para noites na orla marítima. Roupa de praia de dia.' },
        { month: 'Jul', tempMax: 26, tempMin: 18, precip: 35, sunHours: 6, recommendation: 'Época seca e fresca: Dias lindos de sol suave. Excelente para passeios ao ar livre sem calor sufocante.' },
        { month: 'Ago', tempMax: 27, tempMin: 19, precip: 30, sunHours: 7, recommendation: 'Sol garantido: Dias limpos e ventos agradáveis. Protetor solar e óculos continuam indispensáveis.' },
        { month: 'Set', tempMax: 28, tempMin: 20, precip: 45, sunHours: 7, recommendation: 'Primavera quente: Clima esquentando rapidamente. Roupas frescas para o dia e calça leve para a noite.' },
        { month: 'Out', tempMax: 29, tempMin: 21, precip: 60, sunHours: 7, recommendation: 'Calor de volta: Vestidos leves, shorts curtos, sandálias anatômicas e chapéu de praia.' },
        { month: 'Nov', tempMax: 30, tempMin: 22, precip: 75, sunHours: 7, recommendation: 'Quente e úmido: Camisas leves de algodão. Carregue água e repelente de insetos se for caminhar na natureza.' },
        { month: 'Dez', tempMax: 31, tempMin: 23, precip: 85, sunHours: 8, recommendation: 'Verão de férias: Trajes de banho, chinelos de dedo, roupas soltas e protetor solar de alto fator facial.' }
      ]
    };
  }

  // 3. Desert / Arid / Hot Dry
  if (
    dest.includes('egito') || dest.includes('egypt') || dest.includes('cairo') ||
    dest.includes('dubai') || dest.includes('emirados') || dest.includes('saara') ||
    dest.includes('atacama') || dest.includes('arizona') || dest.includes('las vegas') ||
    dest.includes('marrocos') || dest.includes('marrakech') || dest.includes('petra') ||
    dest.includes('jordânia') || dest.includes('machu picchu') || dest.includes('lima') ||
    dest.includes('texas') || dest.includes('utah') || dest.includes('grand canyon')
  ) {
    return {
      climateType: 'Desértico / Árido Extremo',
      description: 'Marcado por temperaturas escaldantes sob o sol direto e noites que resfriam rapidamente. A precipitação é quase nula, e a umidade do ar é extremamente baixa.',
      bestMonths: 'Outubro a Abril (evitando o calor insuportável de deserto do meio do ano)',
      months: [
        { month: 'Jan', tempMax: 19, tempMin: 9, precip: 5, sunHours: 8, recommendation: 'Inverno desértico: Dias frescos e deliciosos, mas noites bem frias! Vista jaqueta corta-vento e bota.' },
        { month: 'Fev', tempMax: 21, tempMin: 10, precip: 4, sunHours: 9, recommendation: 'Clima perfeito de dia: Óculos escuro, protetor labial super-hidratante e jaqueta grossa para a noite.' },
        { month: 'Mar', tempMax: 25, tempMin: 13, precip: 5, sunHours: 9, recommendation: 'Transição excelente: Use calças finas e camisas de linho compridas contra sol, e casaco quente à noite.' },
        { month: 'Abr', tempMax: 30, tempMin: 17, precip: 2, sunHours: 10, recommendation: 'Esquentando: Roupas soltas de cores claras, lenço de pescoço para poeira, óculos de sol e chapéu abas largas.' },
        { month: 'Mai', tempMax: 35, tempMin: 21, precip: 1, sunHours: 11, recommendation: 'Aquecimento extremo: Proteções com manga longa anti-UV e garrafas térmicas com gelo.' },
        { month: 'Jun', tempMax: 39, tempMin: 24, precip: 0, sunHours: 12, recommendation: 'Auge escaldante: Evite sol das 11h às 16h. Roupas de proteção solar total e sapatos fechados grossos.' },
        { month: 'Jul', tempMax: 41, tempMin: 25, precip: 0, sunHours: 12, recommendation: 'Ardor desértico: Tecidos de algodão leve, óculos polarizados, hidratação extrema com eletrólitos.' },
        { month: 'Ago', tempMax: 40, tempMin: 25, precip: 0, sunHours: 11, recommendation: 'Extremo calor: Planeje passeios em locais com ar-condicionado. Use filtro solar FPS 60.' },
        { month: 'Set', tempMax: 36, tempMin: 23, precip: 0, sunHours: 10, recommendation: 'Sol escaldante constante: Roupas respiráveis e bonés. Noites ficam respiráveis para passeios ao luar.' },
        { month: 'Out', tempMax: 31, tempMin: 19, precip: 1, sunHours: 9, recommendation: 'Clima espetacular de volta: Shorts leves, calçados resistentes de trilha, jaqueta leve aconchegante para as noites.' },
        { month: 'Nov', tempMax: 25, tempMin: 14, precip: 3, sunHours: 8, recommendation: 'Clima super ameno: Ideal para turismo arqueológico. Traga moletom ou blazer para as noites.' },
        { month: 'Dez', tempMax: 20, tempMin: 10, precip: 5, sunHours: 8, recommendation: 'Noites frias desérticas: Camisola térmica, blusa grossa de lã, corta-vento com capuz e calça comprida.' }
      ]
    };
  }

  // 4. Default / Temperate (e.g., Paris, New York, Tokyo, Rome, Lisbon, London, Buenos Aires, São Paulo)
  // Check if destination matches southern hemisphere indicators to match real seasons
  const isSouthernHemisphere =
    dest.includes('são paulo') || dest.includes('buenos aires') || dest.includes('santiago') ||
    dest.includes('curitiba') || dest.includes('gramado') || dest.includes('porto alegre') ||
    dest.includes('florianópolis') || dest.includes('sul') || dest.includes('austrália') ||
    dest.includes('sidney') || dest.includes('melbourne') || dest.includes('áfrica do sul') ||
    dest.includes('montevid') || dest.includes('bariloche');

  if (isSouthernHemisphere) {
    return {
      climateType: 'Temperado Subtropical / Sul',
      description: 'Estações bem definidas com verões quentes e chuvosos (Dezembro a Março) e invernos mais secos e refrescantes (Junho a Agosto). Clima muito confortável que se adapta a atividades a pé.',
      bestMonths: 'Abril a Novembro (frescor ameno, noites agradáveis com menos chuvas torrenciais)',
      months: [
        { month: 'Jan', tempMax: 29, tempMin: 20, precip: 85, sunHours: 7, recommendation: 'Verão quente e úmido: Leve shorts, vestidos leves, sandálias e guarda-chuva robusto na mochila.' },
        { month: 'Fev', tempMax: 29, tempMin: 20, precip: 80, sunHours: 7, recommendation: 'Alta umidade/Calor: Roupas frescas de algodão, óculos de sol e protetor solar frequente.' },
        { month: 'Mar', tempMax: 28, tempMin: 19, precip: 75, sunHours: 6, recommendation: 'Fim do verão: Clima abafado, traga calças confortáveis e capas finas de chuva para passeios na rua.' },
        { month: 'Abr', tempMax: 25, tempMin: 16, precip: 50, sunHours: 6, recommendation: 'Outono agradável: Dias lindos de céu azul ameno. Vista jaqueta leve de nylon ou cardigan para o fim de tarde.' },
        { month: 'Mai', tempMax: 22, tempMin: 13, precip: 45, sunHours: 5, recommendation: 'Fresco e adorável: Suéter fino, jaquetas jeans ou casacos de moletom médios. Sapatos confortáveis de couro/tênis.' },
        { month: 'Jun', tempMax: 21, tempMin: 11, precip: 40, sunHours: 5, recommendation: 'Inverno fresco: Casacos médios de lã ou jaquetas de couro. Cachecol leve é ótimo ao anoitecer.' },
        { month: 'Jul', tempMax: 21, tempMin: 10, precip: 35, sunHours: 5, recommendation: 'Frio moderado e seco: Ótimos dias de sol com vento gelado. Vista camadas (camiseta + suéter + jaqueta).' },
        { month: 'Ago', tempMax: 23, tempMin: 11, precip: 30, sunHours: 6, recommendation: 'Vento seco de inverno: Use protetor solar e hidratante labial. Prepare jaqueta leve caso esquente ao meio dia.' },
        { month: 'Set', tempMax: 24, tempMin: 13, precip: 55, sunHours: 6, recommendation: 'Primavera amena: Noites deliciosas, dias secos. Roupas versáteis de camadas fáceis de carregar na mochila.' },
        { month: 'Out', tempMax: 26, tempMin: 15, precip: 65, sunHours: 6, recommendation: 'Esquentando gradativamente: Camisas polos do dia a dia, blusas leves de viscose e óculos escuros.' },
        { month: 'Nov', tempMax: 27, tempMin: 17, precip: 70, sunHours: 7, recommendation: 'Clima pré-verão: Pratique esportes com sapatos confortáveis. Leve shorts e roupas confortáveis para caminhadas demoradas.' },
        { month: 'Dez', tempMax: 28, tempMin: 19, precip: 80, sunHours: 7, recommendation: 'Início do verão: Chapéu, boné e garrafa térmica para caminhadas. Alertas de chuvas de verão rápidas.' }
      ]
    };
  }

  // default to Northern Temperate (New York, Paris, Europe, Tokyo, Rome, Lisbon)
  return {
    climateType: 'Temperado Continental / Norte',
    description: 'Quatro estações perfeitamente distintas. Invernos charmosos com neblinas ou geadas e verões quentes de sol tardio. A primavera e outono oferecem cenários deslumbrantes com temperaturas amenas.',
    bestMonths: 'Maio a Junho (temperaturas ótimas) ou Setembro a Outubro (folhagens de outono douradas)',
    months: [
      { month: 'Jan', tempMax: 6, tempMin: 1, precip: 60, sunHours: 3, recommendation: 'Inverno frio: Casaco grosso (puffer/lã), luvas quentes, gorro cobrindo orelhas e meias térmicas grossas.' },
      { month: 'Fev', tempMax: 7, tempMin: 1, precip: 55, sunHours: 4, recommendation: 'Vento e geada: Casaco de lã pesada ou jaqueta de pluma, cachecol volumoso e calçados forrados confortáveis.' },
      { month: 'Mar', tempMax: 12, tempMin: 4, precip: 50, sunHours: 5, recommendation: 'Frio de transição: Casacos médios (estilo casaco jeans pesado ou trenchcoat), calça jeans reforçada e suéter.' },
      { month: 'Abr', tempMax: 16, tempMin: 7, precip: 55, sunHours: 6, recommendation: 'Primavera fresca: Cenário lindo! Vista casaco corta-vento leve por cima de blusas básicas e leve guarda-chuva.' },
      { month: 'Mai', tempMax: 20, tempMin: 11, precip: 65, sunHours: 7, recommendation: 'Clima glorioso: Perfeito para turismo! Use calça leve, sapatilhas ou tênis e traga jaqueta fina extra.' },
      { month: 'Jun', tempMax: 24, tempMin: 14, precip: 60, sunHours: 8, recommendation: 'Verão agradabilíssimo: Roupas leves (shorts, camisetas), óculos escuros e calçados anatômicos para pedestres.' },
      { month: 'Jul', tempMax: 27, tempMin: 16, precip: 55, sunHours: 9, recommendation: 'Sol abundante e quente: Use protetor solar facial, boné, vestidos soltos e óculos escuros.' },
      { month: 'Ago', tempMax: 27, tempMin: 16, precip: 50, sunHours: 8, recommendation: 'Dias quentes e ensolarados: Perfeito para parques e praias. Chapéu, óculos e hidratantes pós-sol.' },
      { month: 'Set', tempMax: 22, tempMin: 13, precip: 55, sunHours: 6, recommendation: 'Clima perfeito de outono: Jaquetas de veludo, lenços charmosos para vento e tênis excelente de caminhada.' },
      { month: 'Out', tempMax: 16, tempMin: 9, precip: 60, sunHours: 4, recommendation: 'Outono fresco: Jaquetas acolchoadas finas, meias de algodão confortáveis, blusas de gola alta e cachecol leve.' },
      { month: 'Nov', tempMax: 10, tempMin: 5, precip: 60, sunHours: 3, recommendation: 'Frio chegando forte: Sobretudo grosso pronto para vento, luvas de couro ou lã fina, sapatos fechados isolados.' },
      { month: 'Dez', tempMax: 7, tempMin: 2, precip: 65, sunHours: 2, recommendation: 'Inverno natalino: Jaqueta puffer pesada impermeável, segunda pele térmica (calça e blusa) e botas antiderrapantes.' }
    ]
  };
}