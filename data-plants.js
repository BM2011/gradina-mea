/* Baza de date cu plante.
 * Toate momentele sunt exprimate în ZILE față de:
 *   LF = data medie a ultimului îngheț de primăvară (calculată din istoricul meteo al locației)
 *   FF = data medie a primului îngheț de toamnă
 * Astfel calendarul funcționează oriunde pe glob (inclusiv emisfera sudică),
 * iar pentru solar / seră / tunel datele se decalează automat.
 */
window.CATEGORIES = {
  leguma:   { name: 'Legume',             icon: '🥕' },
  aromatice:{ name: 'Aromatice',          icon: '🌿' },
  vita:     { name: 'Viță de vie',        icon: '🍇' },
  pom:      { name: 'Pomi fructiferi',    icon: '🍎' },
  arbust:   { name: 'Arbuști fructiferi', icon: '🫐' },
  flori:    { name: 'Flori',              icon: '🌷' }
};

window.PLACES = {
  camp:     { name: 'Grădină / câmp deschis', icon: '🌤️', shift: 0,  rain: true,  desc: 'Direct în pământ, fără acoperire.' },
  tunel:    { name: 'Tunel / folie joasă',    icon: '⛺', shift: 14, rain: false, desc: 'Arce joase acoperite cu folie sau agril.' },
  solar:    { name: 'Solar (neîncălzit)',     icon: '🏕️', shift: 28, rain: false, desc: 'Structură înaltă acoperită cu folie, fără încălzire.' },
  sera:     { name: 'Seră neîncălzită',       icon: '🏠', shift: 35, rain: false, desc: 'Sticlă sau policarbonat, fără încălzire.' },
  sera_inc: { name: 'Seră încălzită',         icon: '🔥', shift: 70, rain: false, desc: 'Seră cu încălzire (temperatura minimă controlată).' },
  ghiveci:  { name: 'Ghiveci / balcon / terasă', icon: '🪴', shift: 0, rain: true, pot: true, desc: 'Recipiente afară; pot fi mutate la adăpost.' },
  interior: { name: 'Interior / pervaz',      icon: '🪟', shift: 90, rain: false, pot: true, desc: 'În casă, la geam luminos.' }
};

