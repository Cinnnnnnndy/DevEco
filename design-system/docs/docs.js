(function () {
  function paint(root, stage) {
    var system = stage.getAttribute("data-system");
    var theme = stage.getAttribute("data-theme");
    root.querySelectorAll("[data-set-system]").forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-set-system") === system ? "true" : "false");
    });
    root.querySelectorAll("[data-set-theme]").forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-set-theme") === theme ? "true" : "false");
    });
  }

  function bind(root, stage) {
    root.querySelectorAll("[data-set-system]").forEach(function (button) {
      button.addEventListener("click", function () {
        stage.setAttribute("data-system", button.getAttribute("data-set-system"));
        paint(root, stage);
      });
    });
    root.querySelectorAll("[data-set-theme]").forEach(function (button) {
      button.addEventListener("click", function () {
        stage.setAttribute("data-theme", button.getAttribute("data-set-theme"));
        paint(root, stage);
      });
    });
    paint(root, stage);

    stage.addEventListener("click", function (event) {
      var chip = event.target.closest(".de-chip");
      if (chip && stage.contains(chip)) {
        var row = chip.closest(".de-chip-row");
        if (row) {
          row.querySelectorAll(".de-chip").forEach(function (item) {
            item.setAttribute("aria-pressed", item === chip ? "true" : "false");
          });
        }
      }
      var tab = event.target.closest('[role="tab"]');
      if (tab && stage.contains(tab)) {
        var list = tab.closest('[role="tablist"]');
        if (list) {
          list.querySelectorAll('[role="tab"]').forEach(function (item) {
            var on = item === tab;
            item.setAttribute("aria-selected", on ? "true" : "false");
            if (item.parentElement && item.parentElement.classList.contains("de-tab")) {
              item.parentElement.setAttribute("data-selected", on ? "true" : "false");
            }
          });
        }
      }
      var seg = event.target.closest(".de-segmented__item");
      if (seg && stage.contains(seg)) {
        var segWrap = seg.closest(".de-segmented");
        if (segWrap) {
          segWrap.querySelectorAll(".de-segmented__item").forEach(function (item) {
            item.setAttribute("aria-selected", item === seg ? "true" : "false");
          });
        }
      }
      var treeRow = event.target.closest(".de-tree__row");
      if (treeRow && stage.contains(treeRow)) {
        var tree = treeRow.closest(".de-tree");
        if (tree) {
          tree.querySelectorAll(".de-tree__row").forEach(function (item) {
            if (item === treeRow) item.setAttribute("data-selected", "true");
            else item.removeAttribute("data-selected");
          });
        }
      }
      var sw = event.target.closest(".de-switch");
      if (sw && stage.contains(sw) && !sw.disabled) {
        var checked = sw.getAttribute("aria-checked") === "true";
        sw.setAttribute("aria-checked", checked ? "false" : "true");
      }
      var check = event.target.closest(".de-check");
      if (check && stage.contains(check)) {
        var box = check.querySelector(".de-checkbox");
        if (box) {
          var isChecked = box.getAttribute("data-checked") === "true";
          box.setAttribute("data-checked", isChecked ? "false" : "true");
          box.removeAttribute("data-indeterminate");
          box.textContent = isChecked ? "" : "✓";
        }
        var radio = check.querySelector(".de-radio");
        if (radio && check.parentElement) {
          check.parentElement.querySelectorAll(".de-radio").forEach(function (r) {
            r.setAttribute("data-checked", r === radio ? "true" : "false");
          });
        }
      }
      var nav = event.target.closest(".de-nav__item");
      if (nav && stage.contains(nav)) {
        nav.parentElement.querySelectorAll(".de-nav__item").forEach(function (item) {
          if (item === nav) item.setAttribute("aria-current", "page");
          else item.removeAttribute("aria-current");
        });
      }
      var stripe = event.target.closest(".de-stripe .de-icon-button");
      if (stripe && stage.contains(stripe)) {
        stripe.parentElement.querySelectorAll(".de-icon-button").forEach(function (item) {
          if (item === stripe) item.setAttribute("aria-pressed", "true");
          else item.removeAttribute("aria-pressed");
        });
      }
    });
  }

  var demos = document.querySelectorAll("[data-demo]");
  if (demos.length) {
    demos.forEach(function (root) {
      var stage = root.querySelector("[data-live]");
      if (stage) bind(root, stage);
    });
    return;
  }

  var stage = document.getElementById("stage");
  if (!stage) return;
  bind(document, stage);
})();
