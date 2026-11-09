Explainer.create({
  title: 'Kuidas tekib vihm?',
  alt: 'Joonistus veeringest: päike soojendab merd, veeaur tõuseb, tekib pilv, sajab vihma ja vesi voolab jõge mööda tagasi merre.',
  intro: 'Vajuta „Alusta“ ja vaata, kuidas vesi looduses ringi käib.',
}, k => {
  const { C } = k;

  k.beat('Päike soojendab merevett.', () => {
    k.polygon([[150, 850], [1010, 850], [1010, 1050], [150, 1050]], { stroke: false, fill: C.cyan, fillAlpha: .55 });
    k.curve([[150, 850], [260, 832], [370, 852], [480, 832], [590, 852], [700, 832], [810, 852], [920, 834], [1010, 850]], { color: C.cyan, w: 7 });
    k.path('M1010 1050 L1010 850 L1290 770 L1420 850 L1640 530 L1900 1050', { fill: C.green });
    k.text(480, 985, 'meri');
    k.circle(330, 210, 190, { fill: C.yellow, fillAlpha: .9 });
    k.together(() => {
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + .2;
        k.line(330 + 125 * Math.cos(a), 210 + 125 * Math.sin(a), 330 + 185 * Math.cos(a), 210 + 185 * Math.sin(a), { w: 6, d: .2 });
      }
    });
    k.text(560, 235, 'päike');
  });

  k.beat('Soe vesi aurustub: veeaur tõuseb õhku.', () => {
    k.together(() => {
      for (const x of [240, 400, 560]) {
        k.arrowPath(`M${x} 800 C${x - 45} 730 ${x + 45} 680 ${x} 610 S${x - 45} 520 ${x} 470`, { color: C.magenta, w: 7, d: .9 });
      }
    });
    k.text(620, 660, 'aurustumine', { color: C.magenta });
  });

  k.beat('Kõrgel on õhk külmem. Veeaur jahtub ja kondenseerub tillukesteks piiskadeks. Nii tekib pilv.', () => {
    k.path('M860 350 C760 350 750 240 850 230 C850 140 990 110 1040 180 C1090 100 1250 120 1250 210 C1360 200 1380 350 1270 350 Z', { d: 1.2 });
    k.text(1060, 300, 'pilv', { anchor: 'middle' });
    k.label(1410, 140, 'kondenseerumine', { to: [1335, 250], color: C.purple });
  });

  k.beat('Piisad kasvavad raskeks ja langevad alla: sajab vihma.', () => {
    k.path('M860 350 C760 350 750 240 850 230 C850 140 990 110 1040 180 C1090 100 1250 120 1250 210 C1360 200 1380 350 1270 350 Z', { stroke: false, fill: C.grid, fillAlpha: .7 });
    k.together(() => {
      let n = 0;
      for (let y = 400; y < 700; y += 110) for (let x = 990 + (n++ % 2) * 45; x < 1330; x += 85) {
        k.line(x, y, x - 22, y + 62, { color: C.cyan, w: 7, d: .18, single: true });
      }
    });
    k.text(1380, 560, 'sademed', { color: C.cyan });
  });

  k.beat('Vesi voolab jõgede kaudu tagasi merre. Ring algab uuesti.', () => {
    k.path('M1500 730 C1420 800 1330 800 1290 860 S1150 900 1010 930', { color: C.cyan, w: 11, rough: .8 });
    k.label(1560, 950, 'jõgi', { to: [1340, 850] });
    k.arrow(1000, 960, 700, 960, { color: C.cyan, bend: 0, w: 7 });
    const t = k.text(1500, 400, 'veeringe', { size: 96 });
    k.highlight(t);
  });
});