/* Boli: simptome + remedii pe cele trei variante */
window.DISEASES = {
  mana: {
    name: 'Mana (Phytophthora / Plasmopara)',
    sympt: 'Pete uleioase, gălbui-brune pe frunze, puf alb-cenușiu pe dos după nopți umede; la roșii, fructe cu pete brune tari.',
    bio: 'Zeamă bordeleză sau hidroxid de cupru (produse admise în agricultura ecologică) la 0,5–1%, preventiv înainte de ploi; maxim 4 kg cupru metal/ha/an.',
    chim: 'Fungicid omologat pentru cultura respectivă, de ex. pe bază de cimoxanil, fosetil-Al sau azoxistrobin; alternați substanțele active ca să nu apară rezistență.',
    free: 'Decoct de coada-calului (200 g plantă proaspătă / 1 L apă, fiert 20 min, diluat 1:5), aerisire, udare doar la rădăcină, îndepărtarea frunzelor bolnave.'
  },
  alternarioza: {
    name: 'Alternarioza (pătarea brună)',
    sympt: 'Pete brune cu cercuri concentrice („țintă”) pe frunzele bătrâne, de jos în sus.',
    bio: 'Produse pe bază de cupru sau Bacillus subtilis / amyloliquefaciens.',
    chim: 'Fungicid omologat pe bază de difenoconazol sau azoxistrobin.',
    free: 'Îndepărtați frunzele de jos până la 30 cm, mulciți ca solul să nu stropească frunzele, rotația culturilor 3–4 ani.'
  },
  fainare: {
    name: 'Făinarea',
    sympt: 'Strat alb, ca de făină, pe frunze și lăstari; frunzele se răsucesc și se usucă.',
    bio: 'Sulf muiabil (0,3–0,5%, nu peste 28 °C) sau bicarbonat de potasiu (5 g/L).',
    chim: 'Fungicid omologat pe bază de penconazol, tebuconazol sau miclobutanil (după disponibilitatea în țara dvs.).',
    free: 'Lapte diluat 1 parte la 9 părți apă, pulverizat pe vreme însorită; sau 1 linguriță bicarbonat de sodiu + câteva picături săpun / 1 L apă.'
  },
  rapan: {
    name: 'Rapănul (mărul, părul)',
    sympt: 'Pete măslinii-catifelate pe frunze, fructe crăpate cu pete negre-cenușii.',
    bio: 'Cupru la dezmugurire, apoi sulf muiabil sau polisulfură de calciu după ploi.',
    chim: 'Fungicid omologat pe bază de dodină, captan sau difenoconazol, mai ales după ploi lungi în aprilie–mai.',
    free: 'Strângeți și compostați/îngropați frunzele căzute toamna (acolo iernează ciuperca), rărire pentru aerisire.'
  },
  monilioza: {
    name: 'Monilioza (putrezirea fructelor, uscarea ramurilor)',
    sympt: 'Flori și vârfuri de lăstari care se usucă brusc; fructe cu putregai brun și cercuri de pernițe cenușii.',
    bio: 'Cupru la umflarea mugurilor și la căderea petalelor; produse pe bază de Bacillus subtilis în înflorit.',
    chim: 'Fungicid omologat pe bază de fenhexamid, ciprodinil+fludioxonil sau tebuconazol (la înflorit, pe vreme ploioasă).',
    free: 'Tăiați ramurile uscate cu 10–15 cm în lemn sănătos, strângeți fructele mumifiate din pom și de pe jos.'
  },
  basicare: {
    name: 'Bășicarea frunzelor (piersic)',
    sympt: 'Frunze încrețite, umflate, roșiatice, care cad devreme.',
    bio: 'Zeamă bordeleză 2% toamna după căderea frunzelor și primăvara la umflarea mugurilor (OBLIGATORIU înainte de deschiderea mugurilor).',
    chim: 'Fungicid omologat pe bază de difenoconazol sau ziram (unde este permis), strict la umflarea mugurilor.',
    free: 'Nu există remediu gratuit eficient după apariție; îndepărtați frunzele afectate și fertilizați ușor ca pomul să refacă frunzișul.'
  },
  ciuruire: {
    name: 'Ciuruirea frunzelor (sâmburoase)',
    sympt: 'Pete mici roșiatice care se desprind și lasă frunza „ciuruită”.',
    bio: 'Cupru toamna la căderea frunzelor și primăvara la dezmugurire.',
    chim: 'Fungicid omologat pe bază de captan sau tebuconazol după înflorit.',
    free: 'Strângeți frunzele căzute, evitați udarea pe frunze.'
  },
  putregai: {
    name: 'Putregaiul cenușiu (Botrytis)',
    sympt: 'Puf cenușiu pe fructe, flori și boabe; apare pe vreme umedă și răcoroasă.',
    bio: 'Bacillus subtilis sau bicarbonat de potasiu; aerisire și desfrunzire în zona ciorchinilor/fructelor.',
    chim: 'Fungicid omologat pe bază de fenhexamid sau ciprodinil+fludioxonil; respectați pauza până la recoltare.',
    free: 'Îndepărtați imediat fructele atacate, mulci de paie sub căpșuni, nu udați seara.'
  },
  patarea_neagra: {
    name: 'Pătarea neagră (trandafir)',
    sympt: 'Pete negre cu margini zdrențuite, frunzele se îngălbenesc și cad.',
    bio: 'Cupru sau sulf, la 10–14 zile pe vreme umedă.',
    chim: 'Fungicid omologat pe bază de difenoconazol sau tebuconazol.',
    free: 'Decoct de coada-calului, strângerea frunzelor căzute, udare doar la bază dimineața.'
  },
  rugina: {
    name: 'Rugina',
    sympt: 'Pustule portocalii-ruginii pe dosul frunzelor.',
    bio: 'Sulf muiabil sau cupru.',
    chim: 'Fungicid omologat pe bază de tebuconazol.',
    free: 'Îndepărtați frunzele afectate, distanțe mai mari între plante.'
  },
  antracnoza: {
    name: 'Antracnoza / Pătarea brună (nuc)',
    sympt: 'Pete brune-negricioase pe frunze și pe coaja verde a nucilor.',
    bio: 'Cupru la dezmugurire și după înflorit.',
    chim: 'Fungicid omologat pe bază de difenoconazol.',
    free: 'Strângeți și ardeți/îngropați frunzele căzute.'
  }
};

