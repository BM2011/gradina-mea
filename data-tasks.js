/* Ghiduri detaliate pentru fiecare tip de sarcină.
 * methods: bio / chimic / gratuit — fiecare cu materiale și pași proprii.
 * wx: regula meteo care se verifică înainte de a programa sarcina.
 */
window.METHODS = {
  bio:     { name: 'Bio / ecologic', icon: '🌱', desc: 'Produse naturale sau admise în agricultura ecologică.' },
  chimic:  { name: 'Convențional',   icon: '🧪', desc: 'Îngrășăminte minerale și produse fitosanitare omologate.' },
  gratuit: { name: 'Gratuit (DIY)',  icon: '🆓', desc: 'Doar cu ce aveți în gospodărie, fără cheltuieli.' }
};

window.TASKS = {
  pregatire_sol: {
    title: 'Pregătirea solului', icon: '🪏', group: 'ingrijire', wx: 'sapat', dur: 60,
    why: 'Un sol afânat și hrănit este jumătate din recoltă: rădăcinile cresc ușor, apa se infiltrează, iar plantele pornesc viguros.',
    tools: ['Sapă sau cazma', 'Furcă de săpat (pentru solurile grele)', 'Grebla', 'Roabă', 'Mănuși'],
    steps: [
      'Alegeți o zi în care solul nu se lipește de sapă: luați un pumn de pământ și strângeți-l – dacă se sfărâmă când îl atingeți, e bun de lucrat.',
      'Îndepărtați buruienile perene cu tot cu rădăcini (pir, volbură, susai).',
      'Săpați la adâncimea unui cazmale (20–25 cm). Pe solurile ușoare doar afânați cu furca, fără să întoarceți brazda.',
      'Încorporați îngrășământul ales (vezi varianta de mai jos) în primii 10–15 cm.',
      'Nivelați cu grebla, sfărâmând bulgării, și lăsați solul să se așeze 7–10 zile înainte de plantare.'
    ],
    methods: {
      bio: { mat: ['Compost matur 3–5 kg/m²', 'sau gunoi de grajd bine descompus (min. 1 an) 4–6 kg/m²', 'Îngrășământ organic granulat (peleți din gunoi de pasăre) 100–150 g/m²'],
             steps: ['Împrăștiați compostul uniform și încorporați-l cu grebla sau furca.', 'Pe solurile acide (pH < 6) adăugați 100–200 g/m² var dolomitic sau făină de rocă.'] },
      chimic: { mat: ['Îngrășământ complex NPK 15-15-15: 30–40 g/m²', 'Superfosfat (pentru pomi/viță la plantare) 50 g/m²'],
                steps: ['Împrăștiați granulele uniform (mâna plină ≈ 30–40 g) și încorporați-le imediat.', 'Nu puneți îngrășământul în contact direct cu semințele sau rădăcinile.'] },
      gratuit: { mat: ['Compost din resturi de bucătărie și grădină', 'Frunze uscate mărunțite', 'Cenușă de lemn (max. 100 g/m², nu pe soluri calcaroase)', 'Iarbă cosită uscată'],
                 steps: ['Îngropați resturile vegetale sănătoase direct în șanț („compost în șanț”) cu 4–6 săptămâni înainte de plantare.', 'Semănați toamna îngrășământ verde (muștar, secară, facelia) din semințe păstrate și încorporați-l primăvara.'] }
    },
    tips: ['Nu lucrați niciodată solul ud: se compactează și face bulgări care durează tot sezonul.']
  },

  semanat_interior: {
    title: 'Semănat pentru răsaduri', icon: '🌱', group: 'semanat', dur: 30,
    why: 'Plantele cu sezon lung (roșii, ardei, vinete) au nevoie de 6–10 săptămâni de creștere la adăpost ca să rodească înainte de toamnă.',
    tools: ['Tăvi alveolare, pahare sau cofraje de ouă cu găuri la bază', 'Pulverizator', 'Etichete și marker', 'Folie sau capac transparent', 'Sursă de lumină: geam la sud sau lampă LED de creștere'],
    steps: [
      'Umpleți recipientele cu substrat umezit în prealabil (să fie ca un burete stors) și tasați ușor.',
      'Puneți 2–3 semințe în fiecare alveolă, la o adâncime de 2–3 ori diametrul seminței (roșii ~0,5 cm).',
      'Acoperiți cu un strat subțire de substrat sau vermiculit și pulverizați apă.',
      'Acoperiți cu folie și țineți la căldură (temperatura de germinare indicată mai jos) – nu e nevoie de lumină până răsar.',
      'Imediat ce apar primele plantule, scoateți folia și mutați-le la lumină maximă, la 18–22 °C ziua și 15–17 °C noaptea, ca să nu se alungească.',
      'Udați de jos (în tava de sub pahare) când substratul se deschide la culoare.'
    ],
    methods: {
      bio: { mat: ['Substrat pentru răsaduri certificat ecologic', 'Semințe din comerț ecologice sau proprii'], steps: ['Puteți îmbogăți substratul cu 10% vermicompost.'] },
      chimic: { mat: ['Substrat profesional pe bază de turbă, fertilizat', 'Îngrășământ lichid pentru răsaduri (după 2 frunze adevărate)'], steps: ['Fertilizați la 10 zile cu doza la jumătate față de etichetă.'] },
      gratuit: { mat: ['Pământ de grădină cernut 1/2 + compost cernut 1/4 + nisip 1/4', 'Cofraje de ouă, cutii de iaurt, sticle PET tăiate', 'Semințe păstrate de anul trecut'],
                 steps: ['Dezinfectați pământul de grădină prin încălzire în cuptor (30 min la 80–90 °C, într-o tavă acoperită) sau turnând apă clocotită peste el; lăsați-l să se răcească.', 'Faceți găuri de drenaj cu un cui încins.'] }
    },
    tips: ['Folosiți o lampă LED la 10–15 cm deasupra plantelor, 14–16 ore pe zi, dacă nu aveți un geam însorit.', 'Un ventilator mic sau mângâierea zilnică a vârfurilor face tulpinile mai groase.']
  },

  repicat: {
    title: 'Repicat răsaduri', icon: '🪴', group: 'semanat', dur: 40,
    why: 'Mutarea în ghivece individuale dă spațiu rădăcinilor și obține răsaduri scunde și viguroase.',
    tools: ['Ghivece de 8–10 cm sau pahare de 300 ml', 'Bețișor/creion pentru scos plantele', 'Substrat', 'Stropitoare cu sită fină'],
    steps: [
      'Repicați când plantele au 1–2 frunze adevărate (cele de după cotiledoane).',
      'Udați răsadurile cu o oră înainte.',
      'Țineți planta DE FRUNZĂ (niciodată de tulpină) și ridicați-o cu bețișorul.',
      'Plantați-o puțin mai adânc (la roșii până la cotiledoane – vor face rădăcini noi pe tulpină).',
      'Tasați ușor, udați și țineți 2–3 zile la semiumbră, apoi din nou la lumină maximă.'
    ],
    methods: {
      bio: { mat: ['Substrat ecologic + 10% compost'], steps: [] },
      chimic: { mat: ['Substrat fertilizat', 'Îngrășământ lichid NPK echilibrat la 7–10 zile după repicat'], steps: [] },
      gratuit: { mat: ['Amestecul de pământ + compost folosit la semănat', 'Pahare din cutii de lapte tăiate'], steps: ['Udați o dată pe săptămână cu macerat de urzică diluat 1:20.'] }
    },
    tips: ['Păstrați doar cele mai viguroase plante; cele alungite și palide nu se mai refac.']
  },

  calire: {
    title: 'Călirea răsadurilor', icon: '🌬️', group: 'semanat', wx: 'calire', dur: 15,
    why: 'Răsadurile crescute în casă se ard la soare și vânt dacă sunt mutate brusc afară. Călirea le obișnuiește treptat în 7–10 zile.',
    tools: ['Ladă sau tavă pentru transport', 'Agril sau o pânză albă subțire pentru umbrire'],
    steps: [
      'Ziua 1–2: scoateți răsadurile afară 1–2 ore, la umbră, ferite de vânt.',
      'Ziua 3–4: 3–4 ore, dimineața la soare blând, apoi la umbră.',
      'Ziua 5–7: toată ziua afară, la soare; reduceți puțin udarea.',
      'Ziua 8–10: lăsați-le și noaptea dacă minima e peste 10 °C (plante de căldură) sau 5 °C (varză, salată).',
      'Băgați-le înăuntru în nopțile reci – aplicația vă anunță în prognoză.'
    ],
    tips: ['Frunzele albite = arsuri de soare: întoarceți-le la umbră și reluați mai încet.']
  },

  transplant: {
    title: 'Plantarea răsadurilor', icon: '🌿', group: 'semanat', wx: 'transplant', dur: 60,
    why: 'Momentul plantării este ales după data ultimului îngheț din zona dvs. și după prognoza pe următoarele zile.',
    tools: ['Plantator sau lingură de grădină', 'Sfoară și țăruși pentru rânduri', 'Stropitoare', 'Ruletă sau un băț marcat pentru distanțe'],
    steps: [
      'Plantați după-amiaza sau pe vreme înnorată, ca plantele să nu se ofilească.',
      'Udați răsadurile bine cu 1–2 ore înainte.',
      'Faceți gropi la distanța indicată, puneți în fiecare o mână de compost (sau îngrășământul ales) amestecat cu pământ.',
      'Scoateți răsadul cu tot balotul de pământ, fără să rupeți rădăcinile.',
      'Plantați la același nivel (roșiile, varza și ardeii pot fi plantați mai adânc, până la primele frunze).',
      'Tasați pământul cu palmele în jurul tulpinii și udați cu 1–2 L apă pe plantă, chiar dacă plouă.',
      'Pentru primele 2–3 zile însorite umbriți cu agril, o cutie sau crengi.'
    ],
    methods: {
      bio: { mat: ['Compost 1 mână/groapă', 'Vermicompost sau humus de râme', 'Micorize (opțional)'], steps: ['Presărați micorizele direct pe rădăcini la plantare.'] },
      chimic: { mat: ['NPK 15-15-15: 10–15 g/groapă, amestecat bine cu pământ (nu direct pe rădăcini)', 'Stimulator de înrădăcinare'], steps: [] },
      gratuit: { mat: ['Compost propriu', 'Câteva coji de ouă pisate (calciu) – roșii, ardei', 'O mână de cenușă de lemn amestecată cu pământul gropii (potasiu)'], steps: ['Puneți în groapă și câteva frunze de urzică tocate – se descompun și hrănesc planta.'] }
    },
    tips: ['Nu plantați legumele de căldură (roșii, ardei, vinete, castraveți) până când noaptea nu e constant peste 10 °C.']
  },

  semanat_direct: {
    title: 'Semănat direct în grădină', icon: '🌾', group: 'semanat', wx: 'semanat', dur: 30,
    why: 'Multe legume (morcovi, ridichi, fasole, mazăre, dovlecei) nu suportă transplantul și se seamănă direct la locul definitiv când solul s-a încălzit suficient.',
    tools: ['Grebla', 'Sapă sau băț pentru rigole', 'Sfoară cu țăruși', 'Stropitoare cu sită fină', 'Etichete'],
    steps: [
      'Verificați că solul are temperatura minimă de germinare (vezi mai jos – aplicația o compară cu temperatura solului din prognoză).',
      'Trageți rigole drepte de-a lungul sforii, la adâncimea de 2–3 ori grosimea seminței.',
      'Udați rigola ÎNAINTE de semănat, apoi distribuiți semințele uniform.',
      'Acoperiți cu pământ fin și tasați ușor cu dosul greblei.',
      'Țineți solul umed (nu ud) până la răsărire – udați zilnic cu sită fină dacă nu plouă.',
      'Marcați rândurile; la morcovi puneți câteva semințe de ridichi care răsar repede și arată rândul.'
    ],
    methods: {
      bio: { mat: ['Semințe ecologice', 'Compost cernut pentru acoperirea rigolei'], steps: ['Acoperiți rigola cu compost cernut în loc de pământ – nu face crustă.'] },
      chimic: { mat: ['Semințe tratate (drajate)', 'NPK 15-15-15: 20–30 g/m² încorporat cu o săptămână înainte'], steps: [] },
      gratuit: { mat: ['Semințe păstrate', 'Nisip fin pentru semințele mici (morcov, mac)'], steps: ['Amestecați semințele mici cu nisip uscat (1:5) ca să le distribuiți mai rar.', 'Înmuiați fasolea/mazărea 6–12 ore în apă înainte de semănat.'] }
    },
    tips: ['Solul rece și ud face semințele să putrezească – mai bine așteptați câteva zile.']
  },

  rarit: {
    title: 'Rărit plantele răsărite', icon: '✂️', group: 'ingrijire', dur: 20,
    why: 'Plantele prea dese rămân mici și se îmbolnăvesc. Rărirea lasă loc rădăcinilor să se dezvolte.',
    tools: ['Foarfecă mică sau degetele', 'Stropitoare'],
    steps: ['Udați rândul înainte, ca plantele scoase să nu le deranjeze pe cele rămase.', 'Lăsați cea mai viguroasă plantă la distanța indicată și tăiați/smulgeți-le pe celelalte.', 'La morcovi rărițiți seara și acoperiți imediat locul cu pământ – mirosul atrage musca morcovului.'],
    tips: ['Frunzele rărite de sfeclă, spanac sau salată sunt bune de mâncat.']
  },

  plantare_bulbi: {
    title: 'Plantare bulbi / căței / tuberculi', icon: '🧅', group: 'semanat', wx: 'sapat', dur: 30,
    why: 'Bulbii plantați la momentul potrivit apucă să înrădăcineze înainte de îngheț (toamna) sau pornesc fără risc (primăvara).',
    tools: ['Plantator pentru bulbi sau lingură de grădină', 'Ruletă', 'Grebla'],
    steps: ['Alegeți bulbi tari, fără pete moi sau mucegai.', 'Săpați gropi la adâncimea de 2–3 ori înălțimea bulbului.', 'Puneți bulbul cu vârful în sus, acoperiți și tasați.', 'Udați o dată, apoi doar dacă e secetă.', 'Mulciți toamna cu frunze sau paie în zonele cu ierni aspre.'],
    methods: {
      bio: { mat: ['Făină de oase sau compost pe fundul gropii'], steps: [] },
      chimic: { mat: ['Îngrășământ pentru bulbi (bogat în fosfor) 30 g/m²'], steps: [] },
      gratuit: { mat: ['Bulbi/căței păstrați de la recolta anterioară', 'Un pumn de nisip pe fundul gropii (drenaj)'], steps: [] }
    }
  },

  plantare_pom: {
    title: 'Plantarea pomului / arbustului / viței', icon: '🌳', group: 'semanat', wx: 'sapat', dur: 90,
    why: 'Plantarea în repaus vegetativ (toamna după căderea frunzelor sau primăvara devreme) dă cea mai bună prindere.',
    tools: ['Cazma', 'Târnăcop (sol tare)', 'Foarfecă de grădină', 'Țăruș de 1,5–2 m', 'Sfoară moale sau bandă de legat', 'Găleată mare cu apă'],
    steps: [
      'Țineți rădăcinile la înmuiat 12–24 ore în apă (cu puțin pământ și balegă – „mocirlire”).',
      'Săpați o groapă de 60 × 60 × 60 cm (pomi) sau 40 × 40 × 50 cm (arbuști, viță). Separați stratul fertil de cel de jos.',
      'Bateți țărușul în groapă ÎNAINTE de a pune pomul, pe partea vântului dominant.',
      'Amestecați pământul fertil cu îngrășământul ales și faceți o movilă pe fundul gropii.',
      'Scurtați vârfurile rădăcinilor rupte și așezați pomul cu punctul de altoire la 5–10 cm DEASUPRA solului (la viță: la nivelul solului).',
      'Umpleți cu pământ, scuturând ușor pomul ca să intre printre rădăcini, tasați cu piciorul și formați o copaie.',
      'Udați cu 2–3 găleți, chiar dacă plouă, și legați pomul de țăruș în „8”.',
      'Scurtați tulpina la 70–90 cm (pom) pentru a forma coroana.'
    ],
    methods: {
      bio: { mat: ['Compost 10–15 kg/groapă', 'Gunoi de grajd descompus', 'Micorize pentru pomi'], steps: [] },
      chimic: { mat: ['Superfosfat 200–300 g/groapă', 'Sare potasică 100 g/groapă'], steps: ['Amestecați foarte bine cu pământul; nu atingeți direct rădăcinile.'] },
      gratuit: { mat: ['Pământul fertil de la suprafață', 'Frunze și iarbă pe fundul gropii', 'Cenușă de lemn 1 mână'], steps: [] }
    }
  },

  mulcire: {
    title: 'Mulcire', icon: '🍂', group: 'ingrijire', dur: 30,
    why: 'Un strat de mulci păstrează umezeala, oprește buruienile, răcorește solul vara și reduce bolile (pământul nu mai stropește frunzele).',
    tools: ['Furcă sau mâini', 'Roabă'],
    steps: ['Plivit și udat bine înainte.', 'Așterneți un strat de 5–8 cm, lăsând 3–5 cm liberi în jurul tulpinii.', 'Completați stratul pe măsură ce se descompune.'],
    methods: {
      bio: { mat: ['Paie curate, scoarță mărunțită, compost grosier'], steps: [] },
      chimic: { mat: ['Folie neagră de mulcire sau agrotextil'], steps: ['Întindeți folia înainte de plantare și tăiați găuri în X pentru plante; puneți picurare sub folie.'] },
      gratuit: { mat: ['Iarbă cosită uscată 1–2 zile (strat subțire, altfel fermentează)', 'Frunze mărunțite', 'Carton fără cerneală colorată, acoperit cu iarbă'], steps: [] }
    },
    tips: ['Nu mulciți legumele de căldură primăvara prea devreme – solul trebuie întâi să se încălzească.']
  },

  plivit: {
    title: 'Plivit și prășit', icon: '🌾', group: 'ingrijire', wx: 'uscat', dur: 30,
    why: 'Buruienile fură apă, lumină și hrană. O prașilă superficială rupe și crusta solului („o prașilă face cât o udare”).',
    tools: ['Sapă mică sau prășitoare', 'Cultivator de mână', 'Mănuși', 'Găleată pentru buruieni'],
    steps: ['Lucrați pe vreme uscată, dimineața – buruienile tăiate se usucă la soare.', 'Prășiți superficial (2–4 cm) ca să nu tăiați rădăcinile culturii.', 'Smulgeți cu mâna buruienile de lângă plante.', 'Buruienile fără semințe merg la compost.'],
    tips: ['Pe vreme ploioasă buruienile tăiate reînrădăcinează – aplicația mută sarcina pe o zi uscată.']
  },

  udare: {
    title: 'Udare', icon: '💧', group: 'ingrijire', dur: 20,
    why: 'Cantitatea e calculată din evapotranspirația (apa pierdută de plante) și din ploaia ultimelor zile și a prognozei.',
    tools: ['Furtun cu pistol sau stropitoare', 'Sistem de picurare (ideal)', 'Butoi pentru apă de ploaie'],
    steps: ['Udați dimineața devreme (sau seara, dacă nu e posibil altfel).', 'Udați la rădăcină, nu pe frunze – reduce bolile.', 'Mai bine rar și abundent decât des și puțin: apa trebuie să ajungă la 20–30 cm.', 'Verificați cu degetul: dacă solul e umed la 5 cm adâncime, mai așteptați.'],
    methods: {
      bio: { mat: ['Apă de ploaie colectată', 'Picurare + mulci'], steps: [] },
      chimic: { mat: ['Fertirigare: îngrășământ solubil în apa de udare, după etichetă'], steps: ['O dată la 10–14 zile puteți adăuga îngrășământ solubil în apa de udare.'] },
      gratuit: { mat: ['Sticle PET cu găuri în dop, îngropate cu gâtul în jos lângă plante', 'Butoi sub burlan', 'Oale de lut îngropate (olla)'], steps: [] }
    }
  },

  fertilizare: {
    title: 'Fertilizare', icon: '🧺', group: 'ingrijire', wx: 'fertilizare', dur: 20,
    why: 'Plantele mari consumatoare (roșii, ardei, castraveți, varză) au nevoie de hrană suplimentară în perioada de creștere și rodire.',
    tools: ['Stropitoare de 10 L', 'Găleată', 'Mănuși', 'Lingură/pahar de măsură'],
    steps: ['Udați solul cu apă simplă înainte, dacă e uscat (îngrășământul pe sol uscat arde rădăcinile).', 'Aplicați îngrășământul la baza plantelor, nu pe frunze.', 'La începutul creșterii folosiți îngrășăminte cu azot; la înflorire și fructificare, bogate în potasiu și fosfor.'],
    methods: {
      bio: { mat: ['Îngrășământ organic lichid (vermicompost lichid, extract de alge)', 'Peleți de gunoi de pasăre 50–100 g/m²', 'Compost la suprafață 1–2 cm'], steps: ['Diluați extractul lichid după etichetă (de obicei 10–20 ml/L).'] },
      chimic: { mat: ['Îngrășământ solubil NPK 20-20-20 la creștere', 'NPK cu potasiu ridicat (ex. 15-5-30) la fructificare', 'Azotat de calciu contra putregaiului apical (roșii, ardei)'], steps: ['Doză uzuală: 1–2 g/L, 1–2 L pe plantă; nu depășiți eticheta.'] },
      gratuit: { mat: ['Macerat de urzică: 1 kg urzici / 10 L apă, 10–14 zile la fermentat, amestecat zilnic', 'Macerat de tătăneasă (Symphytum) – bogat în potasiu', 'Cenușă de lemn 1 mână/m²', 'Ceai de compost'],
                 steps: ['Diluați maceratul 1:10 pentru udare la rădăcină (1:20 pentru plante tinere).', 'Aplicați la 10–14 zile; mirosul dispare în câteva ore.'] }
    }
  },

  palisare: {
    title: 'Palisat și legat', icon: '🪢', group: 'ingrijire', dur: 30,
    why: 'Plantele susținute nu se rup, se aerisesc mai bine (mai puține boli) și fructele nu ating pământul.',
    tools: ['Araci/țăruși de 1,5–2 m sau sârmă și sfoară pentru spalier', 'Sfoară moale (rafie, bumbac, fâșii de material textil)', 'Foarfecă', 'Ciocan'],
    steps: ['Bateți tutorele la 10 cm de tulpină, pe partea dinspre vânt, fără să răniți rădăcinile.', 'Legați în formă de „8” – bucla largă în jurul tulpinii, ca să aibă loc să se îngroașe.', 'Repetați legarea la fiecare 25–30 cm de creștere.', 'În solar puteți folosi sfoară atârnată de structură și înfășurată în jurul tulpinii.'],
    methods: { gratuit: { mat: ['Crengi drepte de alun, salcâm sau trestie', 'Fâșii din tricouri vechi sau ciorapi'], steps: [] } }
  },

  copilit: {
    title: 'Copilit (îndepărtarea lăstarilor laterali)', icon: '✋', group: 'ingrijire', wx: 'uscat', dur: 20,
    why: 'Lăstarii din axila frunzelor („copiii”) consumă hrana pe care planta ar pune-o în fructe și îndesesc planta.',
    tools: ['Degetele (ideal)', 'Foarfecă mică dezinfectată cu alcool'],
    steps: ['Lucrați dimineața, pe vreme uscată, ca rănile să se usuce repede.', 'Rupeți cu degetele copiii cât sunt mici (3–5 cm), aplecându-i lateral.', 'Nu confundați copilul cu inflorescența: copilul crește din unghiul dintre tulpină și frunză.', 'Îndepărtați și frunzele bătrâne de jos, îngălbenite sau care ating solul.'],
    tips: ['Dacă un copil a scăpat și e mare, tăiați-l cu foarfeca, nu-l smulgeți.', 'Copiii sănătoși de roșii se înrădăcinează în apă în 7–10 zile – răsaduri gratuite!']
  },

  carnit: {
    title: 'Cârnit (ciupitul vârfului)', icon: '✂️', group: 'ingrijire', dur: 15,
    why: 'Oprirea creșterii pe înălțime face ca fructele deja formate să crească și să se coacă înainte de primul îngheț.',
    tools: ['Foarfecă de grădină dezinfectată'],
    steps: ['Tăiați vârful plantei deasupra a 2 frunze peste ultima inflorescență legată.', 'Eliminați și florile noi apărute – nu mai apucă să facă fructe.']
  },

  musuroire: {
    title: 'Mușuroit', icon: '⛰️', group: 'ingrijire', wx: 'uscat', dur: 30,
    why: 'Mușuroiul stimulează formarea tuberculilor (cartof) sau albirea tulpinii (praz) și protejează de înverzire și ger.',
    tools: ['Sapă', 'Rariță manuală (suprafețe mari)'],
    steps: ['Pe sol reavăn, trageți pământul dintre rânduri spre plante, formând o creastă de 15–20 cm.', 'Primul mușuroit la 15–20 cm înălțime a plantelor, al doilea după 2–3 săptămâni.']
  },

  tratament_fungic: {
    title: 'Tratament preventiv contra bolilor', icon: '🛡️', group: 'tratament', wx: 'stropit', dur: 40,
    why: 'Bolile fungice (mana, făinarea, rapănul etc.) se previn mult mai ușor decât se tratează. Riscul crește după ploi și pe vreme caldă și umedă.',
    tools: ['Pompă de stropit (vermorel) sau pulverizator', 'Găleată și băț pentru amestecat', 'Cântar de bucătărie / pahar gradat', 'Echipament de protecție: mănuși de nitril, ochelari, mască, haine cu mânecă lungă'],
    steps: [
      'Alegeți o zi fără ploaie în următoarele 6–24 ore și cu vânt sub 15 km/h (aplicația verifică prognoza).',
      'Stropiți dimineața după ce s-a ridicat roua sau seara; nu peste 25–28 °C.',
      'Pregătiți soluția proaspătă, doar cât folosiți: întâi puțină apă, produsul, apoi completați.',
      'Udați complet ambele fețe ale frunzelor până la început de picurare.',
      'Spălați pompa după folosire și notați data – repetați după 10–14 zile sau după o ploaie de peste 20 mm.'
    ],
    methods: {
      bio: { mat: ['Vezi remediile bio pentru bolile acestei plante (mai jos)'], steps: ['Produsele cu cupru se aplică preventiv, înaintea ploilor; nu vindecă infecția deja instalată.'] },
      chimic: { mat: ['Vezi fungicidele recomandate pentru bolile acestei plante (mai jos)'], steps: ['Respectați strict doza și PAUZA DE SIGURANȚĂ (zilele până la recoltare) de pe etichetă.', 'Alternați substanțele active de la un tratament la altul.'] },
      gratuit: { mat: ['Decoct de coada-calului: 200 g plantă proaspătă sau 20 g uscată / 1 L apă, fiert 20 min, strecurat, diluat 1:5', 'Lapte 1 parte : apă 9 părți (făinare)', 'Bicarbonat de sodiu 5 g + câteva picături de săpun / 1 L apă'],
                 steps: ['Aplicați la 7 zile și după fiecare ploaie.', 'Îndepărtați și distrugeți (nu compostați) frunzele bolnave.'] }
    },
    safety: ['Nu stropiți plantele aflate în floare cu produse toxice pentru albine.', 'Țineți copiii și animalele departe până se usucă soluția.', 'Nu aruncați resturile de soluție în canal sau fântână.']
  },

  monitorizare: {
    title: 'Verificare dăunători', icon: '🔍', group: 'tratament', dur: 15,
    why: 'Un atac descoperit devreme se rezolvă cu mijloace simple, fără chimicale.',
    tools: ['Lupă (opțional)', 'Capcane lipicioase galbene/albastre', 'Lanternă (pentru limacși, seara)'],
    steps: ['Întoarceți câte 10 frunze de la plante diferite și uitați-vă pe dos.', 'Verificați vârfurile de creștere, florile și fructele.', 'Seara, după ploaie, căutați limacșii cu lanterna.', 'Dacă găsiți dăunătorii de mai jos, aplicați varianta de tratament aleasă.'],
    methods: {
      bio: { mat: ['Vezi remediile bio pentru dăunătorii acestei plante (mai jos)'], steps: [] },
      chimic: { mat: ['Vezi insecticidele recomandate (mai jos) – doar dacă atacul depășește pragul (ex. colonii pe peste 10% din plante)'], steps: ['Respectați pauza de siguranță și nu tratați în timpul înfloririi.'] },
      gratuit: { mat: ['Vezi remediile gratuite pentru dăunătorii acestei plante (mai jos)'], steps: [] }
    }
  },

  recoltare: {
    title: 'Recoltare', icon: '🧺', group: 'recoltare', wx: 'recoltare', dur: 30,
    why: 'Recoltarea la momentul potrivit dă gust maxim și, la multe legume, stimulează planta să producă în continuare.',
    tools: ['Coș sau ladă', 'Foarfecă sau cuțit ascuțit', 'Mănuși'],
    steps: ['Recoltați dimineața, după ce s-a uscat roua – legumele sunt mai crocante și se păstrează mai bine.', 'Tăiați fructele cu codiță, nu le smulgeți (rupeți lăstarii).', 'Puneți-le la umbră imediat după cules.', 'Îndepărtați și fructele bolnave sau crăpate, ca să nu răspândească putregaiul.']
  },

  recoltare_seminte: {
    title: 'Recoltare semințe pentru anul viitor', icon: '🫙', group: 'recoltare', dur: 30,
    why: 'Semințele proprii, din soiuri vechi (nu hibrizi F1), sunt gratuite și se adaptează an de an la grădina dvs.',
    tools: ['Plicuri de hârtie', 'Borcan cu apă (pentru fermentare)', 'Sită', 'Hârtie absorbantă', 'Marker'],
    steps: ['Alegeți plantele cele mai sănătoase, productive și tipice soiului.', 'Recoltați doar fructele/păstăile complet coapte.', 'Procedați ca în instrucțiunile specifice de mai jos.', 'Etichetați plicul: specia, soiul, anul.', 'Păstrați la rece, uscat și întuneric (un borcan cu un plic de orez la fund absoarbe umezeala).'],
    tips: ['Semințele din hibrizi F1 nu reproduc planta-mamă – nu merită păstrate.']
  },

  curatare_toamna: {
    title: 'Curățenia de toamnă', icon: '🍁', group: 'ingrijire', dur: 60,
    why: 'Resturile bolnave lăsate peste iarnă sunt sursa bolilor de anul viitor.',
    tools: ['Foarfecă', 'Sapă', 'Roabă', 'Saci'],
    steps: ['Scoateți plantele uscate; cele sănătoase merg la compost, cele bolnave se ard sau se aruncă.', 'Strângeți araci, sfori și etichete; dezinfectați-i (apă cu var sau oțet).', 'Semănați îngrășământ verde sau mulciți solul gol.', 'Notați ce a mers bine – aplicația păstrează istoricul sarcinilor făcute.'],
    methods: { gratuit: { mat: ['Semințe de muștar, secară sau facelia păstrate', 'Frunze uscate pentru mulci'], steps: [] } }
  },

  /* ---------- POMI, VIȚĂ, ARBUȘTI ---------- */
  taiere_iarna: {
    title: 'Tăieri de iarnă / primăvară', icon: '✂️', group: 'taiere', wx: 'taiere', dur: 90,
    why: 'Tăierile în repaus stabilesc forma, aerisesc coroana și reglează rodul. Se fac după trecerea gerurilor mari și înainte de pornirea mugurilor.',
    tools: ['Foarfecă de vie/pomi bine ascuțită', 'Foarfecă cu brațe lungi (secator) pentru ramuri de 2–4 cm', 'Fierăstrău de pomi', 'Alcool sau spirt pentru dezinfectarea lamelor', 'Scară stabilă', 'Mănuși'],
    steps: [
      'Tăiați doar în zile fără ger (peste -2 °C) și fără ploaie.',
      'Începeți cu cele 3 D: ramuri uscate, bolnave și rupte (Dead, Diseased, Damaged).',
      'Eliminați lăstarii lacomi (verticali, viguroși, fără muguri de rod) și ramurile care cresc spre interior sau se încrucișează.',
      'Rărițiți coroana ca să pătrundă lumina („să poată trece o pălărie aruncată prin ea”).',
      'Tăiați întotdeauna deasupra unui mugur orientat spre exterior, oblic, la 0,5–1 cm de mugur.',
      'La ramurile groase tăiați în 3 timpi (dedesubt, deasupra, apoi la inelul de la bază), ca să nu rupă coaja.',
      'Dezinfectați lamele între pomi, mai ales dacă ați tăiat ramuri bolnave.'
    ],
    methods: {
      bio: { mat: ['Mastic/pastă de altoit pe bază de ceară de albine și rășini naturale pentru rănile > 2 cm'], steps: [] },
      chimic: { mat: ['Mastic cicatrizant cu fungicid pentru rănile > 2 cm'], steps: [] },
      gratuit: { mat: ['Pastă din lut + balegă de vacă (1:1), amestecată cu apă', 'Ramurile tăiate: tocate pentru mulci sau folosite ca araci'], steps: ['Rănile mici (< 2 cm) nu au nevoie de nimic – se închid singure dacă tăietura e curată.'] }
    },
    vine: [
      'La viță: lăsați pe butuc 1–2 coarde de rod de 8–12 ochi și 1–2 cepi de înlocuire de 2 ochi (sistemul Guyot) sau cepi de 2–3 ochi pe cordon.',
      'Eliminați lemnul bătrân care a rodit anul trecut.',
      'Dacă tăiați târziu, via „plânge” – nu e periculos, doar inestetic.'
    ]
  },

  taiere_vara: {
    title: 'Tăieri de vară / după recoltare', icon: '✂️', group: 'taiere', wx: 'taiere', dur: 60,
    why: 'La cireș, cais, nuc, zmeur, căpșun și lavandă tăierea după recoltare reduce bolile lemnului și pregătește rodul de anul viitor.',
    tools: ['Foarfecă de pomi dezinfectată', 'Fierăstrău', 'Mastic pentru rănile mari'],
    steps: ['Tăiați pe vreme uscată, ca rănile să se usuce repede.', 'Eliminați ramurile uscate, încrucișate și cele care îndesesc coroana.', 'Scurtați ramurile prea lungi deasupra unei ramificații laterale.', 'Strângeți resturile tăiate, mai ales cele bolnave.'],
    methods: {
      bio: { mat: ['Mastic natural pe bază de ceară'], steps: [] },
      chimic: { mat: ['Mastic cicatrizant cu fungicid'], steps: [] },
      gratuit: { mat: ['Pastă de lut și balegă'], steps: [] }
    }
  },

  tratament_repaus: {
    title: 'Tratament de iarnă (în repaus)', icon: '❄️', group: 'tratament', wx: 'stropit_repaus', dur: 45,
    why: 'Distruge ouăle de dăunători și sporii de ciuperci care iernează pe scoarță, înainte de pornirea mugurilor. Este cel mai eficient tratament al anului.',
    tools: ['Pompă de stropit', 'Perie de sârmă sau răzuitor pentru scoarța bătrână', 'Echipament de protecție'],
    steps: ['Răzuiți scoarța bătrână și desprinsă de pe trunchi și ramurile groase (adună ouă de dăunători) – strângeți resturile pe o folie.', 'Stropiți la temperaturi de peste 5 °C, fără vânt și fără ploaie în următoarele 24 h.', 'Udați complet scoarța, inclusiv trunchiul și crăpăturile.'],
    methods: {
      bio: { mat: ['Zeamă bordeleză 2% (cupru)', 'Ulei horticol de parafină 2–3% (contra ouălor de afide, păianjeni, păduchele din San José)'], steps: ['Uleiul și cuprul se aplică separat, la 7–10 zile, nu în amestec dacă eticheta nu permite.'] },
      chimic: { mat: ['Produs combinat ulei + cupru omologat pentru tratamente de iarnă', 'sau oxiclorură de cupru 0,5%'], steps: ['Respectați doza de pe etichetă; folosiți echipament de protecție.'] },
      gratuit: { mat: ['Lapte de var (1 kg var stins / 10 L apă) pentru văruirea trunchiului', 'Perie și răzuitor'], steps: ['Văruiți trunchiul și bazele ramurilor groase – protejează de crăpăturile de ger și de dăunători.', 'Ardeți sau îngropați scoarța răzuită.'] }
    }
  },

  tratament_dezmugurire: {
    title: 'Tratament la umflarea / dezmugurirea mugurilor', icon: '🌱', group: 'tratament', wx: 'stropit', dur: 40,
    why: 'Momentul critic pentru bășicarea piersicului, rapăn, monilioză și mană: țesuturile tinere sunt foarte sensibile.',
    tools: ['Pompă de stropit', 'Echipament de protecție'],
    steps: ['Aplicați când mugurii sunt umflați sau încep să arate vârful verde.', 'Stropiți uniform toată coroana.', 'Repetați dacă urmează o perioadă ploioasă de peste 2 zile.'],
    methods: {
      bio: { mat: ['Zeamă bordeleză 1% sau hidroxid de cupru după etichetă'], steps: [] },
      chimic: { mat: ['Fungicid omologat pentru pomi/viță (ex. pe bază de cupru + fungicid sistemic, dodină la măr/păr)'], steps: [] },
      gratuit: { mat: ['Decoct de coada-calului', 'Strângerea fructelor mumifiate și a frunzelor rămase'], steps: [] }
    },
    safety: ['Cuprul pe frunze foarte tinere poate produce arsuri: nu depășiți concentrația.']
  },

  tratament_inflorit: {
    title: 'Tratament înainte de înflorit', icon: '🌸', group: 'tratament', wx: 'stropit', dur: 40,
    why: 'Protejează florile de monilioză și rapăn. ÎN TIMPUL ÎNFLORIRII NU SE FOLOSESC INSECTICIDE – albinele vă polenizează pomii!',
    tools: ['Pompă de stropit', 'Echipament de protecție'],
    steps: ['Aplicați în faza de „buton roz/alb” (florile umflate, încă închise).', 'Dacă pomii au început să înflorească, folosiți doar produse netoxice pentru albine, seara după zborul albinelor.'],
    methods: {
      bio: { mat: ['Sulf muiabil 0,3% sau Bacillus subtilis'], steps: [] },
      chimic: { mat: ['Fungicid omologat (ex. pe bază de ciprodinil, fenhexamid, difenoconazol)'], steps: [] },
      gratuit: { mat: ['Decoct de coada-calului'], steps: [] }
    }
  },

  rarire_fructe: {
    title: 'Rărirea fructelor', icon: '🍏', group: 'ingrijire', dur: 40,
    why: 'Un pom încărcat face fructe mici și rodește din doi în doi ani. Rărirea dă fructe mari și rod constant.',
    tools: ['Foarfecă mică', 'Scară'],
    steps: ['După căderea naturală din iunie, lăsați 1–2 fructe pe buchet (măr, păr) sau câte un fruct la 10–15 cm (piersic, cais).', 'Îndepărtați întâi fructele mici, deformate sau înțepate.']
  },

  legat_coarde: {
    title: 'Legatul coardelor (viță)', icon: '🪢', group: 'ingrijire', wx: 'uscat', dur: 40,
    why: 'Coardele legate orizontal sau în arc pornesc uniform toți mugurii.',
    tools: ['Sârmă de spalier întinsă', 'Rafie, sfoară sau clipsuri', 'Clește'],
    steps: ['Legați coardele de rod pe sârma de jos, înainte de umflarea mugurilor (coardele sunt elastice).', 'Arcuiți ușor coardele lungi – nu le frângeți.', 'Verificați întinderea sârmelor și stâlpii.']
  },

  taiere_verde: {
    title: 'Tăieri în verde (viță)', icon: '🍃', group: 'taiere', wx: 'uscat', dur: 60,
    why: 'Plivitul lăstarilor, copilitul și cârnitul aerisesc butucul (mai puțină mană și făinare) și concentrează seva în struguri.',
    tools: ['Degetele', 'Foarfecă de vie'],
    steps: ['Plivit: rupeți lăstarii fără inflorescențe și dubli ce pornesc din același ochi (la 10–20 cm).', 'Copilit: rupeți copilii din axila frunzelor din zona ciorchinilor.', 'Legați lăstarii pe sârmele de deasupra.', 'Cârnit: scurtați vârfurile lăstarilor la 2–3 frunze deasupra ultimei sârme, după înflorit.']
  },

  desfrunzit: {
    title: 'Desfrunzit zona strugurilor', icon: '🍂', group: 'ingrijire', dur: 30,
    why: 'Ciorchinii expuși la lumină și aer se colorează mai bine și nu putrezesc.',
    tools: ['Degetele sau foarfecă'],
    steps: ['Îndepărtați 2–3 frunze bătrâne de la baza lăstarilor, pe partea de răsărit.', 'Nu desfrunziți pe partea de vest în zonele cu veri foarte calde (arsuri pe boabe).']
  },

  butasire: {
    title: 'Butășire / înmulțire', icon: '🌿', group: 'semanat', dur: 45,
    why: 'Obțineți plante noi gratuite, identice cu planta-mamă.',
    tools: ['Foarfecă ascuțită dezinfectată', 'Ghivece sau lăzi', 'Amestec nisip + turbă/compost (1:1)', 'Pungă transparentă sau sticlă tăiată pentru umiditate', 'Etichete'],
    steps: ['Alegeți ramuri sănătoase, din creșterea anului.', 'Pregătiți butașii după tipul indicat mai jos.', 'Tăiați la bază oblic, sub un nod/mugur, și în partea de sus drept, deasupra unui mugur.', 'Îndepărtați frunzele din jumătatea de jos.', 'Înfigeți 2/3 din butaș în substrat umed, tasați și acoperiți cu pungă/sticlă.', 'Țineți la lumină difuză, nu la soare direct; aerisiți zilnic.'],
    methods: {
      bio: { mat: ['Pudră de înrădăcinare naturală sau apă de salcie'], steps: [] },
      chimic: { mat: ['Hormon de înrădăcinare (acid indolilbutiric) – pudră sau gel'], steps: ['Înmuiați baza butașului în hormon și scuturați surplusul.'] },
      gratuit: { mat: ['Apă de salcie: crenguțe de salcie tăiate, ținute 24 h în apă', 'Miere (antiseptic natural) pe baza butașului', 'Pahare de plastic refolosite'], steps: ['Înmuiați baza butașilor 12–24 h în apa de salcie înainte de plantare.'] }
    },
    kinds: {
      'lemnoși': 'Butași lemnoși: ramuri de 1 an, groase cât un creion, de 20–30 cm (3–4 muguri), recoltați în repaus. Se păstrează în nisip umed la rece și se plantează primăvara, cu un singur mugur deasupra solului.',
      'semilemnoși': 'Butași semilemnoși: vârfuri de 10–15 cm din lăstarii anului, cu baza ușor lemnificată (se îndoaie, dar nu se rup). Se înrădăcinează în 4–8 săptămâni la umiditate ridicată.',
      'verzi': 'Butași verzi: vârfuri moi de 8–10 cm, înrădăcinează repede la umiditate mare și căldură.',
      'stoloni': 'Stoloni: fixați „puii” de căpșun cu un cârlig de sârmă în ghivece cu pământ, lângă planta-mamă; după 3–4 săptămâni tăiați legătura și plantați-i.',
      'drajoni': 'Drajoni: scoateți cu cazmaua lăstarii tineri cu rădăcini care apar în jurul tufei și replantați-i.',
      'divizare': 'Divizare: scoateți tufa, tăiați-o cu cazmaua în 2–4 bucăți, fiecare cu muguri și rădăcini, și replantați imediat.',
      'marcotaj': 'Marcotaj: îngropați vârful unei ramuri lungi la 10 cm în pământ; după înrădăcinare (toamna) separați-l de planta-mamă.'
    }
  },

  flori_trecute: {
    title: 'Îndepărtarea florilor trecute', icon: '🥀', group: 'ingrijire', dur: 15,
    why: 'Planta nu mai consumă energie pentru semințe și face flori noi mult mai mult timp.',
    tools: ['Foarfecă mică sau degetele'],
    steps: ['Tăiați floarea trecută deasupra primei frunze complete.', 'La trandafiri tăiați deasupra unei frunze cu 5 foliole, orientată spre exterior.', 'Lăsați câteva flori la sfârșitul sezonului dacă vreți semințe.']
  },

  scoatere_bulbi: {
    title: 'Scoaterea și păstrarea bulbilor/tuberculilor', icon: '📦', group: 'recoltare', wx: 'uscat', dur: 40,
    why: 'Daliile, gladiolele și canna nu suportă înghețul solului; lalelele se scot opțional, pentru a fi rărite.',
    tools: ['Furcă de săpat', 'Lăzi', 'Rumeguș, turbă sau ziare', 'Etichete'],
    steps: ['Daliile: tăiați tulpinile la 10 cm după ce primul îngheț a înnegrit frunzele.', 'Scoateți cu furca, la distanță de tulpină, ca să nu răniți tuberculii.', 'Scuturați pământul și lăsați-i la uscat 1–2 săptămâni cu tulpina în jos.', 'Păstrați-i în lăzi cu rumeguș, la 4–8 °C, în pivniță sau garaj ferit de îngheț.', 'Verificați lunar și îndepărtați ce putrezește.']
  },

  protectie_iarna: {
    title: 'Protecție pentru iarnă', icon: '🧣', group: 'ingrijire', dur: 45,
    why: 'Plantele mai sensibile decât minima de iarnă a zonei dvs. au nevoie de protecție.',
    tools: ['Agril de iarnă (30–50 g/m²)', 'Paie, frunze, crengi de brad', 'Sfoară', 'Pământ (pentru mușuroire)'],
    steps: ['Viță, trandafiri: mușuroiți baza cu 20–30 cm de pământ sau compost după primele brume.', 'Smochin, kiwi tânăr: înfășurați în agril și paie; puteți culca și îngropa ramurile tinere de smochin.', 'Ghivece: mutați-le lângă casă sau în garaj luminos; înfășurați ghiveciul.', 'Nu folosiți folie de plastic direct pe plante – condensul îngheață și le arde.'],
    methods: { gratuit: { mat: ['Frunze uscate, paie, crengi de brad, saci de iută vechi, pământ'], steps: [] } }
  },

  iernare_interior: {
    title: 'Mutarea plantelor la adăpost pentru iarnă', icon: '🏠', group: 'ingrijire', dur: 30,
    why: 'Mușcatele, citricele și alte plante sensibile nu suportă înghețul.',
    tools: ['Foarfecă', 'Pulverizator'],
    steps: ['Mutați plantele înainte ca noaptea să coboare sub 5 °C.', 'Scurtați mușcatele la 1/3 și îndepărtați frunzele îngălbenite.', 'Verificați să nu aveți dăunători (musculiță, păianjen) înainte de a le duce în casă.', 'Țineți-le la 8–12 °C și lumină, udați rar.']
  },

  scoatere_afara: {
    title: 'Scoaterea plantelor afară', icon: '☀️', group: 'ingrijire', wx: 'calire', dur: 20,
    why: 'După trecerea înghețurilor, plantele iernate în casă se scot treptat afară.',
    tools: ['Substrat proaspăt', 'Îngrășământ'],
    steps: ['Scoateți-le întâi la umbră, câteva ore pe zi (ca la călire).', 'Schimbați stratul de deasupra al substratului sau transplantați într-un ghiveci cu 2–3 cm mai mare.', 'Fertilizați după 2 săptămâni.']
  },

  /* ---------- SARCINI GENERATE DE VREME ---------- */
  protectie_inghet: {
    title: 'Protecție contra înghețului', icon: '🥶', group: 'vreme', dur: 30, weather: true,
    why: 'Prognoza anunță temperaturi apropiate de 0 °C. Plantele sensibile, florile pomilor și răsadurile tinere pot fi distruse într-o singură noapte.',
    tools: ['Agril (17–30 g/m²)', 'Pături vechi, cutii de carton, găleți', 'Cârlige sau pietre pentru fixare', 'Stropitoare'],
    steps: ['Udați solul după-amiaza – solul umed acumulează și cedează mai multă căldură noaptea.', 'Acoperiți plantele seara, înainte de apus, cu agril sau material textil (nu folie direct pe frunze).', 'În solar/tunel adăugați un strat de agril peste plante și închideți ușile devreme.', 'Pomii mici în floare: acoperiți-i cu agril; pentru livezi se folosește aspersiunea sau fumul ușor înainte de răsărit.', 'Descoperiți dimineața după ce temperatura trece de 5 °C.'],
    methods: { gratuit: { mat: ['Sticle PET de 5 L tăiate (clopot) pentru fiecare răsad', 'Pături, cearceafuri, cutii, găleți întoarse', 'Sticle cu apă caldă puse în solar'], steps: [] } }
  },
  aerisire: {
    title: 'Aerisire solar / seră / tunel', icon: '🌬️', group: 'vreme', dur: 5, weather: true,
    why: 'La soare, în spațiul închis temperatura poate urca cu 15–25 °C peste cea de afară. Peste 32–35 °C florile de roșii și castraveți nu mai leagă, iar umezeala favorizează mana.',
    tools: ['Termometru de minimă-maximă în solar'],
    steps: ['Deschideți ușile/geamurile când temperatura din interior trece de 25 °C (dimineața, pe zi însorită).', 'Deschideți întâi pe partea opusă vântului.', 'Închideți după-amiaza devreme (pe la 16–17) ca să păstrați căldura pentru noapte.', 'În tunel, ridicați folia pe o parte.']
  },
  umbrire: {
    title: 'Protecție la caniculă', icon: '🥵', group: 'vreme', dur: 20, weather: true,
    why: 'Temperaturile foarte ridicate opresc legarea fructelor și ard frunzele și fructele.',
    tools: ['Plasă de umbrire 30–50%', 'Var stins (pentru vopsirea foliei solarului)', 'Mulci', 'Furtun / picurare'],
    steps: ['Udați dimineața devreme, abundent, la rădăcină.', 'Puneți plasă de umbrire peste culturile sensibile (salată, răsaduri) și pe solar.', 'Mulciți solul gol.', 'În solar: deschideți complet, iar la nevoie stropiți cu var diluat folia pe exterior.', 'Nu fertilizați și nu stropiți cu tratamente pe caniculă.']
  },
  alerta_boli: {
    title: 'Risc ridicat de boli – verificare și tratament', icon: '⚠️', group: 'vreme', wx: 'stropit', dur: 30, weather: true,
    why: 'Ploile repetate cu temperaturi de 12–26 °C creează condiții ideale pentru mană, putregai și rapăn. Tratamentul preventiv trebuie aplicat ÎNAINTE de ploaie sau imediat după ce frunzele se usucă.',
    tools: ['Pompă de stropit', 'Echipament de protecție'],
    steps: ['Verificați frunzele (inclusiv pe dos) pentru pete noi.', 'Aplicați tratamentul ales în prima fereastră fără ploaie.', 'Îndepărtați frunzele afectate și aerisiți plantele (copilit, desfrunzit).'],
    methods: null // se folosesc metodele de la tratament_fungic
  },
  vant: {
    title: 'Vânt puternic / furtună', icon: '💨', group: 'vreme', dur: 20, weather: true,
    why: 'Rafalele puternice rup plantele înalte, sfâșie folia și pot doborî pomii tineri.',
    tools: ['Sfoară', 'Țăruși', 'Cleme pentru folie', 'Saci cu nisip'],
    steps: ['Verificați legăturile la roșii, ardei, viță și pomii tineri.', 'Închideți bine solarul și tunelurile; fixați folia.', 'Mutați ghivecele la adăpost.', 'După furtună: tăiați curat ramurile rupte și verificați culturile.']
  },
  grindina: {
    title: 'Furtună cu posibilă grindină', icon: '🌩️', group: 'vreme', dur: 15, weather: true,
    why: 'Prognoza indică furtuni puternice. Grindina poate distruge frunzele și fructele în câteva minute.',
    tools: ['Plasă antigrindină sau agril gros', 'Lăzi, pături'],
    steps: ['Acoperiți răsadurile și culturile mici dacă se poate.', 'Mutați ghivecele sub streașină.', 'După grindină: tratați preventiv cu cupru/remediul ales – rănile sunt porți de intrare pentru boli.']
  }
};

