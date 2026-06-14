// Spotřební normy pro masné výrobky, 1993 (Ing. Václav Šedivý, OSSJS)
// Všechna množství jsou v kg / 100 kg hotového výrobku (pokud není uvedeno jinak).
// baseWeight pro kalkulátor = 100 kg = 100 000 g

export interface NormIngredient {
  name: string
  amount: number
  unit: 'kg' | 'l' | 'm' | 'ks'
  group: 'suroviny' | 'přísady' | 'obaly'
}

export interface MasnaVyrobkaNorma {
  id: string
  name: string
  csn?: string
  categoryId: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  ingredients: NormIngredient[]
  procedure?: string
  outputWeight?: string
  pdfPage?: number
  verified: boolean
}

export const NORM_CATEGORIES: Record<number, string> = {
  1: 'Drobné masné výrobky',
  2: 'Měkké salámy',
  3: 'Trvanlivé masné výrobky',
  4: 'Speciální masné výrobky',
  5: 'Vařené masné výrobky',
  6: 'Pečené masné výrobky',
  7: 'Ostatní masné výrobky',
  8: 'Konzervy',
}

// kg per 100 kg hotového výrobku
function s(name: string, amount: number, unit: NormIngredient['unit'] = 'kg'): NormIngredient {
  return { name, amount, unit, group: 'suroviny' }
}
function p(name: string, amount: number, unit: NormIngredient['unit'] = 'kg'): NormIngredient {
  return { name, amount, unit, group: 'přísady' }
}
function o(name: string, amount: number, unit: NormIngredient['unit']): NormIngredient {
  return { name, amount, unit, group: 'obaly' }
}