window.PESTS = {
  afide: {
    name: 'Afidele (păduchii verzi/negri)',
    sympt: 'Colonii pe vârfuri și dosul frunzelor, frunze răsucite și lipicioase, furnici multe.',
    bio: 'Săpun potasic insecticid 1–2% sau ulei de neem; încurajați buburuzele.',
    chim: 'Insecticid omologat pe bază de acetamiprid sau deltametrin (NU în timpul înfloririi – albinele!).',
    free: 'Jet de apă, macerat de urzică (24 h la rece, diluat 1:10) sau apă cu săpun de casă ras (20 g/L).'
  },
  gandacul_colorado: {
    name: 'Gândacul din Colorado',
    sympt: 'Gândaci dungați galben-negru și larve roșiatice care rod frunzele cartofului / vinetelor.',
    bio: 'Produse pe bază de Bacillus thuringiensis var. tenebrionis sau spinosad pe larvele tinere.',
    chim: 'Insecticid omologat pe bază de acetamiprid sau deltametrin.',
    free: 'Colectare manuală dimineața într-un vas cu apă și sare; căutați pontele portocalii pe dosul frunzelor și striviți-le.'
  },
  paianjen: {
    name: 'Păianjenul roșu',
    sympt: 'Frunze punctate gălbui, pânză fină pe dos, mai ales pe căldură și secetă (frecvent în solar).',
    bio: 'Sulf muiabil (sub 28 °C) sau acarieni prădători (Phytoseiulus).',
    chim: 'Acaricid omologat pe bază de abamectină sau spirodiclofen.',
    free: 'Creșteți umiditatea (pulverizare cu apă pe dosul frunzelor seara), îndepărtați frunzele foarte atacate.'
  },
  musculita: {
    name: 'Musculița albă',
    sympt: 'Nori de musculițe albe când scuturați planta (în solar/seră).',
    bio: 'Capcane galbene lipicioase, ulei de neem, Encarsia formosa în seră.',
    chim: 'Insecticid omologat pe bază de acetamiprid sau flonicamid.',
    free: 'Capcane galbene făcute din carton vopsit + vaselină/ulei; plantați crăițe și busuioc printre culturi.'
  },
  limacsi: {
    name: 'Limacșii și melcii',
    sympt: 'Găuri neregulate în frunze, urme lucioase de mucus, răsaduri tinere roase peste noapte.',
    bio: 'Granule pe bază de fosfat feric (admise în ecologic).',
    chim: 'Granule moluscocide omologate (respectați distanța față de animale de companie).',
    free: 'Capcane cu bere în pahare îngropate, scânduri ude sub care se adună și se colectează dimineața, cenușă/coji de ou în jurul plantelor.'
  },
  omizi: {
    name: 'Omizile (fluturele alb al verzei, buha)',
    sympt: 'Frunze roase până la nervuri, excremente verzi.',
    bio: 'Bacillus thuringiensis var. kurstaki, plasă anti-insecte.',
    chim: 'Insecticid omologat pe bază de deltametrin sau lambda-cihalotrin.',
    free: 'Colectare manuală, verificați dosul frunzelor pentru ouăle galbene; plantați mărar și cimbru alături.'
  },
  purici: {
    name: 'Puricii de pământ',
    sympt: 'Mii de găurele mici în frunzele de varză, ridichi, rucola, mai ales pe vreme caldă și uscată.',
    bio: 'Plasă/agril peste răsaduri, pământ de diatomee.',
    chim: 'Insecticid omologat pe bază de deltametrin.',
    free: 'Udare frecventă (le displace umezeala), cenușă presărată dimineața pe roua frunzelor.'
  },
  viermele_fructelor: {
    name: 'Viermele merelor / prunelor (Cydia)',
    sympt: 'Fructe cu gaură și rumeguș, cad prematur.',
    bio: 'Virusul granulozei (Carpovirusine), capcane cu feromoni pentru momentul optim.',
    chim: 'Insecticid omologat pe bază de deltametrin sau acetamiprid, la 10–14 zile după zborul maxim al fluturilor.',
    free: 'Brâie-capcană din carton ondulat legate pe trunchi din iunie (se verifică și se distrug larvele), strângerea fructelor căzute zilnic.'
  },
  musca_cireselor: {
    name: 'Musca cireșelor',
    sympt: 'Viermișori albi în cireșe coapte.',
    bio: 'Capcane galbene lipicioase atârnate în coroană când cireșele trec de la verde la galben.',
    chim: 'Insecticid omologat pe bază de acetamiprid, la schimbarea culorii fructelor (respectați pauza de siguranță).',
    free: 'Capcane galbene din plastic uns cu ulei, recoltare completă (nu lăsați fructe în pom), săpare superficială sub coroană toamna.'
  },
  tripsi: {
    name: 'Tripșii',
    sympt: 'Pete argintii pe frunze și petale, mai ales pe ceapă, castraveți și flori.',
    bio: 'Capcane albastre lipicioase, ulei de neem.',
    chim: 'Insecticid omologat pe bază de spinosad sau acetamiprid.',
    free: 'Capcane albastre din carton + ulei, udare prin aspersiune ușoară (le scade numărul).'
  },
  psila: {
    name: 'Psila părului',
    sympt: 'Frunze lipicioase și înnegrite (fumagină), larve mici pe lăstari.',
    bio: 'Ulei horticol de parafină la repaus, caolin (argilă albă) pe frunze.',
    chim: 'Insecticid omologat pe bază de abamectină sau spirotetramat.',
    free: 'Spălarea coroanei cu apă cu săpun de casă, încurajarea urechelnițelor (ghivece cu paie întoarse).'
  }
};

