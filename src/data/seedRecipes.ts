import { v4 as uuidv4 } from 'uuid'
import type { Recipe, Ingredient, ProcessStep, RecipeMeta } from '../types/recipe'

function i(
  name: string,
  amount: number,
  unit: Ingredient['unit'],
  group: Ingredient['group']
): Ingredient {
  return { id: uuidv4(), name, amount, unit, group }
}

function s(order: number, description: string, opts?: { title?: string; duration?: number; temperature?: number }): ProcessStep {
  return { id: uuidv4(), order, description, ...opts }
}

function recipe(
  id: string,
  title: string,
  meta: Omit<RecipeMeta, 'title' | 'tags' | 'starred'> & { tags?: string[] },
  ingredients: Ingredient[],
  process: ProcessStep[],
  notes: string
): Recipe {
  const now = new Date('2025-01-01T12:00:00.000Z').toISOString()
  return {
    id,
    meta: { title, tags: [], starred: false, ...meta },
    ingredients,
    process,
    notes,
    photos: [],
    sourceType: 'manual',
    createdAt: now,
    updatedAt: now,
  }
}

// ── Společné kroky ────────────────────────────────────────────────────────────

function salamSteps(extra?: string): ProcessStep[] {
  return [
    s(0, 'Maso a sádlo nakrájet na kostky 3×3 cm, uložit na 1–2 hodiny do mrazáku (−2 °C). Všechny nástroje a části mlýnku předem vychladit.', { title: 'Příprava' }),
    s(1, 'Maso umlít na 6–8mm desce, sádlo na 6mm desce. Přemístit zpět do mrazáku na 30 minut.', { title: 'Mletí' }),
    s(2, `Přidat Pragandu, koření a víno/lihové přísady. Startovací kulturu předem rozpustit ve 20 ml studené vody (15 min). Míchat do vyvinutí lepivosti — test přilnutí náplně k dlani.${extra ? ' ' + extra : ''}`, { title: 'Míchání', duration: 15 }),
    s(3, 'Plnit do předem namočených střívek pevně, bez vzduchových kapes. Svázat nebo spnout na požadovanou délku. Celý povrch propíchnout sterilní jehlou.', { title: 'Plnění' }),
    s(4, 'Zavěsit v teplotě 22–24 °C a vlhkosti 85–95 % na 24–48 hodin. Cílové pH po fermentaci ≤ 5,3.', { title: 'Fermentace', duration: 1440, temperature: 23 }),
    s(5, 'Přesunout do zracího prostoru (13–15 °C, 75–85 % r. v.). Zrát minimálně 6–10 týdnů nebo do 30–35% hmotnostního úbytku. Průběžně kontrolovat ušlechtilou plíseň.', { title: 'Zrání', temperature: 14 }),
  ]
}

function suseneMasoCure(days: number, extra?: string): ProcessStep[] {
  return [
    s(0, 'Maso očistit od přebytečného tuku a šlach. Osušit papírovými utěrkami.', { title: 'Příprava masa' }),
    s(1, `Pragandu (a koření) důkladně vetřít ze všech stran. Vakuovat nebo uložit do uzavíratelné nádoby.${extra ? ' ' + extra : ''}`, { title: 'Nasolování' }),
    s(2, `Uložit do lednice (4 °C) na ${days} dní. Každý druhý den obrátit a přerozdělovat vytéklé šťávy.`, { title: 'Zrání v soli', duration: days * 24 * 60, temperature: 4 }),
    s(3, 'Opláchnout pod studenou vodou, důkladně osušit. Případně obalit kořením nebo zavázat do střeva/sítě.', { title: 'Oplach a tvarování' }),
    s(4, 'Zavěsit v zracím prostoru 13–15 °C, 75–80 % r. v. Sušit do 30–40 % hmotnostního úbytku (cca 4–8 týdnů).', { title: 'Sušení', temperature: 14 }),
  ]
}

// ── 5 000 g base — premium salámy ─────────────────────────────────────────────

const modraKrev = recipe(
  'seed-modra-krev',
  'Modrá krev',
  {
    category: 'salamy',
    description: 'Prémiový fermentovaný salám s italskou Gorgonzolou a vlašskými ořechy. Křehká struktura, výrazné aroma.',
    baseWeight: 5000,
    difficulty: 3,
    tags: ['gorgonzola', 'ořechy', 'prémiový', 'fermentovaný', 'portské'],
  },
  [
    i('Vepřová plec', 3500, 'g', 'maso'),
    i('Hřbetní tuk', 1500, 'g', 'maso'),
    i('Gorgonzola (zmrazená)', 400, 'g', 'přísady'),
    i('Vlašské ořechy (hrubě sekané)', 150, 'g', 'přísady'),
    i('Praganda', 125, 'g', 'solanky'),
    i('Bílý pepř mletý', 15, 'g', 'koření'),
    i('Muškátový oříšek', 2.5, 'g', 'koření'),
    i('Dextróza', 25, 'g', 'přísady'),
    i('Startovací kultura', 1, 'g', 'přísady'),
    i('Portské víno', 100, 'ml', 'přísady'),
  ],
  salamSteps('Gorgonzolu přidat zmrazenou nakrájenou na kostky 1 cm a ořechy až při posledním míchání — zachovat viditelné kousky.'),
  'Gorgonzolu přidávat vždy zmrazenou, jinak se roztírá a ztrácí vizuální efekt řezu. Portské víno dává příjemnou sladkost a barvivo. Ideální střívko: hovězí střevo 60–65 mm, nebo kolagen 55 mm.'
)

const kanciFK = recipe(
  'seed-kanci-fik',
  'Kančí fík',
  {
    category: 'salamy',
    description: 'Zvěřinový salám se sušenými fíky, jalkovcem a badyánem. Přírodní sladkost a divoká chuť.',
    baseWeight: 5000,
    difficulty: 3,
    tags: ['zvěřina', 'divočák', 'fíky', 'jalovec', 'fermentovaný'],
  },
  [
    i('Kančí/jelení zvěřina', 2500, 'g', 'maso'),
    i('Vepřový bok', 2500, 'g', 'maso'),
    i('Sušené fíky (jemně sekané)', 250, 'g', 'přísady'),
    i('Praganda', 130, 'g', 'solanky'),
    i('Černý pepř drcený', 20, 'g', 'koření'),
    i('Jalovec mletý', 5, 'g', 'koření'),
    i('Badyán mletý', 2.5, 'g', 'koření'),
    i('Sušený česnek', 10, 'g', 'koření'),
    i('Dextróza', 20, 'g', 'přísady'),
    i('Startovací kultura', 1, 'g', 'přísady'),
    i('Červené víno (Cabernet)', 50, 'ml', 'přísady'),
  ],
  salamSteps('Fíky přidat při finálním míchání a jen promíchat — kusy musí zůstat celé.'),
  'Zvěřina je chudá na tuk — proto nutně kombinovat s tučnějším vepřovým bokem. Fíky přidat co nejpozději. Zrání min. 8 týdnů — zvěřinové bílkoviny zrají pomaleji.'
)