/* Note specifice pentru locul plantării */
window.PLACE_NOTES = {
  _default: {
    solar: 'În solar umiditatea e mare: aerisiți zilnic și udați doar la rădăcină, dimineața. Ploaia nu contează – udarea e mereu în grija dvs.',
    sera: 'În seră diferențele zi-noapte sunt mari; un termometru de minimă-maximă vă ajută să reglați aerisirea.',
    sera_inc: 'În seră încălzită păstrați minim 12–14 °C noaptea pentru legumele de căldură și aerisiți scurt și în zilele reci, ca să eliminați umezeala.',
    tunel: 'Tunelul se încălzește foarte repede la soare: ridicați folia pe o parte în zilele însorite.',
    ghiveci: 'În ghiveci solul se usucă mult mai repede: verificați zilnic vara și fertilizați mai des, dar cu doze mai mici.',
    interior: 'În interior lumina e factorul limitativ: țineți planta la geamul cel mai luminos sau sub o lampă LED.',
    camp: ''
  },
  tratament_fungic: {
    solar: 'În solar stropiți dimineața și lăsați ușile deschise până se usucă frunzele. Nu tratați la peste 28 °C în interior.',
    sera: 'Aerisiți după tratament până se usucă frunzele.',
    camp: 'Verificați ca în următoarele 6–24 de ore să nu plouă – ploaia spală produsul.'
  },
  udare: {
    solar: 'În solar plantele consumă apă și în zilele ploioase. Calculul aplicației ține cont că ploaia nu ajunge la ele.',
    camp: 'Ploaia este scăzută automat din necesarul calculat.'
  },
  transplant: {
    solar: 'În solar puteți planta cu 3–4 săptămâni mai devreme decât afară; în nopțile reci acoperiți suplimentar cu agril.',
    tunel: 'În tunel puteți planta cu circa 2 săptămâni mai devreme; țineți folia închisă noaptea.',
    ghiveci: 'Pentru roșii și ardei folosiți ghivece de minim 15–20 L, cu găuri de drenaj.'
  }
};

