#!/usr/bin/env node
/**
 * 直接从本地 Pixso 矢量 AST (icon.pix) 无损提取真实 SVG 图标并绑定设计系统 CSS Token。
 * 绝不重新绘制，100% 还原 Pixso 中的 fillGeometry / strokeGeometry / transform / paints。
 */
import fs from "node:fs";
import path from "node:path";

const SCHEMA_PATH = "/Users/cindy/Desktop/01_DevEco/_tmp_ds_export/pix-extract/icon__pixso.binary";
const RAW_PATH = "/tmp/pr29-review/icon.raw";
const OUT_DIR = "/Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/icons";

function compileKiwiRaw(schemaBuf) {
  let offset = 0;
  const readByte = () => schemaBuf[offset++];
  const readVarUint = () => {
    let v = 0, s = 0, b;
    do { b = schemaBuf[offset++]; v |= (b & 127) << s; s += 7; } while ((b & 128) && s < 35);
    return v >>> 0;
  };
  const readVarInt = () => { const v = readVarUint(); return (v & 1) ? ~(v >>> 1) : (v >>> 1); };
  const readString = () => {
    const st = offset;
    while (schemaBuf[offset] !== 0) offset++;
    const s = schemaBuf.toString("utf8", st, offset);
    offset++;
    return s;
  };
  const count = readVarUint();
  const defs = [];
  for (let i = 0; i < count; i++) {
    const name = readString(), kind = readByte(), fc = readVarUint();
    const fields = [];
    for (let j = 0; j < fc; j++) {
      fields.push({ name: readString(), type: readVarInt(), isArray: readByte() !== 0, value: readVarUint() });
    }
    defs.push({ index: i, name, kind, fields });
  }
  function decode(buf, rootName = "PixsoMsg") {
    let pos = 0;
    const rByte = () => buf[pos++];
    const rVarUint = () => {
      let v = 0, s = 0, b;
      do { b = buf[pos++]; v |= (b & 127) << s; s += 7; } while ((b & 128) && s < 35);
      return v >>> 0;
    };
    const rVarInt = () => { const v = rVarUint(); return (v & 1) ? ~(v >>> 1) : (v >>> 1); };
    const rVarFloat = () => {
      const first = buf[pos++];
      if (first === 0) return 0;
      const bits = (first | (buf[pos++] << 8) | (buf[pos++] << 16) | (buf[pos++] << 24)) >>> 0;
      const moved = ((bits << 23) | (bits >>> 9)) >>> 0;
      const fbuf = Buffer.allocUnsafe(4);
      fbuf.writeUInt32LE(moved, 0);
      return fbuf.readFloatLE(0);
    };
    const rString = () => {
      const st = pos;
      while (buf[pos] !== 0) pos++;
      const s = buf.toString("utf8", st, pos);
      pos++;
      return s;
    };
    const rVarUint64 = () => {
      let lo = 0, hi = 0, s = 0, b;
      while (s < 28) { b = buf[pos++]; lo |= (b & 127) << s; if (!(b & 128)) return lo >>> 0; s += 7; }
      b = buf[pos++]; lo |= (b & 15) << 28; hi = (b & 112) >> 4;
      if (!(b & 128)) return hi * 4294967296 + (lo >>> 0);
      s = 3;
      do { b = buf[pos++]; hi |= (b & 127) << s; s += 7; } while ((b & 128) && s < 35);
      return hi * 4294967296 + (lo >>> 0);
    };
    function rType(t) {
      if (t === -1) return rByte() !== 0;
      if (t === -2) return rByte();
      if (t === -3) return rVarInt();
      if (t === -4) return rVarUint();
      if (t === -5) return rVarFloat();
      if (t === -6) return rString();
      if (t === -7 || t === -8) return rVarUint64();
      const d = defs[t];
      if (d.kind === 0) {
        const val = rVarUint();
        const ef = d.fields.find((f) => f.value === val);
        return ef ? ef.name : val;
      }
      if (d.kind === 1) {
        const obj = {};
        for (const f of d.fields) {
          if (f.isArray) {
            const len = rVarUint();
            if (f.type === -2) { obj[f.name] = buf.subarray(pos, pos + len); pos += len; }
            else { const arr = []; for (let k = 0; k < len; k++) arr.push(rType(f.type)); obj[f.name] = arr; }
          } else obj[f.name] = rType(f.type);
        }
        return obj;
      }
      const obj = {};
      while (true) {
        const fv = rVarUint();
        if (fv === 0) break;
        const f = d.fields.find((x) => x.value === fv);
        if (f.isArray) {
          const len = rVarUint();
          if (f.type === -2) { obj[f.name] = buf.subarray(pos, pos + len); pos += len; }
          else { const arr = []; for (let k = 0; k < len; k++) arr.push(rType(f.type)); obj[f.name] = arr; }
        } else obj[f.name] = rType(f.type);
      }
      return obj;
    }
    return rType(defs.findIndex((d) => d.name === rootName));
  }
  return { defs, decode };
}