const lanyzovyPan = recipe(
  'seed-lanyzovy-pan',
  'Lanýžový Pán',
  {
    category: 'salamy',
    description: 'Luxusní salám s lanýžovým olejem a parmazánem. Intenzivní zemité aroma, jemná textura.',
    baseWeight: 5000,
    difficulty: 3,
    tags: ['lanýž', 'parmazán', 'prémiový', 'italský', 'fermentovaný'],
  },
  [
    i('Vepřová kýta', 3500, 'g', 'maso'),
    i('Hřbetní tuk', 1500, 'g', 'maso'),
    i('Parmigiano Reggiano (strouhaný)', 200, 'g', 'přísady'),
    i('Praganda', 125, 'g', 'solanky'),
    i('Černý pepř mletý', 15, 'g', 'koření'),
    i('Dextróza', 25, 'g', 'přísady'),
    i('Lanýžový olej', 35, 'ml', 'přísady'),
    i('Startovací kultura', 1, 'g', 'přísady'),
  ],
  salamSteps('Parmazán přidat ke koření. Lanýžový olej přidat až jako poslední, jen promíchat.'),
  'Lanýžový olej je velmi intenzivní — nepřidávat více než předepsáno. Parmazán přispívá k chuti i vazbě. Střívko: hovězí 55–65 mm. Po zrání vakuovat a skladovat v lednici.'
)

const cernaPerlaSalam = recipe(
  'seed-cerna-perla',
  'Černá Perla (Fuet)',
  {
    category: 'salamy',
    description: 'Španělský fuet s sepiím inkoustem — dramaticky černý řez, lehká chuť mořského jodu.',
    baseWeight: 5000,
    difficulty: 3,
    tags: ['fuet', 'sépiový inkoust', 'španělský', 'fermentovaný', 'vizuální'],
  },
  [
    i('Vepřová plec', 3500, 'g', 'maso'),
    i('Hřbetní špek', 1500, 'g', 'maso'),
    i('Sépiové barvivo', 45, 'g', 'přísady'),
    i('Praganda', 120, 'g', 'solanky'),
    i('Bílý pepř mletý', 15, 'g', 'koření'),
    i('Fenyklová semínka', 20, 'g', 'koření'),
    i('Sušená citronová kůra', 10, 'g', 'koření'),
    i('Dextróza', 10, 'g', 'přísady'),
    i('Startovací kultura', 1, 'g', 'přísady'),
    i('Bílé víno (Albariño)', 50, 'ml', 'přísady'),
  ],
  salamSteps('Sépiové barvivo rozmíchat v bílém víně před přidáním do masse — zajistí rovnoměrné zbarvení.'),
  'Sépiové barvivo (Sepia officinalis) kupovat ve sterilních sáčcích od rybáře nebo specializovaných obchodů. Při plnění používat rukavice — barví trvale. Střívko: vepřové tenké (fuet formát 30–40 mm).'
)

const kachniNoblesa = recipe(
  'seed-kachni-noblesa',
  'Kachní Noblesa (Fuet)',
  {
    category: 'salamy',
    description: 'Kachní fuet se sušenými fíky, skořicí a muškátem. Elegantní vánoční aroma.',
    baseWeight: 5000,
    difficulty: 3,
    tags: ['fuet', 'kachna', 'fíky', 'skořice', 'fermentovaný'],
  },
  [
    i('Kachní maso (bez kůže)', 2000, 'g', 'maso'),
    i('Vepřová plec', 2000, 'g', 'maso'),
    i('Hřbetní špek', 1000, 'g', 'maso'),
    i('Sušené fíky (jemně sekané)', 200, 'g', 'přísady'),
    i('Vlašské ořechy', 100, 'g', 'přísady'),
    i('Praganda', 125, 'g', 'solanky'),
    i('Černý pepř mletý', 15, 'g', 'koření'),
    i('Skořice', 5, 'g', 'koření'),
    i('Muškátový oříšek', 5, 'g', 'koření'),
    i('Dextróza', 15, 'g', 'přísady'),
    i('Startovací kultura', 1, 'g', 'přísady'),
  ],
  salamSteps('Fíky a ořechy přidat při posledním míchání.'),
  'Kachní maso má vyšší obsah tuku než jiná drůbež — výsledek je sytý a aromatický. Zrání probíhá pomaleji než u čistě vepřových salamů, počítat s 8–10 týdny.'
)

const hribkovyLovec = recipe(
  'seed-hribkovy-lovec',
  'Hříbkový Lovec (Fuet)',
  {
    category: 'salamy',
    description: 'Venkovský fuet se sušenými hřiby a lanýžovým olejem. Zemitá, podzimní chuť.',
    baseWeight: 5000,
    difficulty: 2,
    tags: ['fuet', 'hřiby', 'houby', 'lanýž', 'fermentovaný'],
  },
  [
    i('Vepřový bůček', 4000, 'g', 'maso'),
    i('Hovězí zadní', 1000, 'g', 'maso'),
    i('Sušené hřiby (mletý prach)', 75, 'g', 'přísady'),
    i('Praganda', 125, 'g', 'solanky'),
    i('Černý pepř mletý', 10, 'g', 'koření'),
    i('Sušený česnek', 10, 'g', 'koření'),
    i('Lanýžový olej', 30, 'ml', 'přísady'),
    i('Dextróza', 15, 'g', 'přísady'),
    i('Startovací kultura', 1, 'g', 'přísady'),
  ],
  salamSteps(),
  'Hřibový prach se dá jednoduše připravit mletím sušených hřibů v mixéru. Přidávat spolu s kořením. Bůček zajišťuje dobrou tučnost a soudržnost.'
)

const visualShock = recipe(
  'seed-visual-shock',
  'Visual Shock – Černý salám',
  {
    category: 'salamy',
    description: 'Dramaticky černý salám s fenyklem a citronem. Vizuálně efektní, chuť jemná a svěží.',
    baseWeight: 5000,
    difficulty: 2,
    tags: ['černý', 'sépiový inkoust', 'fenykl', 'vizuální', 'fermentovaný'],
  },
  [
    i('Vepřová plec', 3500, 'g', 'maso'),
    i('Hřbetní špek', 1500, 'g', 'maso'),
    i('Sépiový inkoust', 45, 'g', 'přísady'),
    i('Praganda', 120, 'g', 'solanky'),
    i('Bílý pepř mletý', 15, 'g', 'koření'),
    i('Fenyklová semínka', 10, 'g', 'koření'),
    i('Sušená citronová kůra', 5, 'g', 'koření'),
    i('Dextróza', 25, 'g', 'přísady'),
    i('Startovací kultura', 1, 'g', 'přísady'),
    i('Bílé víno', 50, 'ml', 'přísady'),
  ],
  salamSteps('Inkoust rozmíchat ve víně a přilít k mase — rovnoměrně promíchat.'),
  'Podobný konceptu Černé Perly, ale jiné koření a poměry. Na prezentačních talířích vytváří fascinující kontrast. Rukavice nutností při práci s inkoustem.'
)

