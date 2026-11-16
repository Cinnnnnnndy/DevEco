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
            item.parentElement.setAttribute("data-selected", on ? "true" : "false");
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
