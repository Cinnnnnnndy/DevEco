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

  document.addEventListener("click", function (event) {
    if (event.target.closest(".compare-block")) return;

    var chip = event.target.closest(".de-chip");
    if (chip) {
      var row = chip.closest(".de-chip-row");
      if (row) {
        row.querySelectorAll(".de-chip").forEach(function (item) {
          item.setAttribute("aria-pressed", item === chip ? "true" : "false");
        });
      }
    }

    var tab = event.target.closest('[role="tab"]');
    if (tab) {
      var list = tab.closest('[role="tablist"]');
      if (list) {
        list.querySelectorAll('[role="tab"]').forEach(function (item) {
          var selected = item === tab;
          item.setAttribute("aria-selected", selected ? "true" : "false");
          if (item.parentElement && item.parentElement.classList.contains("de-tab")) {
            item.parentElement.setAttribute("data-selected", selected ? "true" : "false");
          }
        });
      }
    }

    var seg = event.target.closest(".de-segmented__item");
    if (seg) {
      var segWrap = seg.closest(".de-segmented");
      if (segWrap) {
        segWrap.querySelectorAll(".de-segmented__item").forEach(function (item) {
          item.setAttribute("aria-selected", item === seg ? "true" : "false");
        });
      }
    }

    var treeRow = event.target.closest(".de-tree__row");
    if (treeRow) {
      var tree = treeRow.closest(".de-tree");
      if (tree) {
        tree.querySelectorAll(".de-tree__row").forEach(function (item) {
          if (item === treeRow) item.setAttribute("data-selected", "true");
          else item.removeAttribute("data-selected");
        });
      }
    }

    var sw = event.target.closest(".de-switch");
    if (sw && !sw.disabled) {
      var checked = sw.getAttribute("aria-checked") === "true";
      sw.setAttribute("aria-checked", checked ? "false" : "true");
    }

    var nav = event.target.closest(".de-nav__item");
    if (nav && nav.parentElement) {
      nav.parentElement.querySelectorAll(".de-nav__item").forEach(function (other) {
        if (other === nav) other.setAttribute("aria-current", "page");
        else other.removeAttribute("aria-current");
      });
    }
  });
})();
