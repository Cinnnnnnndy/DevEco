#!/usr/bin/env node
/**
 * DevEco Design System — Automated Fidelity Gate (verify-fidelity.js)
 * 供任何 AI 模型（Claude / Codex / Cursor / Gemini）在生成或修改页面后执行一键还原度自检。
 *
 * 用法：
 *   node design-system/scripts/verify-fidelity.js [path/to/page.html ...]
 *   （不传参数时默认校验 design-system/ 下全部 HTML 与 CSS）
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dsRoot = path.resolve(__dirname, "..");

function walk(dir, ext) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(full, ext));
    else if (entry.name.endsWith(ext)) out.push(full);
  }
  return out;
}

// Collect all defined CSS variables from tokens/
const definedVars = new Set();
for (const tf of ["tokens/foundation.css", "tokens/semantic.css", "tokens/components.css", "tokens/ai.css", "chrome.css"]) {
  const p = path.join(dsRoot, tf);
  if (!fs.existsSync(p)) continue;
  const txt = fs.readFileSync(p, "utf8");
  let m;
  const re = /(--[a-zA-Z0-9_-]+)\s*:/g;
  while ((m = re.exec(txt)) !== null) definedVars.add(m[1]);
}

// Collect all valid Pixso icon IDs from icons/manifest.json
const validIconIds = new Set();
const manifestPath = path.join(dsRoot, "icons/manifest.json");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const ic of manifest.icons || []) validIconIds.add(ic.id);
}

const args = process.argv.slice(2);
const targetHtmlFiles = args.length
  ? args.map((a) => path.resolve(process.cwd(), a))
  : walk(dsRoot, ".html");

let errors = [];
let warnings = [];

for (const file of targetHtmlFiles) {
  if (!fs.existsSync(file)) {
    errors.push(`[MISSING FILE] ${file}`);
    continue;
  }
  const rel = path.relative(process.cwd(), file);
  const txt = fs.readFileSync(file, "utf8");

  // 1. Check tokens/index.css import (for pages using .de-* classes)
  if (txt.includes('class="de-') || txt.includes("data-system=")) {
    if (!txt.includes("tokens/index.css")) {
      errors.push(`[${rel}] 使用了 .de-* 组件或 data-system，但未引入 tokens/index.css`);
    }
    if (!/data-system=["'](harmony|pc-mac)["']/.test(txt)) {
      errors.push(`[${rel}] 缺少显式的 data-system="harmony" 或 data-system="pc-mac" 声明`);
    }
    if (!/data-theme=["'](dark|light|light-contrast)["']/.test(txt)) {
      errors.push(`[${rel}] 缺少显式的 data-theme="dark|light|light-contrast" 声明`);
    }
  }

  // 2. Check forbidden fonts (Inter)
  const styleBlocks = txt.match(/<style[\s\S]*?<\/style>/gi) || [];
  for (const sb of styleBlocks) {
    if (/\bInter\b/.test(sb)) {
      errors.push(`[${rel}] <style> 中包含禁止使用的 Inter 字体（必须使用 --font-ui / HarmonyOS Sans SC）`);
    }
  }

  // 3. Check undefined CSS variables (without fallback)
  const useRe = /var\(\s*(--[a-zA-Z0-9_-]+)(?:\s*,[^)]+)?\)/g;
  let m;
  const localDefs = new Set();
  const defRe = /(--[a-zA-Z0-9_-]+)\s*:/g;
  while ((m = defRe.exec(txt)) !== null) localDefs.add(m[1]);

  while ((m = useRe.exec(txt)) !== null) {
    if (!m[0].includes(",") && !definedVars.has(m[1]) && !localDefs.has(m[1])) {
      // Ignore vars from deveco-intui-kit/src/tokens.css (--ui-*, --Gray*, --Blue*, --fs*, --lh*, --ed-*)
      if (!/^--(ui|Gray|Blue|Green|Yellow|Red|Purple|Orange|Teal|hdr|ed|term|fs|lh|font-code)/.test(m[1])) {
        errors.push(`[${rel}] 引用了未定义的 CSS 变量: ${m[1]}`);
      }
    }
  }

  // 4. Check broken relative links and assets
  const linkRe = /(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g;
  while ((m = linkRe.exec(txt)) !== null) {
    const target = m[1];
    if (/^(https?:|mailto:|data:)/.test(target)) continue;
    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) {
      errors.push(`[${rel}] 存在断链或缺失静态资源: ${target}`);
    }
  }

  // 5. Check inline hardcoded colors on .de-* elements
  const inlineDeRe = /<[^>]+class="[^"]*\bde-[a-z0-9_-]+[^"]*"[^>]*style="([^"]+)"[^>]*>/g;
  while ((m = inlineDeRe.exec(txt)) !== null) {
    const st = m[1];
    if (/#[0-9a-fA-F]{3,8}\b/.test(st) && !/color:\s*#5ba854/i.test(st)) {
      warnings.push(`[${rel}] .de-* 组件存在内联硬编码 HEX 颜色 (${st})，建议改用语义 Token`);
    }
  }

  // 6. Check hand-drawn inline SVGs (must use Pixso sprite.svg#<id> instead of drawing paths manually)
  const noPre = txt.replace(/<pre[\s\S]*?<\/pre>/g, "");
  const handSvgs = (noPre.match(/<svg[\s\S]*?<\/svg>/g) || []).filter(
    (s) => !s.includes("sprite.svg#") && !s.includes("#i-") && !s.includes("<defs>")
  );
  if (handSvgs.length) {
    errors.push(`[${rel}] 发现 ${handSvgs.length} 处手绘 <svg>，必须改为引用 ../icons/sprite.svg#<pixso-id>`);
  }

  // 7. Check emoji / unicode pseudo-icons outside <pre>
  const noSourceName = noPre.replace(/👉🔥【2\.0】基础范式🔥👈/g, "");
  const badEmojis = noSourceName.match(/[🔨▶🐞💻📱⊞⑂✦⚠⚡🔍📁⚙🔖⌕■]/g) || [];
  if (badEmojis.length) {
    errors.push(`[${rel}] 发现 Emoji/Unicode 伪图标 [${[...new Set(badEmojis)].join(" ")}]，必须改用 Pixso sprite.svg 图标`);
  }

  // 8. Check system toggle button order (always harmony on left, pc-mac on right)
  const sysSeq = [...noPre.matchAll(/data-set-system="(harmony|pc-mac)"/g)].map((x) => x[1]);
  for (let i = 0; i + 1 < sysSeq.length; i += 2) {
    if (sysSeq[i] === "pc-mac" && sysSeq[i + 1] === "harmony") {
      errors.push(`[${rel}] 系统切换按钮顺序颠倒（PC/Mac 在前、鸿蒙在后），必须统一为左鸿蒙、右 PC/Mac`);
      break;
    }
  }

  // 9. Validate every sprite.svg#<id> reference exists in icons/manifest.json (prevent hallucinated icon IDs)
  if (validIconIds.size > 0) {
    const useIconRe = /sprite\.svg#([^"'<\s]+)/g;
    while ((m = useIconRe.exec(noPre)) !== null) {
      if (!validIconIds.has(m[1])) {
        errors.push(`[${rel}] 引用了不存在的 Pixso 图标 ID: sprite.svg#${m[1]}（请从 icons/manifest.json 选取）`);
      }
    }
  }

  // 10. Check <style> blocks for bare host selectors that bleed into [data-system], and inline-grid missing line-height
  const inlineCssBlocks = [...txt.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((x) => x[1]);
  for (const css of inlineCssBlocks) {
    const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, "");
    // Bare footer/header/hr rules without scoping (can bleed into .de-notification__actions / .de-dialog__footer)
    const bareBleed = cleanCss.match(/(?:^|[}\n])\s*(footer|header|hr)\s*\{[^}]*(border|margin|padding)/gi);
    if (bareBleed) {
      errors.push(`[${rel}] <style> 存在未限定作用域的裸标签规则 (${bareBleed[0].trim().slice(0, 40)}...)，会穿透污染 [data-system] 组件`);
    }
    // inline-grid without line-height causes downward glyph overflow in small badges/buttons
    for (const blk of cleanCss.split("}")) {
      if (/display\s*:\s*inline-grid\b/.test(blk) && !/line-height\s*:/.test(blk)) {
        const sel = (blk.split("{")[0] || "").trim().split("\n").pop();
        errors.push(`[${rel}] 样式 ${sel} 使用了 inline-grid 但未设置 line-height: 1，小尺寸图标/徽标会下溢错位`);
      }
    }
  }

  // 11. Check hardcoded AARRGGBB 8-digit hex trap in inline styles or <style>
  const aarrggbbRe = /#(E5000000|99000000|66000000|33000000|E5FFFFFF|99FFFFFF|66FFFFFF)\b/i;
  if (aarrggbbRe.test(noPre)) {
    errors.push(`[${rel}] 检测到鸿蒙 AARRGGBB 8位色值直接用于 CSS，请改用语义 Token 或标准 rgba()`);
  }
}

// 12. Also audit tokens/components.css for inline-grid missing line-height & .de-svg-icon breaking color inheritance
const compCssPath = path.join(dsRoot, "tokens/components.css");
if (fs.existsSync(compCssPath)) {
  const compCss = fs.readFileSync(compCssPath, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const blk of compCss.split("}")) {
    if (/display\s*:\s*inline-grid\b/.test(blk) && !/line-height\s*:/.test(blk)) {
      const sel = (blk.split("{")[0] || "").trim().split("\n").pop();
      if (sel !== ".de-radio") {
        errors.push(`[tokens/components.css] ${sel} 使用了 inline-grid 但未设置 line-height: 1`);
      }
    }
    if (/\.de-svg-icon\s*\{/.test(blk) && /color\s*:\s*var\(--icon\)/.test(blk)) {
      errors.push(`[tokens/components.css] .de-svg-icon 禁止写死 color: var(--icon)，必须使用 color: inherit 以保留反色按钮继承`);
    }
  }
}

console.log(`=== DevEco 设计系统还原度门禁 (Checked ${targetHtmlFiles.length} files) ===`);
if (warnings.length) {
  console.log(`⚠️ 警告 (${warnings.length}):`);
  warnings.forEach((w) => console.log("  " + w));
}
if (errors.length) {
  console.error(`❌ 失败 (${errors.length}):`);
  errors.forEach((e) => console.error("  " + e));
  process.exit(1);
} else {
  console.log(`✅ 全部通过：0 断链、0 缺失 Token、系统与主题声明完整。`);
}