/* ======================= PLANTE ======================= */
window.PLANTS = [
  /* ---------- LEGUME (anuale, sezon cald) ---------- */
  { id: 'rosii', name: 'Roșii', cat: 'leguma', icon: '🍅', life: 'anuala', warm: true,
    indoor: -56, transplant: 21, germ: 12, mature: 70, span: 80, every: 4, feeder: 3,
    stake: true, sucker: true, top: true, dis: ['mana', 'alternarioza'], pest: ['afide', 'musculita', 'paianjen'],
    seed: { d: 25, how: 'fructe' }, spacing: '50 × 70 cm', water: 3,
    tips: { copilit: 'Lăsați 1–2 tulpini la soiurile nedeterminate; la soiurile pitice (determinate) copiliți doar până la prima inflorescență.',
            carnit: 'Ciupiți vârful deasupra a 2 frunze peste ultimul etaj de flori, cu circa 45 de zile înainte de primul îngheț, ca fructele să apuce să se coacă.' } },
  { id: 'ardei', name: 'Ardei (gras, kapia, iute)', cat: 'leguma', icon: '🫑', life: 'anuala', warm: true,
    indoor: -70, transplant: 28, germ: 16, mature: 75, span: 70, every: 7, feeder: 3,
    stake: true, dis: ['alternarioza'], pest: ['afide', 'paianjen', 'tripsi'], seed: { d: 30, how: 'fructe' }, spacing: '40 × 50 cm', water: 3,
    tips: { palisare: 'Ardeii se rup ușor sub greutatea fructelor: un țăruș de 60–80 cm și 2 legături moi sunt suficiente.' } },
  { id: 'vinete', name: 'Vinete', cat: 'leguma', icon: '🍆', life: 'anuala', warm: true,
    indoor: -70, transplant: 30, germ: 18, mature: 80, span: 60, every: 7, feeder: 3,
    stake: true, dis: ['alternarioza'], pest: ['gandacul_colorado', 'paianjen', 'afide'], seed: { d: 45, how: 'fructe' }, spacing: '50 × 70 cm', water: 3 },
  { id: 'castraveti', name: 'Castraveți', cat: 'leguma', icon: '🥒', life: 'anuala', warm: true,
    direct: 21, indoor: -25, transplant: 25, germ: 16, mature: 55, span: 55, every: 2, feeder: 3,
    stake: true, dis: ['mana', 'fainare'], pest: ['afide', 'paianjen', 'tripsi'], seed: { d: 35, how: 'castraveti' }, spacing: '30 × 100 cm (pe spalier)', water: 3,
    tips: { recoltare: 'Recoltați la 2 zile: castraveții lăsați să crească prea mari opresc formarea altora noi.' } },
  { id: 'dovlecei', name: 'Dovlecei', cat: 'leguma', icon: '🥬', life: 'anuala', warm: true,
    direct: 21, germ: 15, mature: 50, span: 70, every: 3, feeder: 3,
    dis: ['fainare'], pest: ['afide', 'limacsi'], seed: { d: 50, how: 'dovleci' }, spacing: '100 × 100 cm', water: 3 },
  { id: 'dovleac', name: 'Dovleac', cat: 'leguma', icon: '🎃', life: 'anuala', warm: true,
    direct: 21, germ: 15, mature: 100, span: 30, every: 10, feeder: 3,
    dis: ['fainare'], pest: ['afide'], seed: { d: 15, how: 'dovleci' }, spacing: '150 × 150 cm', water: 2 },
  { id: 'pepene', name: 'Pepene (verde / galben)', cat: 'leguma', icon: '🍉', life: 'anuala', warm: true,
    indoor: -28, transplant: 28, direct: 28, germ: 18, mature: 80, span: 30, every: 4, feeder: 2,
    dis: ['fainare', 'mana'], pest: ['afide'], seed: { d: 10, how: 'dovleci' }, spacing: '100 × 150 cm', water: 2 },
  { id: 'fasole', name: 'Fasole (pitică / urcătoare)', cat: 'leguma', icon: '🫘', life: 'anuala', warm: true,
    direct: 14, germ: 12, mature: 60, span: 35, every: 4, feeder: 1,
    stake: true, dis: ['rugina'], pest: ['afide'], seed: { d: 45, how: 'pastai' }, spacing: '10 × 50 cm', water: 2 },
  { id: 'porumb', name: 'Porumb dulce', cat: 'leguma', icon: '🌽', life: 'anuala', warm: true,
    direct: 14, germ: 12, mature: 80, span: 20, every: 4, feeder: 3,
    pest: ['afide'], seed: { d: 40, how: 'stiuleti' }, spacing: '30 × 70 cm (în blocuri, pentru polenizare)', water: 2 },

  /* ---------- LEGUME (sezon răcoros) ---------- */
  { id: 'cartofi', name: 'Cartofi', cat: 'leguma', icon: '🥔', life: 'anuala', warm: true,
    direct: -10, germ: 8, mature: 90, span: 25, every: 7, feeder: 2, hill: true,
    dis: ['mana', 'alternarioza'], pest: ['gandacul_colorado'], spacing: '30 × 70 cm', water: 2,
    tips: { semanat_direct: 'Plantați tuberculi încolțiți (pregerminați 3–4 săptămâni la lumină), la 8–10 cm adâncime, cu colții în sus.' } },
  { id: 'salata', name: 'Salată', cat: 'leguma', icon: '🥗', life: 'anuala',
    indoor: -42, transplant: -14, direct: -21, autumn: -60, germ: 4, mature: 50, span: 25, every: 4, feeder: 1,
    dis: ['putregai', 'mana'], pest: ['limacsi', 'afide'], seed: { d: 40, how: 'puf' }, spacing: '25 × 25 cm', water: 2 },
  { id: 'spanac', name: 'Spanac', cat: 'leguma', icon: '🌱', life: 'anuala',
    direct: -35, autumn: -45, germ: 4, mature: 45, span: 25, every: 5, feeder: 2,
    dis: ['mana'], pest: ['afide'], spacing: '5 × 25 cm', water: 2 },
  { id: 'ridichi', name: 'Ridichi', cat: 'leguma', icon: '🔴', life: 'anuala',
    direct: -35, autumn: -40, germ: 5, mature: 28, span: 12, every: 3, feeder: 1,
    pest: ['purici'], spacing: '3 × 15 cm', water: 2 },
  { id: 'morcovi', name: 'Morcovi', cat: 'leguma', icon: '🥕', life: 'anuala',
    direct: -21, germ: 7, mature: 85, span: 60, every: 10, feeder: 1, thin: true,
    pest: ['afide'], seed: { bien: true, how: 'Bienală: păstrați 3–4 rădăcini peste iarnă în nisip, replantați primăvara; semințele se coc în anul 2.' }, spacing: '3 × 25 cm', water: 2 },
  { id: 'sfecla', name: 'Sfeclă roșie', cat: 'leguma', icon: '🟣', life: 'anuala',
    direct: -7, germ: 7, mature: 65, span: 50, every: 10, feeder: 2, thin: true,
    spacing: '10 × 30 cm', water: 2, seed: { bien: true, how: 'Bienală: semințele apar în anul al doilea după replantarea rădăcinilor iernate.' } },
  { id: 'ceapa', name: 'Ceapă (din arpagic)', cat: 'leguma', icon: '🧅', life: 'anuala',
    direct: -35, germ: 5, mature: 100, span: 20, every: 7, feeder: 1,
    dis: ['mana'], pest: ['tripsi'], spacing: '10 × 25 cm', water: 1,
    seed: { bien: true, how: 'Pentru semințe plantați primăvara bulbi mari păstrați din anul trecut; umbelele se recoltează când capsulele se deschid.' } },
  { id: 'usturoi', name: 'Usturoi', cat: 'leguma', icon: '🧄', life: 'anuala', overwinter: true,
    autumn: -21, hStart: 85, span: 15, every: 7, feeder: 1,
    dis: ['rugina'], pest: ['tripsi'], spacing: '10 × 25 cm', water: 1,
    tips: { recoltare: 'Recoltați când 1/3 din frunze s-au îngălbenit; uscați 2–3 săptămâni la umbră, în curent.',
            plantare_bulbi: 'Plantați căței mari, cu vârful în sus, la 5 cm adâncime (vârful acoperit de 2–3 cm de pământ).' } },
  { id: 'mazare', name: 'Mazăre', cat: 'leguma', icon: '🟢', life: 'anuala',
    direct: -42, germ: 5, mature: 65, span: 21, every: 3, feeder: 1,
    stake: true, dis: ['fainare'], pest: ['afide'], seed: { d: 25, how: 'pastai' }, spacing: '5 × 40 cm', water: 2 },
  { id: 'varza', name: 'Varză', cat: 'leguma', icon: '🥬', life: 'anuala',
    indoor: -56, transplant: -14, germ: 7, mature: 90, span: 40, every: 10, feeder: 3,
    pest: ['omizi', 'purici', 'afide'], spacing: '50 × 60 cm', water: 3,
    seed: { bien: true, how: 'Bienală: necesită iernarea căpățânii; în practică se cumpără sămânță.' } },
  { id: 'broccoli', name: 'Broccoli / conopidă', cat: 'leguma', icon: '🥦', life: 'anuala',
    indoor: -56, transplant: -14, autumn: -100, germ: 7, mature: 70, span: 20, every: 4, feeder: 3,
    pest: ['omizi', 'purici', 'afide'], spacing: '50 × 60 cm', water: 3 },
  { id: 'praz', name: 'Praz', cat: 'leguma', icon: '🌱', life: 'anuala',
    indoor: -70, transplant: 14, germ: 7, mature: 120, span: 90, every: 14, feeder: 2, hill: true,
    pest: ['tripsi'], spacing: '15 × 40 cm', water: 2 },
  { id: 'capsuni', name: 'Căpșuni', cat: 'leguma', icon: '🍓', life: 'perena',
    hStart: 45, hEnd: 80, every: 3, feeder: 2, bloom: 20,
    dis: ['putregai', 'fainare'], pest: ['limacsi', 'afide'], spacing: '30 × 50 cm', water: 2,
    pruneAfterHarvest: true, cut: { anchor: 'lf', at: 100, kind: 'stoloni' }, plant: { anchor: 'ff', at: -45 }, coldHardy: -20,
    tips: { taiere_vara: 'După recoltare tăiați frunzele bătrâne la 5–8 cm, lăsând inima neatinsă, și eliminați stolonii nedoriți.' } },

  /* ---------- AROMATICE ---------- */
  { id: 'busuioc', name: 'Busuioc', cat: 'aromatice', icon: '🌿', life: 'anuala', warm: true,
    indoor: -42, transplant: 28, germ: 18, mature: 30, span: 90, every: 10, feeder: 1, pinchHerb: true,
    pest: ['afide', 'limacsi'], seed: { d: 70, how: 'puf' }, spacing: '25 × 25 cm', water: 2 },
  { id: 'patrunjel', name: 'Pătrunjel', cat: 'aromatice', icon: '🌱', life: 'anuala',
    direct: -42, germ: 5, mature: 75, span: 120, every: 14, feeder: 1,
    spacing: '5 × 25 cm', water: 2, seed: { bien: true, how: 'Bienală: înflorește și face semințe în al doilea an.' } },
  { id: 'marar', name: 'Mărar', cat: 'aromatice', icon: '🌾', life: 'anuala',
    direct: -21, germ: 6, mature: 40, span: 40, every: 7, feeder: 1,
    pest: ['afide'], seed: { d: 40, how: 'umbele' }, spacing: 'în rânduri la 25 cm', water: 1 },
  { id: 'menta', name: 'Mentă', cat: 'aromatice', icon: '🍃', life: 'perena',
    hStart: 30, hEnd: 160, every: 14, feeder: 1, cut: { anchor: 'lf', at: 30, kind: 'divizare' }, coldHardy: -25,
    dis: ['rugina'], spacing: 'în ghiveci îngropat (este invazivă)', water: 2 },
  { id: 'lavanda', name: 'Lavandă', cat: 'aromatice', icon: '💜', life: 'perena',
    bloom: 70, hStart: 75, hEnd: 95, every: 10, feeder: 1, pruneAfterHarvest: true, cut: { anchor: 'lf', at: 100, kind: 'semilemnoși' }, coldHardy: -18,
    spacing: '50 × 80 cm', water: 1,
    tips: { taiere_vara: 'Tăiați tijele florale și 1/3 din creșterea verde, NU în lemnul vechi și gol (nu mai lăstărește).' } },

  /* ---------- VIȚĂ DE VIE ---------- */
  { id: 'vita_masa', name: 'Viță de vie – struguri de masă', cat: 'vita', icon: '🍇', life: 'perena',
    bloom: 50, hStart: 115, hEnd: 165, every: 7, feeder: 2, winterPrune: -45, dormantSpray: true, vineOps: true,
    dis: ['mana', 'fainare', 'putregai'], pest: ['paianjen'], cut: { anchor: 'lf', at: -45, kind: 'lemnoși' }, coldHardy: -18,
    plant: { anchor: 'lf', at: -14 }, spacing: '1,2–1,5 m pe rând, 2 m între rânduri', water: 1 },
  { id: 'vita_vin', name: 'Viță de vie – struguri de vin', cat: 'vita', icon: '🍷', life: 'perena',
    bloom: 50, hStart: 145, hEnd: 185, every: 10, feeder: 1, winterPrune: -45, dormantSpray: true, vineOps: true,
    dis: ['mana', 'fainare', 'putregai'], pest: ['paianjen'], cut: { anchor: 'lf', at: -45, kind: 'lemnoși' }, coldHardy: -20,
    plant: { anchor: 'lf', at: -14 }, spacing: '1–1,2 m pe rând, 2–2,2 m între rânduri', water: 1 },
  { id: 'kiwi', name: 'Kiwi / Actinidia', cat: 'vita', icon: '🥝', life: 'perena',
    bloom: 45, hStart: 180, hEnd: 200, every: 10, feeder: 2, winterPrune: -40, coldHardy: -15,
    spacing: '3–4 m, pe pergolă; necesită plantă mascul', water: 3 },

  /* ---------- POMI ---------- */
  { id: 'mar', name: 'Măr', cat: 'pom', icon: '🍎', life: 'perena', varieties: true,
    bloom: 7, hStart: 140, hEnd: 180, every: 10, feeder: 2, winterPrune: -50, dormantSpray: true, thinFruit: true,
    dis: ['rapan', 'fainare', 'monilioza'], pest: ['viermele_fructelor', 'afide'], coldHardy: -30,
    plant: { anchor: 'ff', at: 14 }, spacing: '3–5 m (după portaltoi)', water: 2 },
  { id: 'par', name: 'Păr', cat: 'pom', icon: '🍐', life: 'perena', varieties: true,
    bloom: 0, hStart: 130, hEnd: 170, every: 10, feeder: 2, winterPrune: -50, dormantSpray: true, thinFruit: true,
    dis: ['rapan', 'monilioza'], pest: ['psila', 'viermele_fructelor'], coldHardy: -25,
    plant: { anchor: 'ff', at: 14 }, spacing: '4–5 m', water: 2 },
  { id: 'prun', name: 'Prun', cat: 'pom', icon: '🟣', life: 'perena', varieties: true,
    bloom: -3, hStart: 120, hEnd: 160, every: 7, feeder: 2, winterPrune: -40, dormantSpray: true,
    dis: ['monilioza', 'ciuruire'], pest: ['viermele_fructelor', 'afide'], coldHardy: -28,
    plant: { anchor: 'ff', at: 14 }, spacing: '4–5 m', water: 2 },
  { id: 'cires', name: 'Cireș', cat: 'pom', icon: '🍒', life: 'perena', varieties: true,
    bloom: -7, hStart: 50, hEnd: 75, every: 4, feeder: 2, summerPrune: true, dormantSpray: true,
    dis: ['monilioza', 'ciuruire'], pest: ['musca_cireselor', 'afide'], coldHardy: -25,
    plant: { anchor: 'ff', at: 14 }, spacing: '5–7 m', water: 2,
    tips: { taiere_vara: 'Cireșul se taie VARA, imediat după recoltare: rănile se închid repede și scade riscul de scurgeri de gumă.' } },
  { id: 'visin', name: 'Vișin', cat: 'pom', icon: '🍒', life: 'perena',
    bloom: 0, hStart: 65, hEnd: 85, every: 5, feeder: 2, summerPrune: true, dormantSpray: true,
    dis: ['monilioza', 'ciuruire'], pest: ['musca_cireselor', 'afide'], coldHardy: -28,
    plant: { anchor: 'ff', at: 14 }, spacing: '4 m', water: 2 },
  { id: 'cais', name: 'Cais', cat: 'pom', icon: '🟠', life: 'perena', varieties: true,
    bloom: -21, hStart: 80, hEnd: 100, every: 4, feeder: 2, summerPrune: true, dormantSpray: true, thinFruit: true,
    dis: ['monilioza', 'ciuruire'], pest: ['afide'], coldHardy: -25,
    plant: { anchor: 'lf', at: -21 }, spacing: '5 m', water: 1,
    tips: { protectie_inghet: 'Caisul înflorește foarte devreme: la -1…-2 °C florile deschise îngheață. Acoperiți pomii mici cu agril sau fum ușor/aspersiune în zori.' } },
  { id: 'piersic', name: 'Piersic / nectarin', cat: 'pom', icon: '🍑', life: 'perena', varieties: true,
    bloom: -10, hStart: 100, hEnd: 125, every: 4, feeder: 2, springPrune: -5, dormantSpray: true, thinFruit: true, autumnCopper: true,
    dis: ['basicare', 'monilioza', 'fainare'], pest: ['afide'], coldHardy: -20,
    plant: { anchor: 'lf', at: -21 }, spacing: '4–5 m', water: 2,
    tips: { taiere_iarna: 'Piersicul se taie cel mai bine la începutul înfloririi („butonul roz”), când se văd mugurii de rod; rodește doar pe ramurile de un an.' } },
  { id: 'nuc', name: 'Nuc', cat: 'pom', icon: '🌰', life: 'perena',
    bloom: 20, hStart: 150, hEnd: 175, every: 7, feeder: 1, summerPrune: true,
    dis: ['antracnoza'], pest: ['viermele_fructelor'], coldHardy: -25,
    plant: { anchor: 'ff', at: 14 }, spacing: '10–12 m', water: 1,
    tips: { taiere_vara: 'Nucul „plânge” dacă e tăiat primăvara; tăiați doar ramurile uscate sau încrucișate la sfârșitul verii.' } },
  { id: 'gutui', name: 'Gutui', cat: 'pom', icon: '🍋', life: 'perena',
    bloom: 25, hStart: 170, hEnd: 190, every: 10, feeder: 2, winterPrune: -40, dormantSpray: true,
    dis: ['monilioza', 'fainare'], pest: ['viermele_fructelor'], coldHardy: -25,
    plant: { anchor: 'ff', at: 14 }, spacing: '4 m', water: 2 },
  { id: 'smochin', name: 'Smochin', cat: 'pom', icon: '🟤', life: 'perena',
    bloom: 30, hStart: 120, hEnd: 170, every: 4, feeder: 1, winterPrune: -10, coldHardy: -10,
    cut: { anchor: 'lf', at: -20, kind: 'lemnoși' }, plant: { anchor: 'lf', at: 14 }, spacing: '3–4 m, la un zid însorit', water: 1 },
  { id: 'citrice', name: 'Citrice (lămâi, portocal)', cat: 'pom', icon: '🍋', life: 'perena', tender: true,
    bloom: 10, hStart: 210, hEnd: 300, every: 14, feeder: 3, winterPrune: 10, coldHardy: -3,
    pest: ['afide', 'paianjen'], spacing: 'ghiveci mare sau 4 m în climat fără îngheț', water: 2 },

  /* ---------- ARBUȘTI FRUCTIFERI ---------- */
  { id: 'zmeur', name: 'Zmeur', cat: 'arbust', icon: '🔴', life: 'perena',
    bloom: 40, hStart: 70, hEnd: 100, every: 3, feeder: 2, pruneAfterHarvest: true, winterPrune: -30,
    dis: ['putregai'], pest: ['afide'], cut: { anchor: 'lf', at: -20, kind: 'drajoni' }, coldHardy: -30,
    plant: { anchor: 'ff', at: 7 }, spacing: '40 cm pe rând, 1,5 m între rânduri', water: 2,
    tips: { taiere_vara: 'Tăiați de la nivelul solului lăstarii care au rodit anul acesta; păstrați 8–10 lăstari tineri pe metru liniar.' } },
  { id: 'coacaz', name: 'Coacăz / agriș', cat: 'arbust', icon: '⚫', life: 'perena',
    bloom: 15, hStart: 65, hEnd: 90, every: 5, feeder: 2, winterPrune: -40,
    dis: ['fainare', 'rugina'], pest: ['afide'], cut: { anchor: 'ff', at: 10, kind: 'lemnoși' }, coldHardy: -30,
    plant: { anchor: 'ff', at: 7 }, spacing: '1,5 m', water: 2 },
  { id: 'afin', name: 'Afin', cat: 'arbust', icon: '🫐', life: 'perena',
    bloom: 25, hStart: 90, hEnd: 125, every: 5, feeder: 1, winterPrune: -35, acid: true,
    pest: ['afide'], cut: { anchor: 'lf', at: 70, kind: 'semilemnoși' }, coldHardy: -25,
    plant: { anchor: 'ff', at: 7 }, spacing: '1,2–1,5 m, sol acid (pH 4,5–5,5)', water: 3 },
  { id: 'mur', name: 'Mur fără spini', cat: 'arbust', icon: '⚫', life: 'perena',
    bloom: 55, hStart: 100, hEnd: 140, every: 3, feeder: 2, pruneAfterHarvest: true,
    dis: ['putregai'], cut: { anchor: 'lf', at: 120, kind: 'marcotaj' }, coldHardy: -18,
    plant: { anchor: 'ff', at: 7 }, spacing: '2–3 m pe spalier', water: 2 },

  /* ---------- FLORI ---------- */
  { id: 'trandafir', name: 'Trandafir', cat: 'flori', icon: '🌹', life: 'perena', flower: true,
    bloom: 45, hStart: 45, hEnd: 200, every: 14, feeder: 2, springPrune: -10,
    dis: ['patarea_neagra', 'fainare', 'rugina'], pest: ['afide', 'paianjen'], cut: { anchor: 'lf', at: 80, kind: 'semilemnoși' }, coldHardy: -15,
    plant: { anchor: 'ff', at: -20 }, spacing: '50–80 cm', water: 2,
    tips: { taiere_iarna: 'Tăiați când înflorește forsythia: la 3–5 ochi la trandafirii teahibrizi, deasupra unui mugure orientat spre exterior.' } },
  { id: 'lalele', name: 'Lalele / zambile / narcise', cat: 'flori', icon: '🌷', life: 'bulb', flower: true,
    autumn: -30, bloom: 0, hStart: 0, hEnd: 25, every: 7, feeder: 1, lift: 60,
    dis: ['putregai'], spacing: 'adâncime = 3 × înălțimea bulbului', water: 1 },
  { id: 'dalii', name: 'Dalii (gherghine)', cat: 'flori', icon: '🌺', life: 'bulb', flower: true, warm: true,
    tuberSpring: 14, hStart: 75, every: 7, feeder: 2, stake: true, liftAfterFrost: true,
    dis: ['fainare'], pest: ['limacsi', 'afide'], spacing: '60–90 cm', water: 2 },
  { id: 'petunii', name: 'Petunii / flori anuale', cat: 'flori', icon: '🌸', life: 'anuala', flower: true, warm: true,
    indoor: -70, transplant: 21, germ: 20, mature: 40, span: 150, every: 10, feeder: 2,
    pest: ['afide'], spacing: '25–30 cm', water: 3 },
  { id: 'craite', name: 'Crăițe / gălbenele', cat: 'flori', icon: '🌼', life: 'anuala', flower: true, warm: true,
    direct: 7, germ: 15, mature: 55, span: 120, every: 10, feeder: 1,
    seed: { d: 50, how: 'capitule' }, spacing: '25 cm (excelente printre legume)', water: 1 },
  { id: 'muscate', name: 'Mușcate (Pelargonium)', cat: 'flori', icon: '🌺', life: 'perena', flower: true, tender: true,
    bloom: 30, hStart: 30, hEnd: 180, every: 10, feeder: 2, overwinterIndoor: true,
    cut: { anchor: 'ff', at: -45, kind: 'semilemnoși' }, pest: ['musculita'], coldHardy: 0, spacing: 'ghiveci / jardinieră', water: 2 },
  { id: 'bujor', name: 'Bujor', cat: 'flori', icon: '🌸', life: 'perena', flower: true,
    bloom: 35, hStart: 35, hEnd: 55, every: 7, feeder: 1, stake: true, cutBackAutumn: true,
    dis: ['putregai'], cut: { anchor: 'ff', at: -40, kind: 'divizare' }, coldHardy: -35,
    plant: { anchor: 'ff', at: -40 }, spacing: '90 cm', water: 1 }
];

