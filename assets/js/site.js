// Small enhancements only; every page works without this file.
(function () {
  var root = document.documentElement;
  var KEY = "theme";

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode */ } }
  function current() {
    return root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }

  var s = stored();
  if (s === "light" || s === "dark") root.dataset.theme = s;

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      var label = function () {
        var dark = current() === "dark";
        btn.setAttribute("aria-pressed", String(dark));
        btn.querySelector("[data-label]").textContent = dark ? "Light mode" : "Dark mode";
      };
      label();
      btn.hidden = false;
      btn.addEventListener("click", function () {
        root.dataset.theme = current() === "dark" ? "light" : "dark";
        save(root.dataset.theme);
        label();
        document.dispatchEvent(new Event("themechange"));
      });
    }

    document.querySelectorAll("[data-print]").forEach(function (b) {
      b.hidden = false;
      b.addEventListener("click", function () { window.print(); });
    });

    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  });
})();
