// Draws project charts with Chart.js from <script id="chart-data" type="application/json">.
// Each <canvas data-chart="key"> gets a chart; each <tbody data-table="key"> gets the same data
// as a table (shown in "Show data", and the fallback when JS or the CDN is unavailable).
// Colours come from the site's CSS tokens and update when the theme changes.
(function () {
  var el = document.getElementById("chart-data");
  if (!el) return;
  var data = JSON.parse(el.textContent);
  var eur = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  Object.keys(data).forEach(function (key) {
    var body = document.querySelector('[data-table="' + key + '"]');
    if (!body) return;
    data[key].labels.forEach(function (label, i) {
      var tr = document.createElement("tr");
      tr.className = "border-b border-rule";
      tr.innerHTML = '<td class="py-1"></td><td class="py-1 text-right"></td>';
      tr.children[0].textContent = label;
      tr.children[1].textContent = eur.format(data[key].values[i]);
      body.appendChild(tr);
    });
  });

  if (typeof Chart === "undefined") return;

  function token(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  var charts = [];

  function draw() {
    charts.forEach(function (c) { c.destroy(); });
    charts = [];
    var ink = token("--ink"), muted = token("--muted"), rule = token("--rule"), accent = token("--accent");
    var soft = token("--chart-base");
    Chart.defaults.font.family = token("--ff-sans") || "sans-serif";
    Chart.defaults.color = muted;

    document.querySelectorAll("canvas[data-chart]").forEach(function (canvas) {
      var d = data[canvas.dataset.chart];
      if (!d) return;
      var colours = d.values.map(function (_, i) { return i === d.highlight ? accent : soft; });
      var valueAxis = { grid: { color: rule }, border: { display: false },
        ticks: { callback: function (v) { return eur.format(v); }, maxTicksLimit: 6 } };
      var catAxis = { grid: { display: false }, border: { color: rule }, ticks: { color: ink } };
      charts.push(new Chart(canvas, {
        type: "bar",
        data: { labels: d.labels, datasets: [{ label: d.label, data: d.values, backgroundColor: colours,
          hoverBackgroundColor: accent, borderRadius: 2, maxBarThickness: 36 }] },
        options: {
          indexAxis: d.horizontal ? "y" : "x",
          maintainAspectRatio: false,
          layout: { padding: { top: 10, right: 8, left: 4 } },
          animation: matchMedia("(prefers-reduced-motion: reduce)").matches ? false : { duration: 400 },
          plugins: { legend: { display: false },
            tooltip: { callbacks: { label: function (ctx) { return eur.format(ctx.parsed[d.horizontal ? "x" : "y"]); } } } },
          scales: d.horizontal ? { x: valueAxis, y: catAxis } : { x: catAxis, y: valueAxis }
        }
      }));
    });
  }

  // measure tick labels with the real web font, not the fallback
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(draw);
  document.addEventListener("themechange", draw);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw);
})();