const r2 = (n) => Math.round(n * 100) / 100;

function blobToPath(buf) {
  if (!buf || !buf.length) return "";
  let o = 0;
  const out = [];
  const f = () => {
    const v = buf.readFloatLE(o);
    o += 4;
    return r2(v);
  };
  while (o < buf.length) {
    const cmd = buf[o++];
    if (cmd === 0) out.push("Z");
    else if (cmd === 1 && o + 8 <= buf.length) out.push(`M${f()} ${f()}`);
    else if (cmd === 2 && o + 8 <= buf.length) out.push(`L${f()} ${f()}`);
    else if (cmd === 3 && o + 16 <= buf.length) out.push(`Q${f()} ${f()} ${f()} ${f()}`);
    else if (cmd === 4 && o + 24 <= buf.length) out.push(`C${f()} ${f()} ${f()} ${f()} ${f()} ${f()}`);
    else break;
  }
  return out.join("");
}

function mulMat(a, b) {
  return {
    m00: a.m00 * b.m00 + a.m01 * b.m10,
    m01: a.m00 * b.m01 + a.m01 * b.m11,
    m02: a.m00 * b.m02 + a.m01 * b.m12 + a.m02,
    m10: a.m10 * b.m00 + a.m11 * b.m10,
    m11: a.m10 * b.m01 + a.m11 * b.m11,
    m12: a.m10 * b.m02 + a.m11 * b.m12 + a.m12,
  };
}
const ID_MAT = { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 };

function matAttr(m) {
  if (!m) return "";
  const isId =
    Math.abs(m.m00 - 1) < 1e-3 &&
    Math.abs(m.m01) < 1e-3 &&
    Math.abs(m.m10) < 1e-3 &&
    Math.abs(m.m11 - 1) < 1e-3;
  if (isId) {
    const tx = r2(m.m02), ty = r2(m.m12);
    if (tx === 0 && ty === 0) return "";
    return ` transform="translate(${tx} ${ty})"`;
  }
  return ` transform="matrix(${r2(m.m00)} ${r2(m.m10)} ${r2(m.m01)} ${r2(m.m11)} ${r2(m.m02)} ${r2(m.m12)})"`;
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();
}

/**
 * 将 Pixso 实体色映射到设计系统 CSS Token，保留语义动态变色能力
 */
function paintToToken(paint, usedTokens) {
  if (!paint || paint.visible === false || paint.type !== "SOLID" || !paint.color) return null;
  const { r, g, b } = paint.color;
  const op = paint.opacity !== undefined ? paint.opacity : 1;
  if (op <= 0.01) return null;

  const hex = rgbToHex(r, g, b);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const sat = max - min;

  let colorVal = hex;
  // 1) 中性灰/黑/白（含 NewUI #6C707E, #CED0D6, #818594 及鸿蒙 90%/60% 灰）→ 绑定 currentColor (即 var(--icon))
  if (sat <= 24) {
    colorVal = "currentColor";
    usedTokens.add("var(--icon)");
  } else if (
    ["#3574F0", "#0A59F7", "#317AF7", "#548AF7", "#5291FF", "#467FF2", "#3574F0", "#2E55A3", "#3369D6", "#4083C9"].includes(hex)
  ) {
    colorVal = `var(--color-info, ${hex})`;
    usedTokens.add("var(--color-info)");
  } else if (
    ["#599E5E", "#57965C", "#208A3C", "#37992E", "#5BA854", "#64BB5C", "#59A869", "#499C54", "#5FAD65"].includes(hex)
  ) {
    colorVal = `var(--color-success, ${hex})`;
    usedTokens.add("var(--color-success)");
  } else if (
    ["#DB8400", "#E08C3A", "#F2C55C", "#FFAF0F", "#E56D17", "#C27D04", "#F2A629", "#F7CE00", "#EDA200"].includes(hex)
  ) {
    colorVal = `var(--color-warning, ${hex})`;
    usedTokens.add("var(--color-warning)");
  } else if (
    ["#E84026", "#D94838", "#DB3B4B", "#DB5C5C", "#CF3922", "#E55765", "#CC3645", "#F75464", "#D64966"].includes(hex)
  ) {
    colorVal = `var(--color-error, ${hex})`;
    usedTokens.add("var(--color-error)");
  }

  return { color: colorVal, opacity: op < 0.99 ? r2(op) : null };
}

