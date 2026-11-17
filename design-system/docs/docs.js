(function () {
  var CODE_SAMPLES = {
    "EntryAbility.ets": [
      ['1', '<span class="cm">/* Copyright (c) 2026 Huawei Device Co., Ltd. */</span>'],
      ['2', '<span class="kw">import</span> UIAbility <span class="kw">from</span> <span class="str">\'@ohos.app.ability.UIAbility\'</span>;'],
      ['3', '<span class="kw">export default class</span> <span class="fn">EntryAbility</span> <span class="kw">extends</span> UIAbility &#123;', true],
      ['4', '  <span class="kw">private static</span> <span class="ct">TAG</span>: string = <span class="str">\'EntryAbility\'</span>;'],
      ['5', '  <span class="kw">async</span> <span class="fn">onCreate</span>(want: Want, launchParam: AbilityConstant.LaunchParam) &#123;'],
      ['6', '    GlobalContext.<span class="fn">getContext</span>().<span class="fn">setObject</span>(<span class="str">\'want\'</span>, want);'],
      ['7', '    Logger.<span class="fn">info</span>(<span class="str">\'RdbHelper createTable dayInfo success\'</span>);'],
      ['8', '  &#125;'],
      ['9', '&#125;']
    ],
    "BadgeCardComponent.cpp": [
      ['1', '<span class="cm">// Native C++ NAPI Component · BadgeCardComponent.cpp</span>'],
      ['2', '<span class="mt">#include</span> <span class="str">"napi/native_api.h"</span>'],
      ['3', '<span class="mt">#include</span> <span class="str">"BadgeCardComponent.h"</span>'],
      ['4', '<span class="kw">static</span> napi_value <span class="fn">RenderBadgeCard</span>(napi_env env, napi_callback_info info) &#123;', true],
      ['5', '  size_t argc = <span class="num">2</span>;'],
      ['6', '  napi_value args[<span class="num">2</span>] = &#123;<span class="kw">nullptr</span>&#125;;'],
      ['7', '  <span class="fn">napi_get_cb_info</span>(env, info, &amp;argc, args, <span class="kw">nullptr</span>, <span class="kw">nullptr</span>);'],
      ['8', '  <span class="kw">return</span> args[<span class="num">0</span>];'],
      ['9', '&#125;']
    ],
    "module.json5": [
      ['1', '&#123;'],
      ['2', '  <span class="ct">"module"</span>: &#123;'],
      ['3', '    <span class="ct">"name"</span>: <span class="str">"entry"</span>,', true],
      ['4', '    <span class="ct">"type"</span>: <span class="str">"entry"</span>,'],
      ['5', '    <span class="ct">"srcEntry"</span>: <span class="str">"./ets/entryability/EntryAbility.ets"</span>,'],
      ['6', '    <span class="ct">"deviceTypes"</span>: [<span class="str">"phone"</span>, <span class="str">"tablet"</span>, <span class="str">"2in1"</span>],'],
      ['7', '    <span class="ct">"deliveryWithInstall"</span>: <span class="kw">true</span>'],
      ['8', '  &#125;'],
      ['9', '&#125;']
    ]
  };

  function updateEditorForFile(windowEl, rawText) {
    if (!windowEl) return;
    var fileKey = Object.keys(CODE_SAMPLES).find(function (k) {
      return rawText.indexOf(k) !== -1;
    });
    if (!fileKey) return;
    var editor = windowEl.querySelector(".de-code-editor");
    if (editor) {
      var alertCard = editor.querySelector(".de-code-alert-card");
      var alertHtml = alertCard ? alertCard.outerHTML : "";
      var linesHtml = CODE_SAMPLES[fileKey].map(function (line) {
        var cur = line[2] ? ' data-current="true"' : '';
        return '<div class="de-code-line"' + cur + '><span class="de-code-gutter">' + line[0] + '</span><span class="de-code-content">' + line[1] + '</span></div>';
      }).join("");
      editor.innerHTML = alertHtml + linesHtml;
    }
    var crumbStrong = windowEl.querySelector(".de-crumb strong");
    if (crumbStrong) crumbStrong.textContent = fileKey;
  }

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
          updateEditorForFile(tab.closest(".de-window"), tab.textContent || "");
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
          updateEditorForFile(treeRow.closest(".de-window"), treeRow.textContent || "");
        }
      }
      var sw = event.target.closest(".de-switch");
      if (sw && stage.contains(sw) && !sw.disabled) {
        if (sw.tagName === "INPUT") {
          sw.setAttribute("aria-checked", sw.checked ? "true" : "false");
        } else {
          var checked = sw.getAttribute("aria-checked") === "true";
          sw.setAttribute("aria-checked", checked ? "false" : "true");
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