const silkRoad = recipe(
  'seed-silk-road',
  'Silk Road',
  {
    category: 'salamy',
    description: 'Asijsky inspirovaný salám se sečuánským pepřem, badyánem a sójovou omáčkou.',
    baseWeight: 5000,
    difficulty: 2,
    tags: ['asijský', 'sečuán', 'badyán', 'sójová', 'fermentovaný', 'hedvábná stezka'],
  },
  [
    i('Vepřový bůček', 4000, 'g', 'maso'),
    i('Hovězí zadní', 1000, 'g', 'maso'),
    i('Praganda', 125, 'g', 'solanky'),
    i('Sečuánský pepř (mletý)', 20, 'g', 'koření'),
    i('Badyán mletý', 5, 'g', 'koření'),
    i('Sušený zázvor', 10, 'g', 'koření'),
    i('Chilli vločky', 5, 'g', 'koření'),
    i('Cukr', 25, 'g', 'přísady'),
    i('Sójová omáčka', 50, 'ml', 'přísady'),
    i('Rýžové víno Shaoxing', 50, 'ml', 'přísady'),
    i('Startovací kultura', 1, 'g', 'přísady'),
  ],
  salamSteps('Sójovou omáčku a víno Shaoxing smíchat, přidat ke kulturám. Pozor na vyšší obsah sodíku v sójovce — odpovídajícím způsobem snížit Pragandu na max. 100 g.'),
  'Sójová omáčka přidává slanost — doporučuji snížit Pragandu na 100 g místo 125 g. Sečuánský pepř působí typicky znecitlivující/brnivý efekt. Střívko: vepřové tenké nebo hovězí.'
)

const barista = recipe(
  'seed-barista',
  'Barista (Kávový salám)',
  {
    category: 'salamy',
    description: 'Kávový salám s lískovými ořechy a kardamomem. Sametová chuť s kávovým závěrem.',
    baseWeight: 5000,
    difficulty: 2,
    tags: ['káva', 'ořechy', 'kardamom', 'kávový likér', 'fermentovaný'],
  },
  [
    i('Vepřová krkovice', 3500, 'g', 'maso'),
    i('Hřbetní sádlo', 1500, 'g', 'maso'),
    i('Lískové ořechy (hrubě sekané)', 250, 'g', 'přísady'),
    i('Praganda', 125, 'g', 'solanky'),
    i('Mletá káva (jemná, tmavě pražená)', 35, 'g', 'přísady'),
    i('Černý pepř mletý', 10, 'g', 'koření'),
    i('Kardamom mletý', 2, 'g', 'koření'),
    i('Dextróza', 20, 'g', 'přísady'),
    i('Kávový likér (Kahlúa/Mr. Black)', 50, 'ml', 'přísady'),
    i('Startovací kultura', 1, 'g', 'přísady'),
  ],
  salamSteps('Ořechy přidat jako poslední a jen jemně promíchat pro zachování struktury.'),
  'Mletá káva se přidává přímo jako koření — nerozmíchávat s vodou. Kávový likér dodává aroma i cukry pro fermentaci. Lískové ořechy pražit na suché pánvi před přidáním pro intenzivnější aroma.'
)

const kavoveZrno = recipe(
  'seed-kavove-zrno',
  'Kávové zrno',
  {
    category: 'salamy',
    description: 'Kávový salám s lískovými ořechy a kardamomem — lehčí varianta Baristy.',
    baseWeight: 5000,
    difficulty: 2,
    tags: ['káva', 'ořechy', 'kardamom', 'kávový likér', 'fermentovaný'],
  },
  [
    i('Vepřová krkovice', 3500, 'g', 'maso'),
    i('Hřbetní sádlo', 1500, 'g', 'maso'),
    i('Lískové ořechy (hrubě sekané)', 150, 'g', 'přísady'),
    i('Praganda', 125, 'g', 'solanky'),
    i('Černý pepř mletý', 15, 'g', 'koření'),
    i('Káva mletá', 30, 'g', 'přísady'),
    i('Kardamom mletý', 5, 'g', 'koření'),
    i('Dextróza', 20, 'g', 'přísady'),
    i('Kávový likér', 50, 'ml', 'přísady'),
    i('Startovací kultura', 1, 'g', 'přísady'),
  ],
  salamSteps('Ořechy přidat nakonec a jen jemně promíchat.'),
  'Varianta Baristy s o trochu méně ořechy a více pepře. Skvělý výsledek jako dárková varianta — dekorace celými lískovými ořechy zvenčí střívka před sušením.'
)

const asijskyDrak = recipe(
  'seed-asijsky-drak',
  'Asijský drak',
  {
    category: 'salamy',
    description: 'Pikantní asijský salám se sečuánem, badyánem a sušenou pomerančovou kůrou.',
    baseWeight: 5000,
    difficulty: 2,
    tags: ['asijský', 'sečuán', 'badyán', 'pomeranč', 'fermentovaný'],
  },
  [
    i('Vepřový bůček', 4000, 'g', 'maso'),
    i('Hovězí zadní', 1000, 'g', 'maso'),
    i('Praganda', 125, 'g', 'solanky'),
    i('Sečuánský pepř (mletý)', 15, 'g', 'koření'),
    i('Badyán mletý', 5, 'g', 'koření'),
    i('Zázvor sušený', 3, 'g', 'koření'),
    i('Sušená pomerančová kůra', 10, 'g', 'koření'),
    i('Cukr', 20, 'g', 'přísady'),
    i('Sójová omáčka', 50, 'ml', 'přísady'),
    i('Startovací kultura', 1, 'g', 'přísady'),
  ],
  salamSteps('Při použití sójovky snížit Pragandu na 100 g.'),
  'Podobný konceptu Silk Road, ale s pomerančovou kůrou místo Shaoxing vína. Pomeranč a badyán tvoří výbornou kombinaci typickou pro čínské 5 koření.'
)

const lesniDuch = recipe(
  'seed-lesni-duch',
  'Lesní duch',
  {
    category: 'salamy',
    description: 'Zvěřinový salám s hřiby, jalkovcem a červeným vínem. Autentická lesní chuť.',
    baseWeight: 5000,
    difficulty: 3,
    tags: ['zvěřina', 'divočák', 'jelen', 'hřiby', 'jalovec', 'fermentovaný'],
  },
  [
    i('Zvěřina (kančí nebo jelení)', 2500, 'g', 'maso'),
    i('Vepřový lalok nebo sádlo', 2500, 'g', 'maso'),
    i('Praganda', 125, 'g', 'solanky'),
    i('Sušené hřiby (prach)', 40, 'g', 'přísady'),
    i('Jalovec mletý', 10, 'g', 'koření'),
    i('Černý pepř mletý', 5, 'g', 'koření'),
    i('Sušený česnek', 3, 'g', 'koření'),
    i('Červené víno', 100, 'ml', 'přísady'),
    i('Startovací kultura', 1, 'g', 'přísady'),
  ],
  salamSteps(),
  'Zvěřina se musí vždy mrazit min. 30 dní před zpracováním (veterinární požadavek). Lalok je výborný tučný protějšek magertní zvěřiny. Červené víno použít plnobodé — Cabernet, Merlot, Frankovka.'
)

// ── 1 000 g base — premium salámy ─────────────────────────────────────────────