function idOf(g) {
  return g ? `${g.sessionID}:${g.localID}` : "";
}

console.log("Decoding Pixso icon.pix AST...");
const schema = fs.readFileSync(SCHEMA_PATH);
const raw = fs.readFileSync(RAW_PATH);
const { decode } = compileKiwiRaw(schema);
const msg = decode(raw);

const byId = new Map();
const byParent = new Map();
for (const n of msg.pixsoNodes) {
  const id = idOf(n.guid);
  byId.set(id, n);
  const pid = idOf(n.parentIndex?.guid);
  if (!byParent.has(pid)) byParent.set(pid, []);
  byParent.get(pid).push(n);
}

// 按 parentIndex.position 排序子节点，保证绘制层叠顺序与 Pixso 一致
for (const list of byParent.values()) {
  list.sort((a, b) => String(a.parentIndex?.position || "").localeCompare(String(b.parentIndex?.position || "")));
}

function renderNodeToSvgElements(node, parentMat, elements, usedTokens, depth = 0) {
  if (!node || node.visible === false || depth > 16) return;
  const nodeOpacity = node.opacity !== undefined ? node.opacity : 1;
  if (nodeOpacity <= 0.01) return;

  const localMat = node.transform || ID_MAT;
  const curMat = depth === 0 ? ID_MAT : mulMat(parentMat, localMat);
  const tAttr = matAttr(curMat);
  const opAttr = nodeOpacity < 0.99 ? ` opacity="${r2(nodeOpacity)}"` : "";

  const isLeafDrawable =
    node.type === "VECTOR" ||
    node.type === "BOOLEAN_OPERATION" ||
    node.type === "RECTANGLE" ||
    node.type === "ELLIPSE" ||
    node.type === "REGULAR_POLYGON";

  if (isLeafDrawable) {
    const fills = (node.fillPaints || []).filter((p) => p.visible !== false && p.type === "SOLID");
    const strokes = (node.strokePaints || []).filter((p) => p.visible !== false && p.type === "SOLID");
    const fillPaint = fills.length ? paintToToken(fills[fills.length - 1], usedTokens) : null;
    const strokePaint = strokes.length ? paintToToken(strokes[strokes.length - 1], usedTokens) : null;

    let drewGeom = false;
    // 1) 优先用 Pixso 预计算好的 fillGeometry（最精准，含布尔运算结果）
    if (fillPaint && node.fillGeometry && node.fillGeometry.length) {
      for (const g of node.fillGeometry) {
        const blob = msg.blobs[g.blobIndex]?.bytes;
        const d = blobToPath(blob);
        if (!d) continue;
        const fr = g.windingRule === "ODD" ? ' fill-rule="evenodd"' : "";
        const fo = fillPaint.opacity ? ` fill-opacity="${fillPaint.opacity}"` : "";
        elements.push(`<path d="${d}" fill="${fillPaint.color}"${fr}${fo}${tAttr}${opAttr}/>`);
        drewGeom = true;
      }
    }
    // 2) 优先用 Pixso 预计算好的 strokeGeometry（已轮廓化，100% 还原描边端点/斜接/圆角）
    if (strokePaint && node.strokeGeometry && node.strokeGeometry.length) {
      for (const g of node.strokeGeometry) {
        const blob = msg.blobs[g.blobIndex]?.bytes;
        const d = blobToPath(blob);
        if (!d) continue;
        const fr = g.windingRule === "ODD" ? ' fill-rule="evenodd"' : "";
        const fo = strokePaint.opacity ? ` fill-opacity="${strokePaint.opacity}"` : "";
        elements.push(`<path d="${d}" fill="${strokePaint.color}"${fr}${fo}${tAttr}${opAttr}/>`);
        drewGeom = true;
      }
    }
    // 3) 兜底：若 RECTANGLE / ELLIPSE 没有预计算 geometry，直接用尺寸还原
    if (!drewGeom && node.size && (fillPaint || strokePaint)) {
      const w = r2(node.size.x || 0), h = r2(node.size.y || 0);
      if (w > 0 && h > 0) {
        const fAttr = fillPaint ? ` fill="${fillPaint.color}"` : ' fill="none"';
        const sAttr = strokePaint
          ? ` stroke="${strokePaint.color}" stroke-width="${r2(node.strokeWeight || 1)}"`
          : "";
        if (node.type === "ELLIPSE") {
          elements.push(`<ellipse cx="${r2(w / 2)}" cy="${r2(h / 2)}" rx="${r2(w / 2)}" ry="${r2(h / 2)}"${fAttr}${sAttr}${tAttr}${opAttr}/>`);
        } else if (node.type === "RECTANGLE") {
          const rx = node.cornerRadius ? ` rx="${r2(node.cornerRadius)}"` : "";
          elements.push(`<rect width="${w}" height="${h}"${rx}${fAttr}${sAttr}${tAttr}${opAttr}/>`);
        }
      }
    }
    // BOOLEAN_OPERATION 已经把子路径合并在自身 fillGeometry/strokeGeometry 中，不再重复递归子节点
    if (node.type === "BOOLEAN_OPERATION") return;
  }

  // INSTANCE 指向主 SYMBOL
  if (node.type === "INSTANCE" && node.symbolData?.symbolID) {
    const sym = byId.get(idOf(node.symbolData.symbolID));
    if (sym) {
      const symKids = byParent.get(idOf(sym.guid)) || [];
      for (const k of symKids) {
        renderNodeToSvgElements(k, curMat, elements, usedTokens, depth + 1);
      }
      return;
    }
  }

  const kids = byParent.get(idOf(node.guid)) || [];
  for (const k of kids) {
    renderNodeToSvgElements(k, curMat, elements, usedTokens, depth + 1);
  }
}

