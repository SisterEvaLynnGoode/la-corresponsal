// Paste into the console on a worksheet page to check it fits Letter when printed.
// Simulates the @media print geometry: page 11in tall, .sheet padding .45in/.5in,
// so usable content height is 11in - 0.9in = 10.1in = ~970px at 96dpi.
(() => {
  const LIMIT = 970;
  const sheets = [...document.querySelectorAll('.sheet')];
  const saved = sheets.map(s => s.style.cssText);
  sheets.forEach(s => {
    s.style.width = '8.5in';
    s.style.minHeight = '0';
    s.style.padding = '.45in .5in';
    s.style.boxShadow = 'none';
  });
  const out = sheets.map((s, i) => {
    const inner = s.getBoundingClientRect().height - (0.9 * 96); // minus vertical padding
    return {
      page: i + 1,
      contentPx: Math.round(inner),
      limitPx: LIMIT,
      overBy: Math.round(inner - LIMIT),
      fits: inner <= LIMIT
    };
  });
  sheets.forEach((s, i) => s.style.cssText = saved[i]);
  return out;
})()
