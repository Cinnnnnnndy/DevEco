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
