// Die gemeinsame Küchenliste für Abstimmung, Tagebuch-Gestaltung und Ideen.
// Jede Küche hat eine eigene Kennung (z. B. „griechenland", „baskenland").
// Ideen: eigene Kurzbeschreibungen, keine kopierten Rezepte. Der Link führt zur Rezeptsuche.
// Ziel: 80 Küchen („In 80 Küchen um die Welt"). Zuerst Griechenland, der Rest folgt.

export const KUECHEN = {
  griechenland: {
    name: 'Griechenland',
    orig: 'Elláda',
    flagge: 'gr',
    farben: ['#24527a', '#f4efe3', '#8fb3cf'],
    motiv: 'Olivenzweig',
    musik: 'Griechische Musik',
    ideen: {
      vor: [
        { id: 'gr-tzatziki', name: 'Tzatziki mit warmem Pita', orig: 'Tzatzíki', auch: ['Zaziki'], text: 'Joghurt, Gurke, Knoblauch, Olivenöl – kalt und frisch, dazu Brot vom Grill.', kids: 'Eine Schale ohne Knoblauch abfüllen, bevor er dazukommt. Pita in Streifen als Dip-Stangen.' },
        { id: 'gr-horiatiki', name: 'Bauernsalat', orig: 'Choriátiki', auch: ['Griechischer Salat', 'Horiatiki'], text: 'Tomate, Gurke, rote Zwiebel, Oliven und ein ganzes Stück Feta obendrauf.', kids: 'Gurke, Tomate und Feta in Würfeln getrennt auf einen Teller – ohne Zwiebel und Oliven.' },
        { id: 'gr-spanakopita', name: 'Spinat-Feta-Pastete', orig: 'Spanakópita', text: 'Knuspriger Filoteig mit Spinat, Feta und Dill, warm oder lauwarm.', kids: 'Aus Teig- und Füllungsresten kleine Dreiecke falten – Kinder essen die gern aus der Hand.' },
        { id: 'gr-saganaki', name: 'Gebratener Käse', orig: 'Saganáki', text: 'Kefalotyri oder Halloumi in der Pfanne goldbraun, mit Zitrone beträufelt.', kids: 'Ohne Zitrone und in Streifen geschnitten – wie Käse-Pommes.' },
        { id: 'gr-dolmadakia', name: 'Gefüllte Weinblätter', orig: 'Dolmadákia', auch: ['Dolmades', 'Dolmadakia'], text: 'Weinblätter mit Reis, Kräutern und Zitrone, kalt serviert.', kids: 'Den Kräuterreis der Füllung als kleine Schale „Zitronenreis“ pur anbieten.' },
        { id: 'gr-melitzanosalata', name: 'Auberginen-Creme', orig: 'Melitzanosaláta', text: 'Im Ofen geröstete Aubergine, mit Knoblauch, Zitrone und Olivenöl zerdrückt – rauchig.', kids: 'Mit viel Joghurt mild machen und mit Gurkensticks dippen.' },
        { id: 'gr-tirokafteri', name: 'Scharfe Feta-Creme', orig: 'Tirokafterí', text: 'Feta mit gerösteter Paprika und etwas Chili zu einer cremigen Paste gerührt.', kids: 'Vor dem Chili abzweigen – Feta mit Paprika ist dann ein milder roter Dip.' },
        { id: 'gr-taramosalata', name: 'Fischrogen-Creme', orig: 'Taramosaláta', text: 'Zarter rosa Aufstrich aus Fischrogen, Brot, Zitrone und Öl.', kids: 'Für Kinder meist zu fischig: lieber Brot mit Olivenöl und Salz daneben.' },
        { id: 'gr-fava', name: 'Gelberbsen-Püree', orig: 'Fáva', text: 'Samtiges Püree aus gelben Erbsen, obendrauf rote Zwiebel, Kapern und Olivenöl.', kids: 'Pur ohne Zwiebel und Kapern – schmeckt wie mildes Kartoffelpüree.' },
        { id: 'gr-keftedakia', name: 'Kleine Fleischbällchen', orig: 'Keftedákia', auch: ['Keftedes', 'Keftedakia'], text: 'Gebratene Hackbällchen mit Minze und Zwiebel, dazu Zitrone und Tzatziki.', kids: 'Ohne Minze formen – Fleischbällchen gehen bei Kindern immer.' },
        { id: 'gr-kolokithokeftedes', name: 'Zucchini-Puffer', orig: 'Kolokithokeftédes', text: 'Geraspelte Zucchini mit Feta, Dill und Minze, knusprig in der Pfanne gebraten.', kids: 'Ohne Minze und klein gebraten – mit Joghurt zum Dippen.' },
        { id: 'gr-gigantes', name: 'Riesenbohnen aus dem Ofen', orig: 'Gígantes', text: 'Große weiße Bohnen in Tomatensoße mit Dill, langsam im Ofen gebacken.', kids: 'Ein paar Bohnen vor dem Dill abnehmen, mit Brot zum Tunken.' },
        { id: 'gr-kalamarakia', name: 'Frittierte Tintenfischringe', orig: 'Kalamarákia', auch: ['Kalamari', 'Calamari'], text: 'Kalamari in Mehl gewendet, kurz frittiert, mit Zitrone.', kids: 'Ohne Zitrone, mit Ketchup oder Joghurt – oft der Hit.' },
        { id: 'gr-pantzarosalata', name: 'Rote-Bete-Salat mit Joghurt', orig: 'Pantzarosaláta', text: 'Gekochte Rote Bete mit Joghurt, Knoblauch und Walnüssen – leuchtend pink.', kids: 'Die rosa Farbe begeistert Kinder; Nüsse und Knoblauch weglassen.' },
        { id: 'gr-tiropitakia', name: 'Käse-Täschchen', orig: 'Tiropitákia', auch: ['Tiropita'], text: 'Kleine Filoteig-Dreiecke mit Feta und Ei gefüllt, goldbraun gebacken.', kids: 'Genau so – Käse im Teig mögen fast alle Kinder.' },
        { id: 'gr-bouyiourdi', name: 'Feta aus dem Ofen', orig: 'Bouyiourdí', text: 'Feta mit Tomate, Paprika, Oregano und etwas Chili im Tontopf überbacken.', kids: 'Eine Form ohne Chili – mit Brot zum Tunken.' },
      ],
      haupt: [
        { id: 'gr-moussaka', name: 'Moussaka', orig: 'Mousakás', auch: ['Mousaka', 'Musaka'], text: 'Aubergine, Hackfleisch mit Zimt und Rotwein, darüber Béchamel – im Ofen überbacken.', kids: 'Einen Teil Hackfleisch abnehmen, bevor Wein und Zimt dazukommen. Mit Nudeln und etwas Béchamel als kleine Auflaufform.' },
        { id: 'gr-souvlaki', name: 'Souvlaki mit Pita', orig: 'Souvláki', auch: ['Suvlaki'], text: 'Marinierte Fleischspieße vom Grill, dazu Pita, Tomate, Zwiebel und Tzatziki.', kids: 'Ein paar Spieße nur mit Salz und etwas Öl. Im Pita mit Gurke und Joghurt – zum Selbstrollen.' },
        { id: 'gr-pastitsio', name: 'Nudelauflauf', orig: 'Pastítsio', text: 'Dicke Röhrennudeln, Hackfleisch und eine hohe Béchamel-Schicht – griechische Lasagne.', kids: 'Ist schon kinderfreundlich. Für Kleine ohne Zimt und Muskat eine eigene kleine Form.' },
        { id: 'gr-gemista', name: 'Gefülltes Gemüse', orig: 'Jemistá', auch: ['Gemista', 'Gefüllte Paprika', 'Gefüllte Tomaten'], text: 'Tomaten und Paprika mit Reis und Kräutern gefüllt, mit Kartoffeln im Ofen geschmort.', kids: 'Die Ofenkartoffeln aus der Form plus etwas Füllungsreis – das Gemüse darf liegen bleiben.' },
        { id: 'gr-kleftiko', name: 'Lamm aus dem Ofen', orig: 'Kléftiko', text: 'Lamm mit Knoblauch, Zitrone und Oregano lange in Pergament gegart, sehr zart.', kids: 'Zartes Fleisch klein zupfen, mit den Kartoffeln aus dem Päckchen und Joghurt servieren.' },
        { id: 'gr-stifado', name: 'Rindfleisch-Schmortopf', orig: 'Stifádo', text: 'Rind mit vielen kleinen Zwiebeln, Tomate, Zimt und Rotwein langsam geschmort.', kids: 'Vor dem Wein ein paar Stücke Fleisch mit Tomate abnehmen und mit Reis oder Kritharaki (Reisnudeln) servieren.' },
        { id: 'gr-gyros', name: 'Gyros aus der Pfanne', orig: 'Gýros', text: 'Dünne Schweinefleisch-Streifen mit Zwiebel und Oregano kräftig angebraten, mit Pita, Tomate und Tzatziki.', kids: 'Fleisch, Pita und Gurke getrennt – zum Selberwickeln.' },
        { id: 'gr-giouvetsi', name: 'Rind mit Reisnudeln im Tontopf', orig: 'Giouvétsi', auch: ['Juvetsi'], text: 'Rindfleisch in Tomatensoße geschmort, dann Kritharaki dazu und im Ofen fertig gegart, mit Käse.', kids: 'Ist mild und kinderfreundlich – nur ohne Zimt.' },
        { id: 'gr-kotopoulo-lemonato', name: 'Zitronenhähnchen mit Ofenkartoffeln', orig: 'Kotópoulo lemonáto', text: 'Hähnchenteile mit Zitrone, Knoblauch und Oregano auf Kartoffeln im Ofen gebraten.', kids: 'Hähnchenkeule und Kartoffeln – geht immer, ein Stück ohne viel Zitrone.' },
        { id: 'gr-bifteki', name: 'Gefüllte Hacksteaks', orig: 'Biftéki', text: 'Saftige Hacksteaks mit Feta in der Mitte, vom Grill oder aus der Pfanne.', kids: 'Ohne Feta-Füllung als Mini-Frikadellen mit Pommes oder Reis.' },
        { id: 'gr-soutzoukakia', name: 'Hackröllchen in Tomatensoße', orig: 'Soutzoukákia', text: 'Längliche Hackröllchen mit Kreuzkümmel, in Tomatensoße geschmort, dazu Reis.', kids: 'Röllchen ohne Kreuzkümmel, Tomatensoße und Reis – wie Spaghetti-Bällchen.' },
        { id: 'gr-psari-plaki', name: 'Fisch aus dem Ofen mit Tomate', orig: 'Psári plakí', text: 'Weißer Fisch auf Tomaten, Zwiebeln und Petersilie im Ofen gebacken.', kids: 'Ein grätenfreies Stück ohne Zwiebeln, mit Reis.' },
        { id: 'gr-garides-saganaki', name: 'Garnelen in Tomate und Feta', orig: 'Garídes saganáki', text: 'Garnelen in würziger Tomatensoße mit Ouzo, überbacken mit Feta.', kids: 'Tomatensoße vor Ouzo und Chili abnehmen und mit Nudeln servieren.' },
        { id: 'gr-kokkinisto', name: 'Rindfleisch in Tomatensoße mit Nudeln', orig: 'Kokkinistó', text: 'Rindfleisch in Tomatensoße mit Nelke und Zimt geschmort, dazu dicke Spaghetti.', kids: 'Ohne Gewürze abzweigen – Nudeln mit Fleischsoße mag jedes Kind.' },
        { id: 'gr-arni-fricassee', name: 'Lamm-Frikassee mit Ei-Zitrone', orig: 'Arní frikassé', text: 'Lamm mit Salat und Dill geschmort, zum Schluss mit einer Ei-Zitronen-Soße gebunden.', kids: 'Ein paar Fleischstücke vor dem Salat abnehmen, mit Reis.' },
        { id: 'gr-briam', name: 'Ofengemüse mit Kartoffeln', orig: 'Briám', text: 'Zucchini, Aubergine, Kartoffel und Tomate in viel Olivenöl im Ofen geschmort – ein Gemüse-Hauptgericht.', kids: 'Die Kartoffeln sind der Kinderanteil, dazu Feta.' },
        { id: 'gr-kotosoupa', name: 'Hühnersuppe mit Ei-Zitrone', orig: 'Kotósoupa avgolémono', auch: ['Avgolemono'], text: 'Hühnerbrühe mit Reis, gebunden mit Ei und Zitrone – cremig und frisch.', kids: 'Etwas Brühe mit Reis und Huhn vor Ei-Zitrone abnehmen.' },
        { id: 'gr-spetsofai', name: 'Bratwurst mit Paprika', orig: 'Spetsofái', text: 'Würzige Bratwurst mit Paprika und Tomate geschmort – deftig aus dem Pilion-Gebirge.', kids: 'Milde Würstchen nehmen und vor dem Chili abzweigen.' },
      ],
      nach: [
        { id: 'gr-joghurt-honig', name: 'Joghurt mit Honig und Walnüssen', orig: 'Giaoúrti me méli', text: 'Dicker griechischer Joghurt, Thymianhonig, geröstete Walnüsse – einfach und gut.', kids: 'Mit Obst statt Nüssen (bei kleinen Kindern Nüsse weglassen).' },
        { id: 'gr-baklava', name: 'Baklava', orig: 'Baklavás', text: 'Filoteig, Nüsse und Honigsirup in vielen Schichten – süß und knusprig.', kids: 'Sehr süß – kleine Stücke reichen. Für die Kleinsten ohne ganze Nüsse.' },
        { id: 'gr-galaktoboureko', name: 'Grießcreme im Filoteig', orig: 'Galaktoboúreko', text: 'Vanille-Grießcreme zwischen Filoteig, mit Zitronensirup getränkt.', kids: 'Etwas Grießcreme vor dem Einfüllen abnehmen und als Grießbrei mit Zimt servieren.' },
        { id: 'gr-loukoumades', name: 'Honigbällchen', orig: 'Loukoumádes', text: 'Kleine frittierte Hefebällchen mit Honig und Zimt, frisch und warm.', kids: 'Mit Puderzucker statt Honig – das lieben Kinder.' },
        { id: 'gr-portokalopita', name: 'Orangenkuchen', orig: 'Portokalópita', text: 'Saftiger Kuchen aus Filoteig und Joghurt, mit Orangensirup getränkt.', kids: 'Ein Stück vor dem Sirup herausnehmen – dann ist es weniger süß und klebt nicht.' },
        { id: 'gr-rizogalo', name: 'Milchreis mit Zimt', orig: 'Rizógalo', text: 'Cremiger Milchreis mit Zitronenschale, kalt mit Zimt bestreut.', kids: 'Perfekt für Kinder – gern warm.' },
        { id: 'gr-bougatsa', name: 'Cremetasche mit Puderzucker', orig: 'Bougátsa', text: 'Knuspriger Filoteig mit Vanillecreme, warm mit Puderzucker und Zimt.', kids: 'Genau so – das ist Kinderessen.' },
        { id: 'gr-karidopita', name: 'Walnusskuchen mit Sirup', orig: 'Karydópita', text: 'Saftiger Gewürzkuchen mit Walnüssen und Zimt, mit Sirup getränkt.', kids: 'Kleine Kinder: ein Stück Rührkuchen ohne Nüsse daneben.' },
        { id: 'gr-yaourtopita', name: 'Joghurtkuchen mit Zitrone', orig: 'Giaourtópita', text: 'Lockerer Kuchen mit Joghurt und Zitronenschale – schnell und leicht.', kids: 'Ohne Sirup als einfacher Kuchen.' },
        { id: 'gr-kourabiedes', name: 'Butterplätzchen mit Puderzucker', orig: 'Kourabiédes', text: 'Mürbe Mandelplätzchen dick mit Puderzucker – eigentlich zu Weihnachten, passt also im Winter.', kids: 'Ohne Mandeln backen – Kinder helfen beim Wälzen im Zucker.' },
        { id: 'gr-melomakarona', name: 'Honigplätzchen', orig: 'Melomakárona', text: 'Weiche Plätzchen mit Orange und Zimt, in Honigsirup getaucht, mit Walnuss bestreut.', kids: 'Ohne Walnuss obendrauf – süß und weich.' },
        { id: 'gr-glyko-koutaliou', name: 'Eingekochte Früchte zu Eis', orig: 'Glykó koutalioú', text: 'Löffelsüßes aus Kirschen oder Feigen über Vanilleeis oder Joghurt.', kids: 'Vanilleeis mit etwas Kirschsoße – fertig.' },
        { id: 'gr-halvas', name: 'Grieß-Halva', orig: 'Chalvás simigdalénios', auch: ['Halva', 'Halvas'], text: 'Gerösteter Grieß in Sirup mit Zimt und Rosinen, in Form gestürzt.', kids: 'Ohne Rosinen und Nüsse, in Förmchen gestürzt.' },
        { id: 'gr-pagoto-kaimaki', name: 'Mastix-Eis', orig: 'Pagotó kaïmáki', text: 'Cremiges Eis mit Mastix – leicht harzig, typisch griechisch.', kids: 'Normales Vanilleeis mit Honig dazu.' },
      ],
    },
    kinderTipps: [
      'Feta, Gurke, Tomate und Pita einzeln anbieten – daraus bauen sich Kinder ihren eigenen Teller.',
      'Fleisch vor dem Würzen mit Wein, Zimt oder Chili abzweigen und nur mit Salz und Öl braten.',
      'Kritharaki (Reisnudeln) oder Reis gehen als Beilage immer.',
      'Tzatziki ohne Knoblauch ist ein beliebter Dip für Gemüsesticks.',
    ],
  },
};

export const GANG = { vor: 'Vorspeise', haupt: 'Hauptspeise', nach: 'Nachspeise' };

export const kueche = (id) => KUECHEN[id] || null;
export const findIdee = (id) => {
  for (const k of Object.values(KUECHEN)) for (const list of Object.values(k.ideen || {})) {
    const hit = list.find((i) => i.id === id);
    if (hit) return hit;
  }
  return null;
};
export const suchLink = (name) => `https://www.chefkoch.de/rs/s0/${encodeURIComponent(name)}/Rezepte.html`;
