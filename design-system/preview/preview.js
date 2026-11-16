(function () {
  document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      var stage = button.closest("[data-system]");
      if (!stage) return;
      var next = stage.getAttribute("data-theme") === "dark" ? "light" : "dark";
      stage.setAttribute("data-theme", next);
      button.textContent = next === "dark" ? "切换为浅色" : "切换为深色";
    });
  });

  document.querySelectorAll(".de-chip-row").forEach(function (row) {
    if (row.closest(".compare-block")) return;
    row.addEventListener("click", function (event) {
      var chip = event.target.closest(".de-chip");
      if (!chip || !row.contains(chip)) return;
      row.querySelectorAll(".de-chip").forEach(function (item) {
        item.setAttribute("aria-pressed", item === chip ? "true" : "false");
      });
    });
  });

  document.querySelectorAll("[data-menu-button]").forEach(function (button) {
    if (button.closest(".compare-block")) return;
    var panel = document.getElementById(button.getAttribute("aria-controls"));
    button.addEventListener("click", function () {
      var open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", open ? "false" : "true");
      if (panel) panel.hidden = open;
    });
  });

  document.querySelectorAll("[data-tabs]").forEach(function (list) {
    if (list.closest(".compare-block")) return;
    list.addEventListener("click", function (event) {
      var tab = event.target.closest('[role="tab"]');
      if (!tab || !list.contains(tab)) return;
      list.querySelectorAll('[role="tab"]').forEach(function (item) {
        var selected = item === tab;
        item.setAttribute("aria-selected", selected ? "true" : "false");
        item.parentElement.setAttribute("data-selected", selected ? "true" : "false");
      });
    });
  });

  document.querySelectorAll(".de-nav").forEach(function (nav) {
    if (nav.closest(".compare-block")) return;
    nav.addEventListener("click", function (event) {
      var item = event.target.closest(".de-nav__item");
      if (!item || !nav.contains(item)) return;
      nav.querySelectorAll(".de-nav__item").forEach(function (other) {
        if (other === item) other.setAttribute("aria-current", "page");
        else other.removeAttribute("aria-current");
      });
    });
  });
})();