const moleFuet = recipe(
  'seed-mole-fuet',
  'Mole Fuet',
  {
    category: 'salamy',
    description: 'Mexický fuet inspirovaný omáčkou mole — kakao, ancho paprika a mezcal.',
    baseWeight: 1000,
    difficulty: 3,
    tags: ['fuet', 'kakao', 'mezcal', 'mexický', 'ancho', 'fermentovaný'],
  },
  [
    i('Vepřové maso (plec)', 760, 'g', 'maso'),
    i('Hřbetní sádlo', 240, 'g', 'maso'),
    i('Praganda', 25, 'g', 'solanky'),
    i('Kakao (100%)', 10, 'g', 'přísady'),
    i('Ancho paprika (sušená, mletá)', 3, 'g', 'koření'),
    i('Pasilla paprika (mletá)', 1, 'g', 'koření'),
    i('Černý pepř mletý', 2, 'g', 'koření'),
    i('Dextróza', 1, 'g', 'přísady'),
    i('Mezcal', 16, 'ml', 'přísady'),
    i('Startovací kultura', 0.25, 'g', 'přísady'),
    i('Penicillium nalgiovense', 1, 'g', 'přísady'),
  ],
  salamSteps('Penicillium nalgiovense nařídit na povrch ihned po plnění — postřikem nebo otřením.'),
  'Ancho a Pasilla papriky jsou sušené mexické chilli s hlubokou čokoládovou a ovocnou příchutí. Mezcal (ne tequila) dává kouřové aroma. Penicillium nalgiovense zajišťuje bílý plísňový povlak typický pro evropské salámy.'
)

const nordickeZlato = recipe(
  'seed-nordicke-zlato',
  'Nordické Zlato',
  {
    category: 'salamy',
    description: 'Skandinávský jelení salám s lyofilizovanými brusinkami, jalkovcem a javorovým bourbonem.',
    baseWeight: 1000,
    difficulty: 3,
    tags: ['nordický', 'jelen', 'daněk', 'brusinka', 'jalovec', 'bourbon', 'fermentovaný'],
  },
  [
    i('Jelení nebo daňčí maso', 700, 'g', 'maso'),
    i('Hřbetní sádlo', 300, 'g', 'maso'),
    i('Praganda', 24, 'g', 'solanky'),
    i('Lyofilizované brusinky', 24, 'g', 'přísady'),
    i('Jalovec drcený', 3, 'g', 'koření'),
    i('Uzená mořská sůl', 2, 'g', 'koření'),
    i('Černý pepř mletý', 1.6, 'g', 'koření'),
    i('Dextróza', 1, 'g', 'přísady'),
    i('Javorovo-bourbonová redukce', 20, 'ml', 'přísady'),
    i('Startovací kultura', 0.25, 'g', 'přísady'),
  ],
  salamSteps('Javorovo-bourbonovou redukci připravit předem: 50 ml bourbonu + 2 lžíce javorového sirupu, zredukovat na polovinu a nechat vychladnout.'),
  'Lyofilizované (mrazem sušené) brusinky zachovávají barvu a kyselost. Uzená mořská sůl přidává extra hloubku. Javorovo-bourbonová redukce je tajná zbraň — tvoří karamelovou sladkost na pozadí.'
)

const tokijskyDrifting = recipe(
  'seed-tokijsky-drifting',
  'Tokijský Drifting',
  {
    category: 'salamy',
    description: 'Japonský salám s Aka miso, opraženým sezamem a redukcí sake a mirin.',
    baseWeight: 1000,
    difficulty: 3,
    tags: ['japonský', 'miso', 'sezam', 'sake', 'mirin', 'fermentovaný'],
  },
  [
    i('Hovězí zadní', 400, 'g', 'maso'),
    i('Vepřový bůček', 340, 'g', 'maso'),
    i('Hřbetní sádlo', 260, 'g', 'maso'),
    i('Praganda', 20, 'g', 'solanky'),
    i('Miso pasta Aka (červená)', 30, 'g', 'přísady'),
    i('Opražený sezam', 8, 'g', 'přísady'),
    i('Čerstvý zázvor (nastrouhaný)', 3, 'g', 'koření'),
    i('Sušený česnek', 2, 'g', 'koření'),
    i('Cukr', 1, 'g', 'přísady'),
    i('Redukce sake + mirin (1:1)', 20, 'ml', 'přísady'),
    i('Startovací kultura', 0.25, 'g', 'přísady'),
  ],
  salamSteps('Miso pastu vmíchat ve víně/sake redukci — lépe se distribuuje. Pozor: miso je slané, Pragandu snížit na 18 g.'),
  'Aka (červené) miso je nejfermentovanější a nejintenzivnější — používat opatrně. Sake+mirin redukce: rovným dílem, vařit 5 min. Sezam přidat celý, opražený.'
)

const stredomorskiEthos = recipe(
  'seed-stredomorsky-ethos',
  'Středomořský Éthos',
  {
    category: 'salamy',
    description: 'Jehněčí salám s fetou, sušenými rajčaty, olivami a ouzo.',
    baseWeight: 1000,
    difficulty: 3,
    tags: ['jehněčí', 'feta', 'olivy', 'ouzo', 'středomořský', 'řecký', 'fermentovaný'],
  },
  [
    i('Jehněčí maso', 500, 'g', 'maso'),
    i('Libové vepřové', 300, 'g', 'maso'),
    i('Hřbetní sádlo', 200, 'g', 'maso'),
    i('Feta (zmrazená)', 80, 'g', 'přísady'),
    i('Sušená rajčata (sekané)', 30, 'g', 'přísady'),
    i('Olivy Kalamata (sekané, bez oleje)', 20, 'g', 'přísady'),
    i('Praganda', 25, 'g', 'solanky'),
    i('Černý pepř mletý', 2.4, 'g', 'koření'),
    i('Oregáno sušené', 1, 'g', 'koření'),
    i('Rozmarýn sušený', 0.6, 'g', 'koření'),
    i('Dextróza', 1, 'g', 'přísady'),
    i('Ouzo', 16, 'ml', 'přísady'),
    i('Startovací kultura', 0.25, 'g', 'přísady'),
  ],
  salamSteps('Fetu přidat zmrazenou, nakrájenou na kostky 0,5 cm. Olivy dobře vysoušet od oleje — olej brání vazbě. Rajčata nakrájet najemno.'),
  'Jehněčí maso dává intenzivní, lehce divokou chuť. Feta, rajčata a olivy musí být přidány jako poslední a jen jemně promíchány. Ouzo dává anýzové aroma — alternativa: Pernod nebo Pastis.'
)

const hovezi = recipe(
  'seed-hovezi-zeleny-pepr',
  'Hovězí řemeslný se zeleným pepřem',
  {
    category: 'salamy',
    description: 'Čistě hovězí salám s nakládaným zeleným pepřem a koňakem.',
    baseWeight: 1000,
    difficulty: 2,
    tags: ['hovězí', 'zelený pepř', 'koňak', 'řemeslný', 'fermentovaný'],
  },
  [
    i('Hovězí maso (zadní)', 750, 'g', 'maso'),
    i('Hřbetní sádlo', 250, 'g', 'maso'),
    i('Praganda', 25, 'g', 'solanky'),
    i('Nakládaný zelený pepř (odkapaný)', 25, 'g', 'koření'),
    i('Černý pepř mletý', 2, 'g', 'koření'),
    i('Sušený česnek', 1, 'g', 'koření'),
    i('Muškátový oříšek', 0.5, 'g', 'koření'),
    i('Dextróza', 1.5, 'g', 'přísady'),
    i('Koňak', 15, 'ml', 'přísady'),
    i('Startovací kultura', 0.25, 'g', 'přísady'),
  ],
  salamSteps('Nakládaný zelený pepř přidat celý nebo hrubě nadrceně — zachovat vizuální efekt.'),
  'Nakládaný zelený pepř (ve slaném nálevu) je měkčí a aromatičtější než sušený. Hovězí maso zraje pomaleji — počítat s 8–10 týdny. Koňak — alternativa: Armagnac nebo brandy.'
)

