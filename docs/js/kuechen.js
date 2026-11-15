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
    ideen: {
      vor: [
        { id: 'gr-tzatziki', name: 'Tzatziki mit warmem Pita', orig: 'Tzatzíki', text: 'Joghurt, Gurke, Knoblauch, Olivenöl – kalt und frisch, dazu Brot vom Grill.', kids: 'Eine Schale ohne Knoblauch abfüllen, bevor er dazukommt. Pita in Streifen als Dip-Stangen.' },
        { id: 'gr-horiatiki', name: 'Bauernsalat', orig: 'Choriátiki', text: 'Tomate, Gurke, rote Zwiebel, Oliven und ein ganzes Stück Feta obendrauf.', kids: 'Gurke, Tomate und Feta in Würfeln getrennt auf einen Teller – ohne Zwiebel und Oliven.' },
        { id: 'gr-spanakopita', name: 'Spinat-Feta-Pastete', orig: 'Spanakópita', text: 'Knuspriger Filoteig mit Spinat, Feta und Dill, warm oder lauwarm.', kids: 'Aus Teig- und Füllungsresten kleine Dreiecke falten – Kinder essen die gern aus der Hand.' },
        { id: 'gr-saganaki', name: 'Gebratener Käse', orig: 'Saganáki', text: 'Kefalotyri oder Halloumi in der Pfanne goldbraun, mit Zitrone beträufelt.', kids: 'Ohne Zitrone und in Streifen geschnitten – wie Käse-Pommes.' },
        { id: 'gr-dolmadakia', name: 'Gefüllte Weinblätter', orig: 'Dolmadákia', text: 'Weinblätter mit Reis, Kräutern und Zitrone, kalt serviert.', kids: 'Den Kräuterreis der Füllung als kleine Schale „Zitronenreis" pur anbieten.' },
      ],
      haupt: [
        { id: 'gr-moussaka', name: 'Moussaka', orig: 'Mousakás', text: 'Aubergine, Hackfleisch mit Zimt und Rotwein, darüber Béchamel – im Ofen überbacken.', kids: 'Einen Teil Hackfleisch abnehmen, bevor Wein und Zimt dazukommen. Mit Nudeln und etwas Béchamel als kleine Auflaufform.' },
        { id: 'gr-souvlaki', name: 'Souvlaki mit Pita', orig: 'Souvláki', text: 'Marinierte Fleischspieße vom Grill, dazu Pita, Tomate, Zwiebel und Tzatziki.', kids: 'Ein paar Spieße nur mit Salz und etwas Öl. Im Pita mit Gurke und Joghurt – zum Selbstrollen.' },
        { id: 'gr-pastitsio', name: 'Nudelauflauf', orig: 'Pastítsio', text: 'Dicke Röhrennudeln, Hackfleisch und eine hohe Béchamel-Schicht – griechische Lasagne.', kids: 'Ist schon kinderfreundlich. Für Kleine ohne Zimt und Muskat eine eigene kleine Form.' },
        { id: 'gr-gemista', name: 'Gefülltes Gemüse', orig: 'Jemistá', text: 'Tomaten und Paprika mit Reis und Kräutern gefüllt, mit Kartoffeln im Ofen geschmort.', kids: 'Die Ofenkartoffeln aus der Form plus etwas Füllungsreis – das Gemüse darf liegen bleiben.' },
        { id: 'gr-kleftiko', name: 'Lamm aus dem Ofen', orig: 'Kléftiko', text: 'Lamm mit Knoblauch, Zitrone und Oregano lange in Pergament gegart, sehr zart.', kids: 'Zartes Fleisch klein zupfen, mit den Kartoffeln aus dem Päckchen und Joghurt servieren.' },
        { id: 'gr-stifado', name: 'Rindfleisch-Schmortopf', orig: 'Stifádo', text: 'Rind mit vielen kleinen Zwiebeln, Tomate, Zimt und Rotwein langsam geschmort.', kids: 'Vor dem Wein ein paar Stücke Fleisch mit Tomate abnehmen und mit Reis oder Kritharaki (Reisnudeln) servieren.' },
      ],
      nach: [
        { id: 'gr-joghurt-honig', name: 'Joghurt mit Honig und Walnüssen', orig: 'Giaoúrti me méli', text: 'Dicker griechischer Joghurt, Thymianhonig, geröstete Walnüsse – einfach und gut.', kids: 'Mit Obst statt Nüssen (bei kleinen Kindern Nüsse weglassen).' },
        { id: 'gr-baklava', name: 'Baklava', orig: 'Baklavás', text: 'Filoteig, Nüsse und Honigsirup in vielen Schichten – süß und knusprig.', kids: 'Sehr süß – kleine Stücke reichen. Für die Kleinsten ohne ganze Nüsse.' },
        { id: 'gr-galaktoboureko', name: 'Grießcreme im Filoteig', orig: 'Galaktoboúreko', text: 'Vanille-Grießcreme zwischen Filoteig, mit Zitronensirup getränkt.', kids: 'Etwas Grießcreme vor dem Einfüllen abnehmen und als Grießbrei mit Zimt servieren.' },
        { id: 'gr-loukoumades', name: 'Honigbällchen', orig: 'Loukoumádes', text: 'Kleine frittierte Hefebällchen mit Honig und Zimt, frisch und warm.', kids: 'Mit Puderzucker statt Honig – das lieben Kinder.' },
        { id: 'gr-portokalopita', name: 'Orangenkuchen', orig: 'Portokalópita', text: 'Saftiger Kuchen aus Filoteig und Joghurt, mit Orangensirup getränkt.', kids: 'Ein Stück vor dem Sirup herausnehmen – dann ist es weniger süß und klebt nicht.' },
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