window.SEED_HOW = {
  fructe: 'Alegeți 2–3 fructe perfect coapte de pe cele mai sănătoase plante (soiuri vechi, nu hibrizi F1). Scoateți semințele cu pulpa, lăsați-le 2–3 zile la fermentat în puțină apă (roșii), clătiți într-o sită și uscați-le pe hârtie, la umbră, 7–10 zile.',
  castraveti: 'Lăsați 1–2 castraveți pe plantă până devin galbeni și moi. Scoateți semințele, fermentați-le 2 zile, clătiți și uscați.',
  dovleci: 'Din fructele complet coapte scoateți semințele, spălați-le de pulpă și uscați-le 2 săptămâni într-un singur strat.',
  pastai: 'Lăsați păstăile să se usuce complet pe plantă (foșnesc). Treierați-le, uscați boabele încă o săptămână și păstrați-le la rece, cu puțin piper/foi de dafin contra gărgărițelor.',
  puf: 'Când florile s-au transformat în puf alb, tăiați tulpinile florale într-o pungă de hârtie, scuturați-le și cerneți semințele.',
  umbele: 'Tăiați umbelele când semințele s-au maronit, atârnați-le cu capul în jos într-o pungă de hârtie la uscat.',
  stiuleti: 'Lăsați câțiva știuleți să se usuce complet pe plantă, apoi păstrați-i în pănuși, în loc uscat.',
  capitule: 'Culegeți capitulele uscate, desfaceți-le și păstrați semințele în plic de hârtie.'
};