const kachniPistacii = recipe(
  'seed-kachni-pistacie',
  'Kachní s pistáciemi (Francouzský styl)',
  {
    category: 'salamy',
    description: 'Kachní salám ve francouzském stylu s pistáciemi, pomerančovou kůrou a Grand Marnier.',
    baseWeight: 1000,
    difficulty: 3,
    tags: ['kachna', 'pistácie', 'pomeranč', 'Grand Marnier', 'francouzský', 'fermentovaný'],
  },
  [
    i('Kachní maso (bez kůže)', 750, 'g', 'maso'),
    i('Hřbetní sádlo', 250, 'g', 'maso'),
    i('Praganda', 25, 'g', 'solanky'),
    i('Pistácie loupané (celé)', 40, 'g', 'přísady'),
    i('Pomerančová kůra sušená', 2, 'g', 'koření'),
    i('Černý pepř mletý', 2, 'g', 'koření'),
    i('Kardamom mletý', 0.5, 'g', 'koření'),
    i('Dextróza', 1.5, 'g', 'přísady'),
    i('Grand Marnier', 20, 'ml', 'přísady'),
    i('Startovací kultura', 0.25, 'g', 'přísady'),
  ],
  salamSteps('Pistácie přidat celé jako poslední — tvoří výrazné zelené body v řezu.'),
  'Pistácie blanšírovat 30 s ve vřelé vodě pro intenzivnější zelenou barvu v řezu. Grand Marnier lze nahradit Cointreau nebo čistým pomerančovým likérem. Zrání 6–8 týdnů.'
)

const kanciLanyz = recipe(
  'seed-kanci-lanyz',
  'Kančí s lanýžem (Toskánský)',
  {
    category: 'salamy',
    description: 'Toskánský salám z divočáka s lanýžovou pastou, vlašskými ořechy a Chianti.',
    baseWeight: 1000,
    difficulty: 3,
    tags: ['divočák', 'lanýž', 'toskánský', 'chianti', 'ořechy', 'fermentovaný'],
  },
  [
    i('Maso z divočáka', 700, 'g', 'maso'),
    i('Hřbetní sádlo', 300, 'g', 'maso'),
    i('Praganda', 24, 'g', 'solanky'),
    i('Černá lanýžová pasta', 15, 'g', 'přísady'),
    i('Vlašské ořechy (hrubě sekané)', 30, 'g', 'přísady'),
    i('Černý pepř drcený', 3, 'g', 'koření'),
    i('Hřebíček mletý', 0.5, 'g', 'koření'),
    i('Dextróza', 1, 'g', 'přísady'),
    i('Chianti', 15, 'ml', 'přísady'),
    i('Startovací kultura', 0.25, 'g', 'přísady'),
  ],
  salamSteps('Lanýžovou pastu rozmíchat s vínem před přidáním. Ořechy přidat nakonec celé.'),
  'Lanýžová pasta (ne olej) dává robustnější chuť a aroma. Divočák — mrazit min. 30 dní. Hřebíček velmi opatrně — dominuje ostatním. Chianti lze nahradit jiným toskánským červeným vínem.'
)

const droeWors = recipe(
  'seed-droewors',
  'Jihoafrický Droëwors',
  {
    category: 'salamy',
    description: 'Jihoafrická sušená klobása — bez fermentace, rychlé sušení, výrazný koriandr a muškát.',
    baseWeight: 1000,
    difficulty: 1,
    tags: ['jihoafrický', 'droëwors', 'hovězí', 'koriandr', 'bez fermentace', 'rychlý'],
  },
  [
    i('Hovězí maso (zadní)', 800, 'g', 'maso'),
    i('Hovězí lůj nebo sádlo', 200, 'g', 'maso'),
    i('Kuchyňská sůl', 22, 'g', 'solanky'),
    i('Koriandr celý (pražený, mletý)', 10, 'g', 'koření'),
    i('Černý pepř mletý', 2, 'g', 'koření'),
    i('Muškátový oříšek', 1, 'g', 'koření'),
    i('Hřebíček mletý', 0.5, 'g', 'koření'),
    i('Sladový ocet', 30, 'ml', 'přísady'),
  ],
  [
    s(0, 'Maso umlít na 6mm desce, sádlo/lůj na 4mm desce. Přichladit.', { title: 'Mletí' }),
    s(1, 'Smíchat maso s kuchyňskou solí, kořením a octem. Žádná startovací kultura se nepoužívá.', { title: 'Míchání' }),
    s(2, 'Plnit do tenkých skopových střívek (24–26 mm). Stočit do spirály nebo ponechat v přímých délkách 40–50 cm.', { title: 'Plnění' }),
    s(3, 'Sušit na teple a suchu (ideálně na přímém slunci) nebo v sušičce 30–35 °C. Sušit 24–48 hodin do tvrdé, lomivé konzistence.', { title: 'Sušení', duration: 1440, temperature: 32 }),
  ],
  'Droëwors se NE fermentuje — žádná Praganda, žádná startovací kultura. Kuchyňská sůl + sladový ocet jsou konzervační základ. Koriandr orestovat nasucho a až poté umlet — klíčový krok. Hotový Droëwors musí být tvrdý a při ohnutí se lámat.'
)

const cernyDiamant = recipe(
  'seed-cerny-diamant',
  'Černý diamant',
  {
    category: 'salamy',
    description: 'Salám s pastou z černého česneku, vanilkovými semínky a bourbonem.',
    baseWeight: 1000,
    difficulty: 3,
    tags: ['černý česnek', 'vanilka', 'bourbon', 'fermentovaný', 'prémiový'],
  },
  [
    i('Vepřové maso (plec)', 750, 'g', 'maso'),
    i('Hřbetní sádlo', 250, 'g', 'maso'),
    i('Praganda', 25, 'g', 'solanky'),
    i('Pasta z černého česneku', 40, 'g', 'přísady'),
    i('Vanilková semínka (1 lusk)', 0.5, 'g', 'přísady'),
    i('Černý pepř Tellicherry', 2, 'g', 'koření'),
    i('Dextróza', 1, 'g', 'přísady'),
    i('Bourbon', 20, 'ml', 'přísady'),
    i('Startovací kultura', 0.25, 'g', 'přísady'),
  ],
  salamSteps('Černý česnek rozmíchat v bourbonu. Vanilkový lusk podélně rozříznout, vyškrábnout semínka — přidat jen semínka.'),
  'Černý česnek (fermentovaný česnek) má sladkou, melasovou chuť bez ostrosti. Vanilka s česnekem tvoří překvapivě harmonickou kombinaci. Tellicherry pepř je prémiový pepř z Indie — intenzivnější a aromatičtější než standardní.'
)