export const NORMY: MasnaVyrobkaNorma[] = [
  // ─────────────────────────────────────────────────────────
  // 1. DROBNÉ MASNÉ VÝROBKY
  // ─────────────────────────────────────────────────────────
  {
    id: '1.01', name: 'Špekáčky', csn: '577115', categoryId: 1, pdfPage: 14, verified: true,
    outputWeight: '50–65 g 1 ks',
    ingredients: [
      s('HPV sol. na jemno', 35.5),
      s('VVsk sol. na jemno', 20.4),
      s('Maso z II. hlavy sol. na jemno', 3.0),
      s('V kůže sol. na jemno', 1.5),
      s('Hřbetní sádlo sol. na vložku', 27.0),
      p('Dusitanová sůl směs', 0.245),
      p('Pepř černý', 0.16),
      p('Muškátový ořech', 0.03),
      p('Česnek', 0.09),
      p('Paprika sladká', 0.22),
      p('Pšeničná mouka hrubá', 3.2),
      p('Voda', 19.0, 'l'),
      o('II kroužková střeva', 123, 'm'),
      o('Hliníkové spony', 2100, 'ks'),
    ],
  },
  {
    id: '1.02', name: 'Párky', csn: '577125', categoryId: 1, pdfPage: 16, verified: false,
    outputWeight: '100 +/- 10 g 1 ks',
    ingredients: [
      s('HPV sol. na jemno', 37.5),
      s('VVsk sol. na jemno', 45.0),
      s('Maso z II. hlavy sol. na jemno', 3.0),
      s('V kůže sol. na jemno', 1.5),
      p('Pepř černý', 0.16),
      p('Muškátový ořech', 0.035),
      p('Paprika sladká', 0.055),
      p('Pšeničná mouka hrubá', 3.4),
      p('Voda', 22.6, 'l'),
      o('V tenká sdíraná střeva', 195, 'm'),
    ],
  },
  {
    id: '1.03', name: 'Jemné párky', csn: '577129', categoryId: 1, pdfPage: 17, verified: true,
    outputWeight: '100 +/- 15 g 2 ks nožiček',
    ingredients: [
      s('HZV sol. na jemno', 35.0),
      s('HPV sol. na jemno', 4.7),
      s('VVsk sol. na jemno', 31.0),
      s('V kůže sol. na jemno', 8.5),
      p('Pepř černý', 0.08),
      p('Muškátový ořech', 0.035),
      p('Pšeničná mouka hrubá', 3.3),
      p('Voda', 31.5, 'l'),
      o('Cutisín průměr 22 mm', 390, 'm'),
    ],
  },
  {
    id: '1.04', name: 'Spišské párky', csn: '577134', categoryId: 1, pdfPage: 18, verified: true,
    outputWeight: '50 +/- 10 g 1 ks',
    ingredients: [
      s('HZV sol. na jemno', 21.0),
      s('Vl. sol. na jemno', 21.0),
      s('VVsk sol. na jemno', 38.0),
      s('V kůže sol. na jemno', 12.0),
      p('Paprika sladká', 0.635),
      p('Paprika pálivá', 0.005),
      p('Voda', 21.0, 'l'),
      o('Skopová tenká střeva', 480, 'm'),
    ],
  },
  {
    id: '1.05', name: 'Moravské klobásy', csn: '577130', categoryId: 1, pdfPage: 19, verified: true,
    outputWeight: '100 +/- 10 g 1 ks',
    procedure: 'Vložka čárna 15 mm',
    ingredients: [
      s('HPV sol. na jemno', 25.0),
      s('VVsk sol. na jemno', 16.5),
      s('Maso z II. hlavy sol. na jemno', 3.0),
      s('V kůže sol. na jemno', 1.5),
      s('VVbk sol. na vložku', 48.0),
      p('Pepř černý', 0.22),
      p('Kmín', 0.1),
      p('Česnek', 0.065),
      p('Paprika sladká', 0.15),
      p('Zázvor', 0.02),
      p('Pšeničná mouka hrubá', 2.4),
      p('Voda', 14.0, 'l'),
      o('V tenká sdíraná střeva', 206, 'm'),
    ],
  },
  {
    id: '1.06', name: 'Slovácké domácí klobásy', csn: '577131', categoryId: 1, pdfPage: 20, verified: true,
    outputWeight: '75 +/- 10 g 1 ks',
    procedure: 'Zrnění vložky: do 25 mm',
    ingredients: [
      s('VL sol. na vložku', 40.0),
      s('VL II sol. na vložku', 10.0),
      s('VVbk sol. na vložku', 49.0),
      p('Pepř černý', 0.2),
      p('Kmín', 0.04),
      p('Paprika sladká', 0.5),
      p('Česnek', 0.09),
      p('Voda', 8.0, 'l'),
      o('V tenká sdíraná střeva', 316, 'm'),
    ],
  },
  {
    id: '1.07', name: 'Skopové klobásy', csn: '577147', categoryId: 1, pdfPage: 21, verified: true,
    outputWeight: '150 +/- 20 g 1 ks',
    procedure: 'Zrnění vložky: do 16 mm',
    ingredients: [
      s('Skopové maso sol. na jemno', 40.7),
      s('VVsk sol. na jemno', 9.0),
      s('V kůže sol. na jemno', 1.5),
      s('VVbk sol. na vložku', 29.0),
      s('Skopové maso sol. na vložku', 20.0),
      p('Pepř černý', 0.25),
      p('Kmín', 0.1),
      p('Paprika sladká', 0.3),
      p('Česnek', 0.075),
      p('Pšeničná mouka hrubá', 3.0),
      p('Voda', 8.0, 'l'),
      o('V tenká sdíraná střeva', 180, 'm'),
    ],
  },
  {
    id: '1.08', name: 'Liberecké uzenky', csn: '577137', categoryId: 1, pdfPage: 22, verified: true,
    outputWeight: '100 +/- 15 g 1 ks',
    procedure: 'Zrnění vložky: do 8 mm',
    ingredients: [
      s('HZV sol. na jemno', 5.0),
      s('HPV sol. na jemno', 40.0),
      s('VVsk sol. na jemno', 8.4),
      s('V kůže sol. na jemno', 4.0),
      s('Maso z II. hlavy sol. na jemno', 3.0),
      s('Hřbetní sádlo sol. na vložku', 37.0),
      p('Dusitanová sůl směs', 0.245),
      p('Pepř černý', 0.16),
      p('Muškátový ořech', 0.03),
      p('Paprika sladká', 0.22),
      p('Česnek', 0.09),
      p('Pšeničná mouka hrubá', 3.2),
      p('Voda', 19.0, 'l'),
      o('Vepřová tenká sdíraná střeva', 210, 'm'),
    ],
  },
  {
    id: '1.09', name: 'Jihočeské uzenky', categoryId: 1, pdfPage: 23, verified: true,
    outputWeight: '100–120 g 1 ks',
    procedure: 'Zrnění vložky: do 8 mm',
    ingredients: [
      s('HZV sol. na jemno', 20.0),
      s('HPV sol. na jemno', 16.5),
      s('Vl. sol. na jemno', 10.0),
      s('Vl. II sol. na jemno', 5.0),
      s('VVsk sol. na jemno', 23.0),
      s('V kůže sol. na jemno', 2.0),
      s('Maso z II. hlavy sol. na jemno', 5.0),
      s('Hřbetní sádlo sol. na vložku', 15.0),
      p('Dusitanová sůl směs', 0.2),
      p('Pepř černý', 0.25),
      p('Muškátový ořech', 0.06),
      p('Paprika sladká', 0.1),
      p('Česnek', 0.1),
      p('Zázvor', 0.03),
      p('Pšeničná mouka hrubá', 2.0),
      p('Voda', 9.0, 'l'),
      o('Hovězí kroužková střeva', 120, 'm'),
      o('Al spony', 1050, 'ks'),
    ],
  },
  {
    id: '1.10', name: 'Ostravské klobásy', categoryId: 1, pdfPage: 24, verified: true,
    outputWeight: '75 +/- 10 g 1 ks',
    procedure: 'Zrnění vložky: cca 20 mm',
    ingredients: [
      s('V kýty na vložku', 73.0),
      p('Dusitanová sůl směs', 0.24),
      p('Pepř červený', 0.2),
      p('Kmín', 0.12),
      p('Česnek', 0.1),
      p('Zázvor', 0.1),
      p('Voda', 3.0, 'l'),
      o('V tenká sdíraná střeva', 270, 'm'),
    ],
  },
  {
    id: '1.11', name: 'Vepřové domácí klobásy', csn: '577148', categoryId: 1, pdfPage: 25, verified: true,
    outputWeight: '75 +/- 10 g 1 ks',
    procedure: 'Vložka čárna 10 mm',
    ingredients: [
      s('V kůty na vložku', 44.5),
      s('V boku na vložku', 58.0),
      p('Dusitanová sůl směs', 0.32),
      p('Pepř červený', 0.3),
      p('Kmín', 0.15),
      p('Paprika sladká', 0.15),
      p('Paprika pálivá', 0.15),
      p('Voda', 3.0, 'l'),
      o('V tenká sdíraná střeva', 220, 'm'),
    ],
  },
  {
    id: '1.12', name: 'Krajová klobása', categoryId: 1, pdfPage: 26, verified: true,
    outputWeight: '100 +/- 10 g 1 ks',
    procedure: 'Zrnění vložky: do 20 mm',
    ingredients: [
      s('HZV sol. na jemno', 10.0),
      s('Vl. II sol. na jemno', 5.0),
      s('Vl. sol. na vložku', 41.0),
      s('VVbk sol. na vložku', 43.0),
      p('Pepř černý', 0.25),
      p('Kmín', 0.12),
      p('Paprika sladká', 0.2),
      p('Paprika pálivá', 0.18),
      p('Zázvor', 0.15),
      p('Česnek', 0.15),
      p('Cukr', 0.1),
      p('Deme košení', 0.04),
      p('Voda', 6.0, 'l'),
      o('V tenká sdíraná střeva', 220, 'm'),
    ],
  },
  {
    id: '1.13', name: 'Debrecínské párky k loupání', csn: '577128', categoryId: 1, pdfPage: 27, verified: true,
    outputWeight: 'max 60 g 1 ks (II nožička)',
    procedure: 'Zrnění vložky: 4–6 mm',
    ingredients: [
      s('HPV sol. na jemno', 40.2),
      s('VVbk sol. na jemno', 10.0),
      s('Maso z II. hlavy sol. na jemno', 8.0),
      s('VVbk sol. na vložku', 40.0),
      p('Pepř černý', 0.18),
      p('Kmín', 0.08),
      p('Paprika sladká', 0.3),
      p('Paprika pálivá', 0.2),
      p('Zázvor', 0.04),
      p('Česnek', 0.08),
      p('Pšeničná mouka hrubá', 3.0),
      p('Voda', 12.0, 'l'),
      o('Celulózová střeva průměr 22 mm', 340, 'm'),
    ],
  },
  {
    id: '1.14', name: 'Trampská cigára', csn: '577123', categoryId: 1, pdfPage: 28, verified: true,
    outputWeight: 'výrobek se naráží v souvislém prameni',
    procedure: 'Zrnění vložky: do 6 mm',
    ingredients: [
      s('HZV sol. na jemno', 48.0),
      s('HPV sol. na jemno', 27.0),
      s('VVbk sol. na vložku', 16.0),
      s('Hřbetní sádlo sol. na vložku', 16.0),
      p('Pepř černý', 0.35),
      p('Kmín', 0.06),
      p('Paprika sladká', 0.2),
      p('Zázvor', 0.07),
      p('Česnek', 0.02),
      p('Pšeničná mouka hrubá', 3.0),
      p('Voda', 9.0, 'l'),
      o('Cutisínová střeva průměr 22 mm', 320, 'm'),
    ],
  },
  {
    id: '1.15', name: 'Lahůdkové párky k loupání', csn: '577124', categoryId: 1, pdfPage: 29, verified: true,
    outputWeight: 'max 60 g 1 ks (1 nožička)',
    ingredients: [
      s('HZV sol. na jemno', 15.0),
      s('HPV sol. na jemno', 35.5),
      s('VVsk sol. na jemno', 43.0),
      p('Pepř černý', 0.14),
      p('Paprika sladká', 0.15),
      p('Muškátový ořech', 0.04),
      p('Voda', 21.0, 'l'),
      o('Celulózová střeva průměr 22 mm', 340, 'm'),
    ],
  },
  {
    id: '1.16', name: 'Papríková klobása', categoryId: 1, pdfPage: 30, verified: true,
    outputWeight: '150 +/- 20 g 1 ks (1 nožička)',
    procedure: 'Zrnění vložky: cca 15 mm',
    ingredients: [
      s('HPV sol. na jemno', 26.0),
      s('Vl. II sol. na vložku', 70.0),
      p('Pepř černý', 0.24),
      p('Kmín', 0.28),
      p('Paprika sladká', 0.45),
      p('Paprika pálivá', 0.55),
      p('Česnek', 0.88),
      p('Voda', 10.0, 'l'),
      o('Vepřová tenká sdíraná střeva', 220, 'm'),
    ],
  },
  {
    id: '1.17', name: 'Párky s telecím masem', csn: '577111', categoryId: 1, pdfPage: 31, verified: true,
    outputWeight: '100 +/- 10 g 1 ks',
    ingredients: [
      s('HPV sol. na jemno', 25.6),
      s('Telecí maso sol. na jemno', 52.5),
      s('Maso z II. hlavy sol. na jemno', 8.0),
      s('V kůže sol. na jemno', 6.5),
      p('Pepř černý', 0.15),
      p('Muškátový ořech', 0.06),
      p('Česnek', 0.03),
      p('Pšeničná mouka hrubá', 2.0),
      p('Voda', 20.0, 'l'),
      o('V tenká sdíraná střeva', 195, 'm'),
    ],
  },
  {
    id: '1.18', name: 'Doudlevecké uzenky', categoryId: 1, pdfPage: 32, verified: true,
    outputWeight: '50–65 g 1 ks',
    procedure: 'Zrnění vložky: do 6 mm',
    ingredients: [
      s('HPV sol. na jemno', 18.5),
      s('V kůže sol. na jemno', 1.5),
      s('Maso z II. hlavy sol. na jemno', 20.0),
      s('Hřbetní sádlo sol. na vložku', 36.0),
      s('HPV sol. na vložku', 38.0),
      s('VL II sol. na vložku', 10.0),
      p('Pepř černý', 0.3),
      p('Kmín', 0.12),
      p('Paprika sladká', 0.16),
      p('Česnek', 0.1),
      p('Pšeničná mouka hrubá', 3.0),
      p('Voda', 10.0, 'l'),
      o('Hovězí kroužková střeva', 123, 'm'),
      o('Al spony', 2100, 'ks'),
    ],
  },
  {
    id: '1.19', name: 'Lázeňská cigára', categoryId: 1, pdfPage: 33, verified: true,
    outputWeight: 'výrobek se naráží v souvislém prameni',
    ingredients: [
      s('HZV sol. na jemno', 30.0),
      s('HPV sol. na jemno', 20.0),
      s('Vl. sol. na jemno', 5.0),
      s('Vl. II sol. na jemno', 10.0),
      s('VVsk', 41.0),
      p('Dusitanová sůl směs', 0.4),
      p('Pepř černý', 0.15),
      p('Muškátový ořech', 0.04),
      p('Zázvor', 0.04),
      p('Voda', 21.0, 'l'),
      o('Cutisínová střeva průměr 26–28 mm', 215, 'm'),
    ],
  },
  {
    id: '1.20', name: 'Výběrové párky Extra', categoryId: 1, pdfPage: 34, verified: true,
    outputWeight: '60–80 g 2 ks nožiček',
    ingredients: [
      s('HZV sol. na jemno', 20.0),
      s('HPV sol. na jemno', 17.0),
      s('Vl. sol. na jemno', 16.0),
      s('VVsk sol. na jemno', 32.0),
      p('Dusitanová sůl směs', 0.14),
      p('Pepř černý', 0.16),
      p('Paprika sladká', 0.24),
      p('Muškátový ořech', 0.04),
      p('Voda', 39.0, 'l'),
      o('Skopová tenká střeva', 480, 'm'),
    ],
  },
  {
    id: '1.21', name: 'Debrecínské párky Extra', categoryId: 1, pdfPage: 35, verified: true,
    outputWeight: '60–80 g 2 ks nožiček',
    procedure: 'Zrnění vložky: 6 mm',
    ingredients: [
      s('HV sol. na jemno', 10.0),
      s('HPV sol. na jemno', 30.0),
      s('Vl. sol. na jemno', 10.0),
      s('VVsk sol. na vložku', 40.0),
      p('Dusitanová sůl směs', 2.0),
      p('Pepř černý', 0.15),
      p('Kmín', 0.1),
      p('Paprika sladká', 0.06),
      p('Paprika pálivá', 0.09),
      p('Zázvor', 0.06),
      p('Voda', 17.0, 'l'),
      o('Skopová tenká střeva', 430, 'm'),
    ],
  },
  {
    id: '1.22', name: 'Lívové párky', categoryId: 1, pdfPage: 36, verified: true,
    outputWeight: '100 +/- 10 g 1 ks',
    ingredients: [
      s('HPV sol. na jemno', 50.0),
      s('VVsk sol. na jemno', 29.5),
      s('Maso z II. hlavy sol. na jemno', 3.0),
      s('V kůže sol. na jemno', 2.0),
      p('Pepř černý', 0.18),
      p('Muškátový ořech', 0.035),
      p('Paprika sladká', 0.13),
      p('Zázvor', 0.015),
      p('Pšeničná mouka hrubá', 3.0),
      p('Voda', 21.0, 'l'),
      o('V tenká sdíraná střeva', 195, 'm'),
    ],
  },
  {
    id: '1.23', name: 'Moravské uzenky', categoryId: 1, pdfPage: 37, verified: true,
    outputWeight: '100–120 g 1 ks',
    procedure: 'Zrnění vložky: do 8 mm',
    ingredients: [
      s('HZV sol. na jemno', 25.0),
      s('HPV sol. na vložku', 5.0),
      s('Vl. sol. na jemno', 21.5),
      s('VVsk sol. na jemno', 3.0),
      s('V kůže sol. na jemno', 4.9),
      s('Maso z II. hlavy sol. na jemno', 10.0),
      s('Hřbetní sádlo sol. na vložku', 10.0),
      p('Pepř černý', 0.14),
      p('Kmín', 0.04),
      p('Česnek', 0.65),
      p('Pšeničná mouka hrubá', 2.0),
      p('Voda', 19.0, 'l'),
      o('Hovězí kroužková střeva', 120, 'm'),
      o('Al spony', 1050, 'ks'),
    ],
  },
  {
    id: '1.24', name: 'Výběrové špekáčky', categoryId: 1, pdfPage: 38, verified: true,
    outputWeight: '50–60 g 1 ks',
    procedure: 'Zrnění vložky: 3–8 mm',
    ingredients: [
      s('HZV sol. na jemno', 20.0),
      s('HPV sol. na jemno', 10.0),
      s('Vl. sol. na jemno', 10.0),
      s('Vl. II sol. na jemno', 10.0),
      s('VVsk sol. na jemno', 35.0),
      s('Hřbetní sádlo sol. na vložku', 35.9),
      p('Dusitanová sůl směs', 0.2),
      p('Pepř černý', 0.16),
      p('Paprika sladká', 0.22),
      p('Muškátový ořech', 0.03),
      p('Česnek', 0.09),
      p('Voda', 7.0, 'l'),
      o('Hovězí kroužková střeva', 130, 'm'),
      o('Motouz', 0.15, 'kg'),
    ],
  },
  {
    id: '1.25', name: 'Párky Bívoj', categoryId: 1, pdfPage: 39, verified: true,
    outputWeight: '',
    ingredients: [
      s('HZV na jemno', 20.0),
      s('HPV na jemno', 5.0),
      s('Vl. na jemno', 5.0),
      s('Vl. II na jemno', 5.0),
      s('VVsk na jemno', 42.0),
      p('Dusitanová sůl směs', 2.0),
      p('Pepř černý', 0.2),
      p('Muškátový ořech', 0.1),
      p('Polyfosfáty', 0.3),
      p('Cukr', 0.2),
      p('Kardimon', 0.02),
      p('Nové koření', 0.03),
      p('Paprika sladká', 0.5),
      p('Voda', 36.0, 'l'),
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 2. MĚKKÉ SALÁMY (vybrané normy z OCR extrakce)
  // ─────────────────────────────────────────────────────────
  {
    id: '2.01', name: 'Česnekový salám', categoryId: 2, pdfPage: 42, verified: false,
    ingredients: [],
  },
  {
    id: '2.02', name: 'Kabanos', categoryId: 2, pdfPage: 43, verified: false,
    ingredients: [],
  },
  {
    id: '2.03', name: 'Slovenský salám', categoryId: 2, pdfPage: 44, verified: false,
    ingredients: [],
  },
  {
    id: '2.04', name: 'Italská mortadela', categoryId: 2, pdfPage: 45, verified: false,
    ingredients: [
      s('HZV na jemno', 25.0),
      s('VVbk na jemno', 12.0),
      s('Hřbetní sádlo na vložku', 12.0),
      p('Pepř bílý celý', 0.15),
      p('Kardamom', 0.03),
    ],
  },
  {
    id: '2.05', name: 'Pařížský salám', categoryId: 2, pdfPage: 46, verified: false,
    ingredients: [],
  },
  {
    id: '2.06', name: 'Jemný salám', csn: '577239', categoryId: 2, pdfPage: 47, verified: false,
    ingredients: [
      s('VVbk sol. na jemno', 41.0),
      p('Voda', 22.0, 'l'),
    ],
  },
  {
    id: '2.07', name: 'Gothajský salám', categoryId: 2, pdfPage: 48, verified: false,
    ingredients: [],
  },
  {
    id: '2.08', name: 'Šunkový salám', categoryId: 2, pdfPage: 49, verified: false,
    ingredients: [],
  },
  {
    id: '2.09', name: 'Polský salám', categoryId: 2, pdfPage: 50, verified: false,
    ingredients: [],
  },
  {
    id: '2.10', name: 'Kmínový salám', categoryId: 2, pdfPage: 51, verified: false,
    ingredients: [],
  },
  {
    id: '2.11', name: 'Hanácký salám', categoryId: 2, pdfPage: 52, verified: false,
    ingredients: [],
  },
  {
    id: '2.12', name: 'Hlavičkový salám', categoryId: 2, pdfPage: 53, verified: false,
    ingredients: [],
  },
  {
    id: '2.13', name: 'Chebský salám', categoryId: 2, pdfPage: 54, verified: false,
    ingredients: [],
  },
  {
    id: '2.14', name: 'Tyrolský salám', categoryId: 2, pdfPage: 55, verified: false,
    ingredients: [],
  },
  {
    id: '2.15', name: 'Junior', categoryId: 2, pdfPage: 56, verified: false,
    ingredients: [],
  },
  {
    id: '2.16', name: 'Domažlický salám', categoryId: 2, pdfPage: 57, verified: false,
    ingredients: [],
  },
  {
    id: '2.17', name: 'Studentský salám', categoryId: 2, pdfPage: 58, verified: false,
    ingredients: [],
  },
  {
    id: '2.18', name: 'Opavský salám', categoryId: 2, pdfPage: 59, verified: false,
    ingredients: [],
  },
  {
    id: '2.19', name: 'Starobrněnský salám', categoryId: 2, pdfPage: 60, verified: false,
    ingredients: [],
  },
  {
    id: '2.20', name: 'Místecký salám', categoryId: 2, pdfPage: 61, verified: false,
    ingredients: [],
  },
  {
    id: '2.21', name: 'Valašský salám', categoryId: 2, pdfPage: 62, verified: false,
    ingredients: [],
  },
  {
    id: '2.22', name: 'Ostravan', categoryId: 2, pdfPage: 63, verified: false,
    ingredients: [],
  },
  {
    id: '2.23', name: 'Radynské párky', categoryId: 2, pdfPage: 64, verified: false,
    ingredients: [],
  },
  {
    id: '2.24', name: 'Ještědská klobása', categoryId: 2, pdfPage: 65, verified: false,
    ingredients: [],
  },
  {
    id: '2.25', name: 'Veronský salám', categoryId: 2, pdfPage: 66, verified: false,
    ingredients: [],
  },
  {
    id: '2.26', name: 'Krkonošský salám', categoryId: 2, pdfPage: 67, verified: false,
    ingredients: [],
  },
  {
    id: '2.27', name: 'Lúbový salám Extra', categoryId: 2, pdfPage: 68, verified: false,
    ingredients: [],
  },

  // ─────────────────────────────────────────────────────────
  // 3. TRVANLIVÉ MASNÉ VÝROBKY
  // ─────────────────────────────────────────────────────────
  {
    id: '3.01', name: 'Obyčejný suchý salám', categoryId: 3, pdfPage: 73, verified: false,
    ingredients: [],
  },
  {
    id: '3.02', name: 'Turistický salám II', categoryId: 3, pdfPage: 74, verified: false,
    ingredients: [],
  },
  {
    id: '3.03', name: 'Turistický trvanlivý salám', categoryId: 3, pdfPage: 75, verified: false,
    ingredients: [],
  },
  {
    id: '3.04', name: 'Lovecký salám', categoryId: 3, pdfPage: 77, verified: false,
    ingredients: [
      s('HZV', 30.0),
      s('VVsk', 25.0),
      s('Hřbetní sádlo', 25.0),
      p('Sůl', 2.5),
      p('Pepř černý celý', 0.3),
      p('Paprika pálivá', 0.5),
      p('Česnek', 0.2),
    ],
  },
  {
    id: '3.05', name: 'Spišská klobása', categoryId: 3, pdfPage: 78, verified: false,
    ingredients: [],
  },
  {
    id: '3.06', name: 'Dunajská klobása', categoryId: 3, pdfPage: 79, verified: false,
    ingredients: [],
  },
  {
    id: '3.07', name: 'Pálivý paprikový salám', categoryId: 3, pdfPage: 80, verified: false,
    ingredients: [],
  },
  {
    id: '3.08', name: 'Hodický salám', categoryId: 3, pdfPage: 81, verified: false,
    ingredients: [],
  },
  {
    id: '3.09', name: 'Vysočina', categoryId: 3, pdfPage: 82, verified: false,
    ingredients: [],
  },
  {
    id: '3.10', name: 'Košický salám', categoryId: 3, pdfPage: 83, verified: false,
    ingredients: [],
  },
  {
    id: '3.11', name: 'Gombasecká klobása', categoryId: 3, pdfPage: 84, verified: false,
    ingredients: [],
  },
  {
    id: '3.12', name: 'Rékroant', categoryId: 3, pdfPage: 85, verified: false,
    ingredients: [],
  },
  {
    id: '3.13', name: 'Selský trvanlivý salám', categoryId: 3, pdfPage: 86, verified: false,
    ingredients: [],
  },
  {
    id: '3.14', name: 'Krakovský trvanlivý salám', categoryId: 3, pdfPage: 87, verified: false,
    ingredients: [],
  },
  {
    id: '3.15', name: 'Inovecký trvanlivý salám', categoryId: 3, pdfPage: 88, verified: false,
    ingredients: [],
  },
  {
    id: '3.16', name: 'Smíchovský salám', categoryId: 3, pdfPage: 89, verified: false,
    ingredients: [],
  },
  {
    id: '3.17', name: 'Sverdlovský salám', categoryId: 3, pdfPage: 90, verified: false,
    ingredients: [],
  },
  {
    id: '3.18', name: 'Policán', categoryId: 3, pdfPage: 91, verified: false,
    ingredients: [],
  },
  {
    id: '3.19', name: 'Náchodský salám', categoryId: 3, pdfPage: 92, verified: false,
    ingredients: [],
  },
  {
    id: '3.20', name: 'Písničký trvanlivý salám', categoryId: 3, pdfPage: 93, verified: false,
    ingredients: [],
  },
  {
    id: '3.21', name: 'Herkules', categoryId: 3, pdfPage: 94, verified: false,
    ingredients: [],
  },
  {
    id: '3.22', name: 'Potická klobása', categoryId: 3, pdfPage: 95, verified: false,
    ingredients: [],
  },
  {
    id: '3.23', name: 'Jihočeský trvanlivý salám', categoryId: 3, pdfPage: 96, verified: false,
    ingredients: [],
  },
  {
    id: '3.24', name: 'Moskevský salám', categoryId: 3, pdfPage: 97, verified: false,
    ingredients: [],
  },
  {
    id: '3.25', name: 'Paprikáš', categoryId: 3, pdfPage: 98, verified: false,
    ingredients: [],
  },

  // ─────────────────────────────────────────────────────────
  // 4. SPECIÁLNÍ MASNÉ VÝROBKY
  // ─────────────────────────────────────────────────────────
  {
    id: '4.01', name: 'Čajovky', categoryId: 4, pdfPage: 102, verified: false,
    ingredients: [],
  },
  {
    id: '4.02', name: 'Cikánská pečeně', categoryId: 4, pdfPage: 104, verified: false,
    ingredients: [],
  },
  {
    id: '4.03', name: 'Bídrocínská pečeně', categoryId: 4, pdfPage: 105, verified: false,
    ingredients: [],
  },
  {
    id: '4.04', name: 'Pečeň', categoryId: 4, pdfPage: 106, verified: false,
    ingredients: [],
  },
  {
    id: '4.05', name: 'Příbramský jazykový salám', categoryId: 4, pdfPage: 107, verified: false,
    ingredients: [],
  },
  {
    id: '4.06', name: 'Bůčkový závin světlý', categoryId: 4, pdfPage: 108, verified: false,
    ingredients: [],
  },
  {
    id: '4.07', name: 'Anglická slanina', categoryId: 4, pdfPage: 109, verified: false,
    ingredients: [
      s('Vepřový bok', 107.0),
      p('Dusitanová sůl směs', 2.8),
      p('Cukr', 0.5),
    ],
  },
  {
    id: '4.08', name: 'Moravské uzené maso', categoryId: 4, pdfPage: 110, verified: false,
    ingredients: [],
  },
  {
    id: '4.09', name: 'Dunajský salám', categoryId: 4, pdfPage: 111, verified: false,
    ingredients: [
      s('HPV', 40.0),
      s('VVsk', 30.0),
      s('VVbk', 30.0),
      p('Pepř černý', 0.3),
      p('Paprika sladká', 0.2),
    ],
  },
  {
    id: '4.10', name: 'Lososová šunka', categoryId: 4, pdfPage: 112, verified: false,
    ingredients: [],
  },
  {
    id: '4.11', name: 'Průt.', categoryId: 4, pdfPage: 113, verified: false,
    ingredients: [],
  },
  {
    id: '4.12', name: 'Kladenská pečeně', categoryId: 4, pdfPage: 114, verified: false,
    ingredients: [],
  },
  {
    id: '4.13', name: 'Uzená panenská pečeně', categoryId: 4, pdfPage: 115, verified: false,
    ingredients: [],
  },
  {
    id: '4.14', name: 'Moravská krkovička', categoryId: 4, pdfPage: 116, verified: false,
    ingredients: [],
  },
  {
    id: '4.15', name: 'Kladenská roláda', categoryId: 4, pdfPage: 117, verified: false,
    ingredients: [],
  },
  {
    id: '4.16', name: 'Hradecká mozaika', categoryId: 4, pdfPage: 118, verified: false,
    ingredients: [],
  },
  {
    id: '4.17', name: 'Kladenská slanina', categoryId: 4, pdfPage: 119, verified: false,
    ingredients: [],
  },
  {
    id: '4.18', name: 'Moravská domácí šunka', categoryId: 4, pdfPage: 120, verified: false,
    ingredients: [],
  },
  {
    id: '4.19', name: 'Lázeňský závin', categoryId: 4, pdfPage: 121, verified: false,
    ingredients: [],
  },
  {
    id: '4.20', name: 'Tatarské maso', categoryId: 4, pdfPage: 122, verified: false,
    ingredients: [],
  },
  {
    id: '4.21', name: 'Lovecká šunka', categoryId: 4, pdfPage: 123, verified: false,
    ingredients: [],
  },
  {
    id: '4.22', name: 'Liberecká šunkový mozaika', categoryId: 4, pdfPage: 124, verified: false,
    ingredients: [],
  },
  {
    id: '4.23', name: 'Speciální šunkový závin', categoryId: 4, pdfPage: 125, verified: false,
    ingredients: [],
  },
  {
    id: '4.24', name: 'Písničký závin', categoryId: 4, pdfPage: 127, verified: false,
    ingredients: [],
  },
  {
    id: '4.25', name: 'Rychlářská krkovička', categoryId: 4, pdfPage: 128, verified: false,
    ingredients: [],
  },
  {
    id: '4.26', name: 'Pražská slanina', categoryId: 4, pdfPage: 128, verified: false,
    ingredients: [],
  },
  {
    id: '4.27', name: 'Čajový salám', categoryId: 4, pdfPage: 129, verified: false,
    ingredients: [],
  },
  {
    id: '4.28', name: 'Dušená šunka', categoryId: 4, pdfPage: 130, verified: false,
    ingredients: [],
  },

  // ─────────────────────────────────────────────────────────
  // 5. VAŘENÉ MASNÉ VÝROBKY
  // ─────────────────────────────────────────────────────────
  {
    id: '5.01', name: 'Domácí jaternice', categoryId: 5, pdfPage: 132, verified: false,
    ingredients: [],
  },
  {
    id: '5.02', name: 'Jaternice lahůdkové hrubosekané', categoryId: 5, pdfPage: 133, verified: false,
    ingredients: [],
  },
  {
    id: '5.03', name: 'Domácí kroupová jelítka', categoryId: 5, pdfPage: 134, verified: false,
    ingredients: [],
  },
  {
    id: '5.04', name: 'Domácí žemlová jelítka', categoryId: 5, pdfPage: 135, verified: false,
    ingredients: [],
  },
  {
    id: '5.05', name: 'Tlačenka černá lidová', categoryId: 5, pdfPage: 136, verified: false,
    ingredients: [],
  },
  {
    id: '5.06', name: 'Tlačenka světlá masová', categoryId: 5, pdfPage: 137, verified: false,
    ingredients: [],
  },
  {
    id: '5.07', name: 'Slezská tlačenka', categoryId: 5, pdfPage: 138, verified: false,
    ingredients: [],
  },
  {
    id: '5.08', name: 'Hornická tlačenka', categoryId: 5, pdfPage: 139, verified: false,
    ingredients: [],
  },
  {
    id: '5.09', name: 'Játrový lahůdkový salám', categoryId: 5, pdfPage: 140, verified: false,
    ingredients: [],
  },
  {
    id: '5.10', name: 'Játrovky', categoryId: 5, pdfPage: 141, verified: false,
    ingredients: [],
  },
  {
    id: '5.11', name: 'Játrový sýr', categoryId: 5, pdfPage: 142, verified: false,
    ingredients: [],
  },
  {
    id: '5.12', name: 'Taliány', categoryId: 5, pdfPage: 143, verified: false,
    ingredients: [],
  },
  {
    id: '5.13', name: 'Martinovské kostky', categoryId: 5, pdfPage: 144, verified: false,
    ingredients: [],
  },
  {
    id: '5.14', name: 'Ovarové ramínko', categoryId: 5, pdfPage: 145, verified: false,
    ingredients: [],
  },
  {
    id: '5.15', name: 'Vařený paprikovaný lalok', categoryId: 5, pdfPage: 146, verified: false,
    ingredients: [],
  },
  {
    id: '5.16', name: 'Martinovský játrový sýr', categoryId: 5, pdfPage: 147, verified: false,
    ingredients: [],
  },
  {
    id: '5.17', name: 'Selská tlačenka', categoryId: 5, pdfPage: 148, verified: false,
    ingredients: [],
  },
  {
    id: '5.18', name: 'Lahůdková jelítka hrubosekané', categoryId: 5, pdfPage: 149, verified: false,
    ingredients: [],
  },
  {
    id: '5.19', name: 'Staročeský játrový salám', categoryId: 5, pdfPage: 150, verified: false,
    ingredients: [],
  },
  {
    id: '5.20', name: 'Lahůdkové játrovky', categoryId: 5, pdfPage: 151, verified: false,
    ingredients: [],
  },
  {
    id: '5.21', name: 'Moravská jaternice', categoryId: 5, pdfPage: 152, verified: false,
    ingredients: [],
  },
  {
    id: '5.22', name: 'Selská tlačenka tmavá', categoryId: 5, pdfPage: 153, verified: false,
    ingredients: [],
  },
  {
    id: '5.23', name: 'Plzeňský krevní salám', categoryId: 5, pdfPage: 154, verified: false,
    ingredients: [],
  },
  {
    id: '5.24', name: 'Pražská lahůdková tlačenka', categoryId: 5, pdfPage: 155, verified: false,
    ingredients: [],
  },
  {
    id: '5.25', name: 'Přírodní skopovité na majoránce', categoryId: 5, pdfPage: 155, verified: false,
    ingredients: [],
  },
  {
    id: '5.26', name: 'Lahůdkové salamy se žampiony', categoryId: 5, pdfPage: 156, verified: false,
    ingredients: [],
  },
  {
    id: '5.27', name: 'Úvalský játrový sýr', categoryId: 5, pdfPage: 158, verified: false,
    ingredients: [],
  },
  {
    id: '5.28', name: 'Pražský játrový sýr', categoryId: 5, pdfPage: 159, verified: false,
    ingredients: [],
  },
  {
    id: '5.29', name: 'Selský sýr', categoryId: 5, pdfPage: 160, verified: false,
    ingredients: [],
  },
  {
    id: '5.30', name: 'Játrovky s lečovou zeleninou', categoryId: 5, pdfPage: 161, verified: false,
    ingredients: [],
  },
  {
    id: '5.31', name: 'Játrovky s holčicí', categoryId: 5, pdfPage: 162, verified: false,
    ingredients: [],
  },
  {
    id: '5.32', name: 'Jazyková mozaika', categoryId: 5, pdfPage: 163, verified: false,
    ingredients: [],
  },

  // ─────────────────────────────────────────────────────────
  // 6. PEČENÉ MASNÉ VÝROBKY
  // ─────────────────────────────────────────────────────────
  {
    id: '6.01', name: 'Domácí sekaná pečeně', categoryId: 6, pdfPage: 165, verified: false,
    ingredients: [],
  },
  {
    id: '6.02', name: 'Domácí sekaná pečeně Extra', categoryId: 6, pdfPage: 166, verified: false,
    ingredients: [],
  },
  {
    id: '6.03', name: 'Sekaná pečeně', categoryId: 6, pdfPage: 166, verified: false,
    ingredients: [],
  },
  {
    id: '6.04', name: 'Jemná sekaná pečeně', categoryId: 6, pdfPage: 167, verified: false,
    ingredients: [],
  },

  // ─────────────────────────────────────────────────────────
  // 7. OSTATNÍ MASNÉ VÝROBKY
  // ─────────────────────────────────────────────────────────
  {
    id: '7.01', name: 'Bílé klobásy', categoryId: 7, pdfPage: 169, verified: false,
    ingredients: [],
  },
  {
    id: '7.02', name: 'Vinné klobásy', categoryId: 7, pdfPage: 170, verified: false,
    ingredients: [],
  },
  {
    id: '7.03', name: 'Klobásy k zapékání do těsta', categoryId: 7, pdfPage: 171, verified: false,
    ingredients: [],
  },
  {
    id: '7.04', name: 'Šumavská klobása', categoryId: 7, pdfPage: 172, verified: false,
    ingredients: [],
  },
  {
    id: '7.05', name: 'Svalotečné klobásy', categoryId: 7, pdfPage: 173, verified: false,
    ingredients: [],
  },
  {
    id: '7.06', name: 'Uhliřky', categoryId: 7, pdfPage: 174, verified: false,
    ingredients: [],
  },
  {
    id: '7.07', name: 'Játrová zavářka', categoryId: 7, pdfPage: 175, verified: false,
    ingredients: [],
  },
  {
    id: '7.08', name: 'Mostecký salám', categoryId: 7, pdfPage: 176, verified: false,
    ingredients: [],
  },
  {
    id: '7.09', name: 'Huspenina', categoryId: 7, pdfPage: 177, verified: false,
    ingredients: [],
  },
  {
    id: '7.10', name: 'Lahůdková huspenina', categoryId: 7, pdfPage: 179, verified: false,
    ingredients: [],
  },

  // ─────────────────────────────────────────────────────────
  // 8. KONZERVY (výběr)
  // ─────────────────────────────────────────────────────────
  {
    id: '8.01', name: 'Hovězí maso ve vlastní šťávě', categoryId: 8, pdfPage: 180, verified: false,
    ingredients: [],
  },
  {
    id: '8.02', name: 'Hovězí maso ve vlastní šťávě II', categoryId: 8, pdfPage: 181, verified: false,
    ingredients: [],
  },
  {
    id: '8.03', name: 'Selské maso ve vlastní šťávě', categoryId: 8, pdfPage: 182, verified: false,
    ingredients: [],
  },
  {
    id: '8.04', name: 'Vepřové maso ve vlastní šťávě II', categoryId: 8, pdfPage: 184, verified: false,
    ingredients: [],
  },
  {
    id: '8.05', name: 'Játrová paštika', categoryId: 8, pdfPage: 185, verified: false,
    ingredients: [],
  },
  {
    id: '8.06', name: 'Játrová lahůdková paštika', categoryId: 8, pdfPage: 186, verified: false,
    ingredients: [],
  },
  {
    id: '8.07', name: 'Lahůdkový vepřový krém', categoryId: 8, pdfPage: 187, verified: false,
    ingredients: [],
  },
  {
    id: '8.08', name: 'Šunková plňa', categoryId: 8, pdfPage: 188, verified: false,
    ingredients: [],
  },
  {
    id: '8.42', name: 'Grill meat', categoryId: 8, pdfPage: 221, verified: false,
    ingredients: [],
  },
]

export const BASE_WEIGHT_G = 100_000 // všechny normy jsou na 100 kg hotového výrobku
