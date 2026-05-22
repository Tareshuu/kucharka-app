// Testovací skript — spustit: npx tsx test-parser.ts
import { parseIngredientText } from './src/modules/ingredientParser'

const RECIPES: Record<string, string> = {
  'Italský hovězí salám (ručně psaný)': `
700g hovězí přední
300g vepř. bůček
2g pepř celý
2g pepř mletý
22g sůl
30ml víno červené suché
1ks hřebíček celý
0.15g muškát ořech
`,

  'Salám Al Formaggio (ručně psaný)': `
700g vepřové zadní maso
300g vepřový bok
400g eidam čedar
4g paprika růžová dehydrovaná
1kg hrubý cukr
1.5dl víno portské červené
26g sůl Praganda
2ks stroužků česnek tornádo
`,

  'Lardo Siciliano (ručně psaný)': `
200g sůl mořská hrubá
150g sůl mořská jemná
500ml voda
5g skořice mletá
3g česnek sušený
40g pepř drcený
14g fenykl celý
2g pepř mletý bílý
2.5g rozmarýn mletý
10ks bobkový list
2ks stroužku česneku
`,

  'Peprový rustikal (zápisník)': `
330g V.krk
330g Plec
330g sádlo
24g Prajanda
2g Dextroza
3g Drc. kmín
3g česnek
0.13g muškat. květ
10g suš. mlíko
0.2g starter
`,

  'Uzený bůček na německý způsob (YouTube)': `
- 17 g soli
- 17 g pragandy
- 5 g cukru
- 3 g mletého pepře
- 3 g sladké papriky
- 3 g drceného kmínu
- 2 g granulovaného česneku
- 2 g granulované cibule
- 4 bobkové listy
- 10 kuliček jalovce
`,

  'Zvěřinové klobásy (YouTube)': `
4 kg vepřového boku bez kůže
4 kg zvěřiny
160 g pragandy
800 ml vody
9 g ml. koriandru
9 g ml. jalovce
16 g ml. pepře
16 g česneku
`,

  'Klobásy z divočáka (YouTube)': `
7 400 g masa z divočáka
5 600 g vepřového boku
255 g pragandy
55 g papriky sladké
88 g česneku
15 g kmín drcený
10 g muškátový květ
400 ml vody
`,

  'Čabajky (Facebook)': `
1kg masa
20g soli
23 g sladké maďarské papriky
7 g pálivá papriky
9 g česneku
5 g celého kmínu
`,

  'Vysočina (Praganda leták)': `
1kg Vepřová plec
1kg Bůček
40g Praganda
6g Pepř
4g Koriandr
12g Česnek
2g Cukr
`,

  'Rum Passion (tabulka)': `
Bílý pepř 3 g
Granulovaný česnek 1 g
Muškátový ořech 0.5 g
Sušené mléko 20 g
Dextroza 1 g
Hřebíček 0.3 g
Skořice 0.5 g
Tmavý rum 15 ml
Libové hovězí 800 g
Sádlo 200 g
Sůl 25 g
`,

  'Psí jazyky - % formát (Facebook)': `
Krkovička 50%
Kýta 50%
Řeznická sůl 23g
Cukr moučka 3g
Pepř Malabar 2g
Kmín mletý 2g
Sušený česnek 2.5g
`,

  'Maďarská směs (YouTube tabulka)': `
Sůl 220g
Koriandr ml. 20g
Majoránka 5g
Černý pepř ml. 30g
Muš.oříšek ml. 5g
Drcený kmín 30g
Bobkový list 5g
`,

  'Cikánský salám': `
750g hovězí
250g vepřové sádlo
24g praganda
3g cukru
5g mletý pepř
10g drcený pepř
3g maďarské pálivé papriky
1g sušený česnek
`,

  'Vysočina z krkovice (Facebook - % formát)': `
80% vepřová krkovice
20% vepřový bok
24g Praganda
2.2g jemně mletý pepř
`,
}

const CONF_ICON: Record<string, string> = {
  green: '✅',
  yellow: '⚠️ ',
  red:   '❌ ',
}

function confIcon(c: number) {
  if (c >= 0.8) return CONF_ICON.green
  if (c >= 0.5) return CONF_ICON.yellow
  return CONF_ICON.red
}

let totalLines = 0
let parsed = 0
let green = 0
let yellow = 0
let red = 0

for (const [title, text] of Object.entries(RECIPES)) {
  const results = parseIngredientText(text)
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`📋 ${title}`)
  console.log('─'.repeat(60))

  const lines = text.split('\n').filter(l => l.trim())
  totalLines += lines.length

  if (results.length === 0) {
    console.log('  (žádné suroviny nerozpoznány)')
    continue
  }

  parsed += results.length
  for (const r of results) {
    const icon = confIcon(r.confidence)
    const name = r.matched ? r.matched.name : r.rawName
    const conf = r.confidence > 0 ? ` [${(r.confidence * 100).toFixed(0)}%]` : ' [---]'
    const raw = r.matched && r.rawName.toLowerCase() !== r.matched.name.toLowerCase()
      ? ` ← "${r.rawName}"`
      : ''
    console.log(`  ${icon} ${r.amount} ${r.unit.padEnd(5)} ${name}${conf}${raw}`)
    if (r.confidence >= 0.8) green++
    else if (r.confidence >= 0.5) yellow++
    else red++
  }
}

console.log(`\n${'═'.repeat(60)}`)
console.log('📊 SOUHRN')
console.log('─'.repeat(60))
console.log(`  Řádků celkem:      ${totalLines}`)
console.log(`  Parsováno:         ${parsed}`)
console.log(`  ✅ Jistota ≥80%:   ${green}`)
console.log(`  ⚠️  Jistota 50–79%: ${yellow}`)
console.log(`  ❌ Jistota <50%:   ${red}`)
console.log(`  Neparsováno:       ${totalLines - parsed}`)