const lesniAlchymie = recipe(
  'seed-lesni-alchymie',
  'Lesní alchymie',
  {
    category: 'salamy',
    description: 'Mix hovězího a vepřového s práškem sušených hřibů, růžovým pepřem a ginem.',
    baseWeight: 1000,
    difficulty: 2,
    tags: ['hřiby', 'růžový pepř', 'gin', 'smíšený', 'fermentovaný'],
  },
  [
    i('Hovězí maso (mix s vepřovým)', 700, 'g', 'maso'),
    i('Hřbetní sádlo', 300, 'g', 'maso'),
    i('Praganda', 25, 'g', 'solanky'),
    i('Sušené hřiby (prach)', 15, 'g', 'přísady'),
    i('Růžový pepř (celý)', 5, 'g', 'koření'),
    i('Bílý pepř mletý', 1, 'g', 'koření'),
    i('Dextróza', 1, 'g', 'přísady'),
    i('Gin (London Dry)', 20, 'ml', 'přísady'),
    i('Startovací kultura', 0.25, 'g', 'přísady'),
  ],
  salamSteps('Růžový pepř přidat celý nebo hrubě nadrceně — zachovává vizuální efekt v řezu.'),
  'Gin přidává bylinné/jalovkové tóny a dobře se pojí s hřibovým aroma. Růžový pepř není příbuzný černému — má jiný chuťový profil (citrusový, lehce pálivý). Hovězí a vepřové 50:50 dává skvělou rovnováhu.'
)

const raseninouvyKour = recipe(
  'seed-raselinovy-kour',
  'Rašelinový kouř a Kakaové boby',
  {
    category: 'salamy',
    description: 'Odvážný salám s Islay whisky, drceným kakaovým bobem a tmavým pepřem.',
    baseWeight: 1000,
    difficulty: 3,
    tags: ['whisky', 'islay', 'kakao', 'kakaové boby', 'kouřový', 'fermentovaný'],
  },
  [
    i('Hovězí maso (zadní)', 500, 'g', 'maso'),
    i('Vepřové maso', 250, 'g', 'maso'),
    i('Hřbetní sádlo', 250, 'g', 'maso'),
    i('Praganda', 25, 'g', 'solanky'),
    i('Kakaové boby drcené', 30, 'g', 'přísady'),
    i('Černý pepř mletý', 3, 'g', 'koření'),
    i('Dextróza', 1, 'g', 'přísady'),
    i('Islay whisky (Laphroaig/Ardbeg)', 25, 'ml', 'přísady'),
    i('Startovací kultura', 0.25, 'g', 'přísady'),
  ],
  salamSteps('Kakaové boby přidat hrubě drcené nakonec pro vizuální efekt v řezu.'),
  'Islay whisky je charakteristická silným rašelinový/kouřovým aroma — Laphroaig nebo Ardbeg jsou nejlepší volba. Kakaové boby (cacao nibs) kupovat surové nebo lehce pražené — přidávají křupavou texturu a hořkosladkou chuť. Odvážná kombinace pro zkušené.'
)

// ── Klobásy ───────────────────────────────────────────────────────────────────

const lesniKlobasa = recipe(
  'seed-lesni-klobasa',
  'Lesní klobása (Radek Adámek)',
  {
    category: 'klobasy',
    description: 'Prémiová lovecká klobása z hovězího, divočáka a jelena s hřiby a jalkovcem.',
    baseWeight: 5000,
    difficulty: 3,
    smokingTemp: 70,
    smokingDuration: 180,
    tags: ['lovecká', 'zvěřina', 'divočák', 'jelen', 'iberico', 'hřiby', 'jalovec'],
  },
  [
    i('Hovězí ořech z kýty', 2857, 'g', 'maso'),
    i('Divočák', 914, 'g', 'maso'),
    i('Jelen', 229, 'g', 'maso'),
    i('Iberico sádlo', 1000, 'g', 'maso'),
    i('Praganda', 120, 'g', 'solanky'),
    i('Sušené hřiby (mleté)', 70, 'g', 'přísady'),
    i('Bílý pepř mletý', 20, 'g', 'koření'),
    i('Jalovec mletý', 15, 'g', 'koření'),
    i('Sušený česnek', 10, 'g', 'koření'),
    i('Cukr', 10, 'g', 'přísady'),
    i('Zázvor mletý', 8, 'g', 'koření'),
    i('Tymián sušený', 3.75, 'g', 'koření'),
    i('Skořice mletá', 2, 'g', 'koření'),
    i('Ledová voda', 350, 'ml', 'přísady'),
  ],
  [
    s(0, 'Všechna masa a sádlo nakrájet na kostky, přichladit na −2 °C. Iberico sádlo umlít zvlášť na 6mm desce.', { title: 'Příprava', duration: 120 }),
    s(1, 'Maso umlít na 6–8mm desce. Sádlo umlít zvlášť na 4–6mm desce. Vše přemístit zpět do mrazáku na 20 minut.', { title: 'Mletí' }),
    s(2, 'Smíchat všechna masa s Pragandou, kořením a ledovou vodou. Míchat 3–5 minut do lepivosti. Teplota směsi nesmí překročit 12 °C.', { title: 'Míchání', duration: 5 }),
    s(3, 'Plnit do vepřových střívek 30–32 mm. Klobásy stočit nebo spnout. Nechat 1 hodinu oschnout při pokojové teplotě.', { title: 'Plnění a sušení', duration: 60 }),
    s(4, 'Udit studeným nebo teplým kouřem (dřevo: buk, dub, jablko) při 55–70 °C min. 3 hodiny.', { title: 'Uzení', duration: 180, temperature: 65 }),
    s(5, 'Dovézt do vnitřní teploty 70–72 °C (var nebo horký kouř). Šokově ochladit v ledové vodě, osušit.', { title: 'Dotažení', temperature: 70 }),
  ],
  'Recept Radka Adámka — prémiová varianta lovecké klobásy. Iberico sádlo dává výjimečnou chuť — nesnažit se nahrazovat. Teplota díla při míchání je kritická — udržet pod 12 °C za každou cenu.'
)

const thajskaSaiOua = recipe(
  'seed-thajska-sai-oua',
  'Thajská Sai Oua',
  {
    category: 'klobasy',
    description: 'Autentická severothajská klobása s citronovou trávou, galangalem a kafrovou limetkou.',
    baseWeight: 1000,
    difficulty: 2,
    smokingTemp: 70,
    smokingDuration: 60,
    tags: ['thajský', 'sai oua', 'citronová tráva', 'galangal', 'kafrová limetka', 'asijský'],
  },
  [
    i('Vepřový bůček', 600, 'g', 'maso'),
    i('Vepřová plec', 300, 'g', 'maso'),
    i('Praganda', 16, 'g', 'solanky'),
    i('Rybí omáčka', 15, 'ml', 'přísady'),
    i('Citronová tráva (jen bílá část, jemně mletá)', 25, 'g', 'koření'),
    i('Galangal (nastrouhaný nebo mletý)', 15, 'g', 'koření'),
    i('Čerstvý česnek', 15, 'g', 'koření'),
    i('Šalotka', 10, 'g', 'koření'),
    i('Koriandr čerstvý (stonek + listy)', 10, 'g', 'koření'),
    i('Kafrové limetkové listy (bez řapíku, mleté)', 4, 'g', 'koření'),
    i('Thajské chilli', 5, 'g', 'koření'),
    i('Ledová voda', 30, 'ml', 'přísady'),
  ],
  [
    s(0, 'Citronovou trávu, galangal, česnek, šalotku, koriandr a limetkové listy zpracovat v mixéru na jemnou pastu.', { title: 'Aromatická pasta' }),
    s(1, 'Maso umlít na 6mm desce. Smíchat s aromatickou pastou, Pragandou, rybí omáčkou a ledovou vodou. Důkladně promíchat.', { title: 'Míchání', duration: 10 }),
    s(2, 'Plnit do vepřových střívek 26–28 mm. Stočit do šneku nebo ponechat v přímých délkách. Sušit 30 min.', { title: 'Plnění', duration: 30 }),
    s(3, 'Grilovat na přímém ohni nebo smažit na pánvi dozlatova. Alternativně udit při 70 °C do vnitřní teploty 70 °C.', { title: 'Grilování/uzení', duration: 30, temperature: 70 }),
  ],
  'Sai Oua je typická pro Chiang Mai region. Aromatická pasta je klíčová — mletí v mixéru je důležité. Rybí omáčka nahrazuje část soli — snížit Pragandu při zvýšení rybí omáčky. Nejlepší na grilu přes dřevěné uhlí.'
)