window.WMO = {
  0: ['Senin', '☀️'], 1: ['Predominant senin', '🌤️'], 2: ['Parțial noros', '⛅'], 3: ['Înnorat', '☁️'],
  45: ['Ceață', '🌫️'], 48: ['Ceață cu chiciură', '🌫️'],
  51: ['Burniță slabă', '🌦️'], 53: ['Burniță', '🌦️'], 55: ['Burniță densă', '🌧️'], 56: ['Burniță înghețată', '🌧️'], 57: ['Burniță înghețată', '🌧️'],
  61: ['Ploaie slabă', '🌦️'], 63: ['Ploaie', '🌧️'], 65: ['Ploaie puternică', '🌧️'], 66: ['Ploaie înghețată', '🌧️'], 67: ['Ploaie înghețată', '🌧️'],
  71: ['Ninsoare slabă', '🌨️'], 73: ['Ninsoare', '🌨️'], 75: ['Ninsoare abundentă', '❄️'], 77: ['Grăunțe de zăpadă', '🌨️'],
  80: ['Averse slabe', '🌦️'], 81: ['Averse', '🌧️'], 82: ['Averse violente', '⛈️'], 85: ['Averse de ninsoare', '🌨️'], 86: ['Averse de ninsoare', '❄️'],
  95: ['Furtună', '⛈️'], 96: ['Furtună cu grindină', '⛈️'], 99: ['Furtună cu grindină', '⛈️']
};
