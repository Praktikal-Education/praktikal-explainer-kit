Explainer.create({
  title: 'Kuidas toimub fotosüntees?',
  alt: 'Joonistus taimest: päikeselt tuleb lehele valgus, juured imavad mullast vett, leht võtab õhust süsihappegaasi. Lehes tekib suhkur ja õhku eraldub hapnik.',
  intro: 'Vajuta „Alusta“ ja vaata, kust taim oma toidu saab.',
}, k => {
  const { C } = k;
  const LEAF_L = 'M955 600 C860 470 720 430 640 470 C680 590 830 640 955 600 Z';
  const LEAF_R = 'M958 520 C1050 390 1190 350 1280 380 C1240 500 1090 560 958 520 Z';

  // 1. Taim: maapind, vars, lehed, juured
  k.beat('Taim vajab kasvamiseks toitu. Mullast ta valmis toitu ei saa, vaid valmistab selle ise.', () => {
    k.line(160, 820, 1860, 820, { w: 6, rough: .8 });
    k.curve([[955, 820], [948, 700], [955, 600], [958, 520]], { color: C.green, w: 9 });
    k.together(() => {
      k.path(LEAF_L, { fill: C.green, fillAlpha: .6 });
      k.path(LEAF_R, { fill: C.green, fillAlpha: .6 });
    });
    k.together(() => {
      k.curve([[955, 820], [860, 900], [820, 960]], { w: 5, d: .5 });
      k.curve([[955, 820], [960, 900], [950, 990]], { w: 5, d: .5 });
      k.curve([[955, 820], [1050, 900], [1090, 960]], { w: 5, d: .5 });
    });
    k.label(330, 600, 'leht', { to: [672, 492] });
  });

  // 2. Valgus
  k.beat('Rohelised lehed püüavad päikesevalgust. Valgus annab energia, mida toidu valmistamiseks vaja on.', () => {
    k.circle(360, 270, 190, { fill: C.yellow, fillAlpha: .9 });
    k.together(() => {
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + .2;
        k.line(360 + 125 * Math.cos(a), 270 + 125 * Math.sin(a), 360 + 185 * Math.cos(a), 270 + 185 * Math.sin(a), { w: 6, d: .2 });
      }
    });
    k.line(530, 400, 735, 451, { color: C.yellow, w: 22, single: true, rough: .6 });
    k.arrow(530, 400, 750, 455, { bend: 0, w: 6 });
    k.text(590, 300, 'valgus');
  });

  // 3. Vesi
  k.beat('Juured imavad mullast vett. Vesi liigub mööda vart üles lehtedesse.', () => {
    k.together(() => {
      k.arrow(680, 925, 810, 935, { color: C.cyan, bend: 0, w: 7 });
      k.arrow(1240, 925, 1110, 935, { color: C.cyan, bend: 0, w: 7 });
    });
    k.arrow(1000, 790, 1000, 620, { color: C.cyan, bend: 0, w: 7 });
    k.text(1260, 960, 'vesi', { color: C.cyan });
  });

  // 4. Süsihappegaas
  k.beat('Õhust võtab leht süsihappegaasi. See gaas siseneb lehte pisikeste avade kaudu.', () => {
    k.arrow(1500, 340, 1310, 395, { bend: 0, w: 7 });
    k.text(1400, 300, 'süsihappegaas');
  });

  // 5. Suhkur
  k.beat('Valguse energia abil teeb leht veest ja süsihappegaasist suhkrut. Suhkur ongi taime toit.', () => {
    k.polygon([[836, 535], [818, 566], [782, 566], [764, 535], [782, 504], [818, 504]], { fill: C.magenta, fillAlpha: .9, w: 4 });
    k.label(560, 740, 'suhkur', { to: [795, 580], color: C.magenta });
  });

  // 6. Hapnik
  k.beat('Samal ajal tekib hapnik. Leht laseb selle õhku, kus seda hingavad loomad ja ka taim ise.', () => {
    k.arrow(1130, 370, 1190, 200, { bend: 0, w: 7 });
    k.text(1190, 160, 'hapnik', { anchor: 'middle' });
  });

  // 7. Nimi
  k.beat('Seda protsessi nimetatakse fotosünteesiks: valguse abil tekivad veest ja süsihappegaasist suhkur ja hapnik.', () => {
    const t = k.text(1400, 640, 'fotosüntees', { size: 96 });
    k.highlight(t);
  });
});