function extractSymbolSvg(sym) {
  const w = Math.round(sym.size?.x || 16);
  const h = Math.round(sym.size?.y || 16);
  if (w < 8 || h < 8 || w > 48 || h > 48) return null;
  const elements = [];
  const usedTokens = new Set();
  renderNodeToSvgElements(sym, ID_MAT, elements, usedTokens, 0);
  if (!elements.length) return null;
  const inner = elements.join("");
  return {
    w,
    h,
    viewBox: `0 0 ${w} ${h}`,
    inner,
    tokens: Array.from(usedTokens),
  };
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

// 1) 提取鸿蒙 NEXT 图标库 (Page 1320:20463)
const harmonyIcons = [];
const harmonySeen = new Set();

function collectHarmony(rootId) {
  function walk(id) {
    const kids = byParent.get(id) || [];
    for (const k of kids) {
      const kidId = idOf(k.guid);
      const grand = byParent.get(kidId) || [];
      const name = (k.name || "").trim();
      // 跳过纯表单控件（Switch / radio / checkbox）
      if (/^(Switch|24px\/check\/|属性|深色模式=)/i.test(name)) continue;

      if (k.type === "FRAME" && grand.length > 0 && grand.every((g) => g.type === "SYMBOL")) {
        // 优先选深色模式=off (Light) 或第一个标准尺寸变体
        const chosen =
          grand.find((g) => /深色模式=off|Theme\s*=\s*Light/i.test(g.name || "")) || grand[0];
        const svg = extractSymbolSvg(chosen);
        if (svg) {
          const cleanName = name.replace(/^24px\//, "").trim();
          if (!harmonySeen.has(cleanName)) {
            harmonySeen.add(cleanName);
            const cat = cleanName.includes("/") ? cleanName.split("/")[0].trim() : "通用图标";
            const shortName = cleanName.includes("/") ? cleanName.split("/").slice(1).join("/").trim() : cleanName;
            harmonyIcons.push({
              id: `hm-${slugify(cleanName) || harmonyIcons.length}`,
              name: shortName,
              fullName: name,
              system: "harmony",
              category: cat,
              size: `${svg.w}×${svg.h}`,
              viewBox: svg.viewBox,
              tokens: svg.tokens,
              inner: svg.inner,
            });
          }
        }
      } else if (k.type === "SYMBOL") {
        const svg = extractSymbolSvg(k);
        if (svg) {
          const cleanName = name.replace(/^24px\//, "").trim();
          if (cleanName && !harmonySeen.has(cleanName)) {
            harmonySeen.add(cleanName);
            const cat = cleanName.includes("/") ? cleanName.split("/")[0].trim() : "通用图标";
            const shortName = cleanName.includes("/") ? cleanName.split("/").slice(1).join("/").trim() : cleanName;
            harmonyIcons.push({
              id: `hm-${slugify(cleanName) || harmonyIcons.length}`,
              name: shortName,
              fullName: name,
              system: "harmony",
              category: cat,
              size: `${svg.w}×${svg.h}`,
              viewBox: svg.viewBox,
              tokens: svg.tokens,
              inner: svg.inner,
            });
          }
        }
      } else {
        walk(kidId);
      }
    }
  }
  walk(rootId);
}

// 2) 提取 PC/Mac NewUI 核心 IDE 图标库 (Page 955:20814)
const NEWUI_KEEP_CATS = new Set([
  "general",
  "toolwindow",
  "run",
  "vcs",
  "breakpoints",
  "fileTypes",
  "nodes",
  "General / Actions",
  "General / Tool Windows",
  "Files & Nodes / File Types",
]);
const newuiIcons = [];
const newuiSeen = new Set();

function collectNewUi(rootId) {
  function walk(id, anc) {
    const kids = byParent.get(id) || [];
    for (const k of kids) {
      const kidId = idOf(k.guid);
      const grand = byParent.get(kidId) || [];
      const name = (k.name || "").trim();
      if (k.type === "FRAME" && grand.length > 0 && grand.every((g) => g.type === "SYMBOL")) {
        const cat = name.includes("/") ? name.split("/")[0].trim() : anc.join(" / ");
        if (!NEWUI_KEEP_CATS.has(cat)) continue;
        const chosen =
          grand.find((g) => /Theme\s*=\s*Light/i.test(g.name || "")) || grand[0];
        const svg = extractSymbolSvg(chosen);
        if (svg) {
          const shortName = name.includes("/") ? name.split("/").slice(1).join("/").trim() : name;
          const dedupKey = `${cat}/${shortName}`;
          if (shortName && !newuiSeen.has(dedupKey)) {
            newuiSeen.add(dedupKey);
            newuiIcons.push({
              id: `nu-${slugify(cat + "-" + shortName) || newuiIcons.length}`,
              name: shortName,
              fullName: name,
              system: "pc-mac",
              category: cat,
              size: `${svg.w}×${svg.h}`,
              viewBox: svg.viewBox,
              tokens: svg.tokens,
              inner: svg.inner,
            });
          }
        }
      } else {
        walk(kidId, name ? [...anc, name] : anc);
      }
    }
  }
  walk(rootId, []);
}

collectHarmony("1320:20463");
collectNewUi("955:20814");

// 保证 ID 全局唯一
const idCounts = new Map();
const allIcons = [...harmonyIcons, ...newuiIcons].map((ic) => {
  const base = ic.id;
  const n = idCounts.get(base) || 0;
  idCounts.set(base, n + 1);
  const finalId = n === 0 ? base : `${base}-${n + 1}`;
  return { ...ic, id: finalId };
});

fs.mkdirSync(OUT_DIR, { recursive: true });

// 写入 sprite.svg
const spriteSymbols = allIcons
  .map((ic) => `  <symbol id="${ic.id}" viewBox="${ic.viewBox}">${ic.inner}</symbol>`)
  .join("\n");
const spriteSvg = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${spriteSymbols}\n</svg>\n`;
fs.writeFileSync(path.join(OUT_DIR, "sprite.svg"), spriteSvg, "utf8");

// 写入 manifest.json（包含元数据 + Token + 独立可复制 SVG）
const manifest = {
  source: "icon.pix (Pixso Vector AST · zero redraw)",
  total: allIcons.length,
  harmonyCount: harmonyIcons.length,
  newuiCount: newuiIcons.length,
  icons: allIcons.map((ic) => ({
    id: ic.id,
    name: ic.name,
    fullName: ic.fullName,
    system: ic.system,
    category: ic.category,
    size: ic.size,
    viewBox: ic.viewBox,
    tokens: ic.tokens,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ic.viewBox}" width="${ic.viewBox.split(" ")[2]}" height="${ic.viewBox.split(" ")[3]}" fill="none">${ic.inner}</svg>`,
  })),
};
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

console.log(`Extracted ${allIcons.length} icons directly from icon.pix:`);
console.log(`  - HarmonyOS NEXT (NEXT图标): ${harmonyIcons.length}`);
console.log(`  - PC/Mac NewUI (Core IDE): ${newuiIcons.length}`);
console.log(`  - sprite.svg size: ${(Buffer.byteLength(spriteSvg) / 1024).toFixed(1)} KB`);
console.log(`  - manifest.json size: ${(fs.statSync(path.join(OUT_DIR, "manifest.json")).size / 1024).toFixed(1)} KB`);