const pivniStout = recipe(
  'seed-pivni-stout',
  'Pivní Stout & Jalapeño Cheddar',
  {
    category: 'klobasy',
    description: 'Sytá klobása s Cheddar sýrem, jalapeño a stout pivní redukcí.',
    baseWeight: 1000,
    difficulty: 2,
    smokingTemp: 75,
    smokingDuration: 90,
    tags: ['cheddar', 'jalapeño', 'stout', 'pivní', 'sýrová', 'americký styl'],
  },
  [
    i('Vepřová plec', 500, 'g', 'maso'),
    i('Vepřový bůček', 300, 'g', 'maso'),
    i('Cheddar (kostky 1 cm, zmrazený)', 200, 'g', 'přísady'),
    i('Praganda', 18, 'g', 'solanky'),
    i('Jalapeño (bez semínek, jemně mleté)', 20, 'g', 'koření'),
    i('Černý pepř mletý', 3, 'g', 'koření'),
    i('Sušený česnek', 1.5, 'g', 'koření'),
    i('Hořčičné semínko mleté', 1.5, 'g', 'koření'),
    i('Stout redukce', 40, 'ml', 'přísady'),
    i('Ledová voda', 40, 'ml', 'přísady'),
  ],
  [
    s(0, 'Stout redukci připravit předem: 200 ml stoutu zredukovat na 40 ml (cca 15 min vaření). Zcela vychladit.', { title: 'Stout redukce', duration: 15 }),
    s(1, 'Maso umlít na 8mm desce. Cheddar zmrazit a nakrájet na kostky 1 cm — přidat zmrazený.', { title: 'Příprava' }),
    s(2, 'Smíchat maso s kořením, Pragandou, stout redukcí a ledovou vodou. Přidat zmrazené kostky Cheddaru a jalapeño. Jen jemně promíchat.', { title: 'Míchání' }),
    s(3, 'Plnit do vepřových střívek 32–35 mm. Spnout nebo stočit. Sušit 1 hodinu v chladu.', { title: 'Plnění', duration: 60 }),
    s(4, 'Udit studeným kouřem (třešeň/jablko) při 75–80 °C do vnitřní teploty 70 °C.', { title: 'Uzení', duration: 90, temperature: 75 }),
  ],
  'Cheddar přidávat vždy zmrazený a nakrájený — roztavený sýr ztrácí strukturu. Při uzení sýr trochu vytéká — normální. Stout redukce: Guinness nebo jiný suchý stout. Alternativně Porter.'
)

const toskanskaFinocchiona = recipe(
  'seed-toskanska-finocchiona',
  'Toskánská Finocchiona',
  {
    category: 'klobasy',
    description: 'Toskánský salám/klobása s fenyklovými semínky a bílým vínem. Lehká fermentovaná varianta.',
    baseWeight: 1000,
    difficulty: 2,
    tags: ['toskánský', 'fenykl', 'italský', 'fermentovaný', 'finocchiona'],
  },
  [
    i('Libové vepřové (plec)', 500, 'g', 'maso'),
    i('Vepřový bůček', 250, 'g', 'maso'),
    i('Hřbetní sádlo', 250, 'g', 'maso'),
    i('Praganda', 22, 'g', 'solanky'),
    i('Fenyklová semínka', 6, 'g', 'koření'),
    i('Černý pepř mletý', 3, 'g', 'koření'),
    i('Čerstvý česnek (mletý)', 2, 'g', 'koření'),
    i('Cukr', 1, 'g', 'přísady'),
    i('Bílé víno (Vernaccia/Vermentino)', 25, 'ml', 'přísady'),
    i('Ledová voda', 30, 'ml', 'přísady'),
  ],
  [
    s(0, 'Fenyklová semínka lehce nadrhnout v hmoždíři — uvolnit esenciální oleje, ale zachovat strukturu.', { title: 'Příprava koření' }),
    s(1, 'Maso umlít na 6mm desce. Smíchat s kořením, vínem a ledovou vodou. Míchat do lepivosti.', { title: 'Míchání', duration: 10 }),
    s(2, 'Plnit do vepřových střívek 35–40 mm nebo do hovězího. Spnout. Sušit 30 min.', { title: 'Plnění', duration: 30 }),
    s(3, 'Fermentovat při 20–22 °C, 85–90 % r. v. na 12–24 hodin.', { title: 'Fermentace', duration: 720, temperature: 21 }),
    s(4, 'Zrát v chladném prostoru (13 °C, 78 % r. v.) 3–4 týdny.', { title: 'Zrání', temperature: 13 }),
  ],
  'Finocchiona je historický toskánský salám — v minulosti se fenykl používal jako levnější alternativa pepře. Kratší zrání než velké salámy — 3–4 týdny stačí. Fantastická s červeným vínem Chianti.'
)

// ── Sušené výrobky ────────────────────────────────────────────────────────────

const italskaCoppa = recipe(
  'seed-italska-coppa',
  'Italská Coppa Piacentina',
  {
    category: 'susene',
    description: 'Celá vepřová krkovice sušená podle receptury z Piacenza. Hedvábná textura, kořeněná chuť.',
    baseWeight: 1000,
    difficulty: 2,
    tags: ['coppa', 'italský', 'piacenza', 'krkovice', 'celý kus', 'sušené'],
  },
  [
    i('Vepřová krkovice (celá, max. 2 kg)', 1000, 'g', 'maso'),
    i('Praganda', 30, 'g', 'solanky'),
    i('Černý pepř mletý', 5, 'g', 'koření'),
    i('Černý pepř drcený (hrubý)', 2, 'g', 'koření'),
    i('Nové koření mleté', 1, 'g', 'koření'),
    i('Muškátový oříšek', 0.5, 'g', 'koření'),
    i('Hřebíček mletý', 0.5, 'g', 'koření'),
    i('Dextróza', 1.5, 'g', 'přísady'),
    i('Bílé víno Pinot Grigio', 30, 'ml', 'přísady'),
    i('Hovězí slepé střevo', 1, 'ks', 'střívka'),
    i('Elastická síťka', 1, 'ks', 'střívka'),
  ],
  suseneMasoCure(14, 'Maso vetřít kořením smíchaným s vínem a dextrozou.'),
  'Coppa se plní do hovězího slepého střeva (caecum/šlechtěná Coppa forma) nebo do kolagenního střeva 80–90 mm. Elastická síťka dodává tradičně cylindrický tvar. Hmotnostní úbytek min. 35 % (cca 6–8 týdnů). Krájet velmi tenké plátky — 1–2 mm.'
)

const bresaola = recipe(
  'seed-bresaola',
  'Bresaola della Valtellina',
  {
    category: 'susene',
    description: 'Klasická sušená hovězí svíčková z Valtellinského údolí. Rubínová, jemná, elegantní.',
    baseWeight: 1000,
    difficulty: 2,
    tags: ['bresaola', 'italský', 'hovězí', 'celý kus', 'valtellina', 'sušené'],
  },
  [
    i('Hovězí falešná svíčková (sval)', 1000, 'g', 'maso'),
    i('Praganda', 30, 'g', 'solanky'),
    i('Jalovec celý (nadrhlý)', 4, 'g', 'koření'),
    i('Černý pepř mletý', 2, 'g', 'koření'),
    i('Rozmarýn sušený', 1, 'g', 'koření'),
    i('Tymián sušený', 1, 'g', 'koření'),
    i('Sušený česnek', 1, 'g', 'koření'),
    i('Cukr', 1.5, 'g', 'přísady'),
    i('Červené víno Nebbiolo/Chianti', 30, 'ml', 'přísady'),
    i('Kolagenní fólie', 1, 'ks', 'střívka'),
    i('Elastická síťka', 1, 'ks', 'střívka'),
  ],
  suseneMasoCure(21, 'Maso ponořit do vakuového sáčku s kořením a vínem. Otáčet každý den.'),
  'Hovězí sval (falešná svíčková / top round) musí být bez šlach a fascie. Nasolování trvá min. 21 dní. Kolagenní fólie dává hladký povrch a cylindrický tvar. Úbytek hmotnosti 35–40 %. Podávat s rukolou, parmazánem a citronovou šťávou.'
)

const lomo = recipe(
  'seed-lomo',
  'Lomo Embuchado',
  {
    category: 'susene',
    description: 'Španělská sušená vepřová pečeně s pálivou a sladkou paprikou Pimentón de la Vera.',
    baseWeight: 1000,
    difficulty: 2,
    tags: ['lomo', 'španělský', 'pimentón', 'paprika', 'vepřová pečeně', 'sušené'],
  },
  [
    i('Vepřová pečeně (celá)', 1000, 'g', 'maso'),
    i('Praganda', 28, 'g', 'solanky'),
    i('Pimentón de la Vera sladká', 15, 'g', 'koření'),
    i('Pimentón de la Vera pálivá', 2, 'g', 'koření'),
    i('Sušený česnek', 3, 'g', 'koření'),
    i('Oregáno', 1, 'g', 'koření'),
    i('Cukr', 1, 'g', 'přísady'),
    i('Olivový olej extra panenský', 15, 'ml', 'přísady'),
    i('Kolagenní střevo 65–75 mm', 1, 'ks', 'střívka'),
  ],
  [
    s(0, 'Vepřovou pečeni očistit od přebytečného tuku a šlach. Smíchat Pragandu s oběma druhy pimentónu, česnekem, oregánem a olivovým olejem na pastu.', { title: 'Příprava pasty' }),
    s(1, 'Pastu důkladně vetřít do celého povrchu masa. Vakuovat. Uložit do lednice na 10 dní, každý druhý den obrátit.', { title: 'Nasolování', duration: 14400, temperature: 4 }),
    s(2, 'Maso vyjmout, setřít přebytečné koření. Navléknout do kolagenního střeva nebo pevně zarolovat a svázat.', { title: 'Tvarování' }),
    s(3, 'Zavěsit v zracím prostoru 13–15 °C, 75–80 % r. v. Sušit 4–6 týdnů do 30–35% hmotnostního úbytku.', { title: 'Sušení', temperature: 14 }),
  ],
  'Pimentón de la Vera (uzená paprika ze Španělska) je nenahraditelný — dává typicky kouřové aroma i bez uzení. Olivový olej pomáhá pastě přilnout a zabraňuje popraskání povrchu. Krájet na tenké plátky 2–3 mm.'
)

const smokeyRuby = recipe(
  'seed-smoky-ruby',
  'Hovězí Smoky Ruby',
  {
    category: 'susene',
    description: 'Sušený hovězí váleček s čajem Lapsang Souchong, třešňovou redukcí a Tellicherry pepřem.',
    baseWeight: 1000,
    difficulty: 2,
    tags: ['hovězí', 'smoky', 'lapsang souchong', 'třešeň', 'kouřový', 'sušené'],
  },
  [
    i('Hovězí váleček', 1000, 'g', 'maso'),
    i('Praganda', 30, 'g', 'solanky'),
    i('Čaj Lapsang Souchong (prach)', 15, 'g', 'přísady'),
    i('Černý pepř Tellicherry mletý', 2, 'g', 'koření'),
    i('Tymián sušený', 1, 'g', 'koření'),
    i('Dextróza', 1.5, 'g', 'přísady'),
    i('Třešňová redukce', 40, 'ml', 'přísady'),
    i('Kolagenní fólie', 1, 'ks', 'střívka'),
  ],
  [
    s(0, 'Třešňovou redukci připravit předem: 200 ml třešňové šťávy zredukovat na 40 ml. Zcela vychladit.', { title: 'Třešňová redukce', duration: 20 }),
    s(1, 'Smíchat Pragandu, čaj, pepř, tymián, dextrózu a třešňovou redukci na pastu. Vetřít do celého povrchu.', { title: 'Nasolování' }),
    s(2, 'Vakuovat a uložit do lednice na 14 dní. Každý druhý den obrátit.', { title: 'Zrání v soli', duration: 20160, temperature: 4 }),
    s(3, 'Opláchnout, osušit, zabalit do kolagenní fólie, svázat. Zavěsit v zracím prostoru (13–15 °C, 78 % r. v.) na 4–6 týdnů.', { title: 'Sušení', temperature: 14 }),
  ],
  'Lapsang Souchong (Čína) je čaj uzený přes borový oheň — dává silné kouřové aroma bez skutečného uzení. Mlít v mlýnku na kávu nebo koupit jako prach. Třešňová redukce přidává kyselost a červené pigmenty. Váleček (eye of round) je štíhlý sval — kratší sušení než silnější kusy.'
)

export function getSeedRecipes(): Recipe[] {
  return [
    // Salámy — 5 000 g base
    modraKrev,
    kanciFK,
    lanyzovyPan,
    cernaPerlaSalam,
    kachniNoblesa,
    hribkovyLovec,
    visualShock,
    silkRoad,
    barista,
    kavoveZrno,
    asijskyDrak,
    lesniDuch,
    // Salámy — 1 000 g base
    moleFuet,
    nordickeZlato,
    tokijskyDrifting,
    stredomorskiEthos,
    hovezi,
    kachniPistacii,
    kanciLanyz,
    droeWors,
    cernyDiamant,
    lesniAlchymie,
    raseninouvyKour,
    // Klobásy
    lesniKlobasa,
    thajskaSaiOua,
    pivniStout,
    toskanskaFinocchiona,
    // Sušené výrobky
    italskaCoppa,
    bresaola,
    lomo,
    smokeyRuby,
  ]
}
