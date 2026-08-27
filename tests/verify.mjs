import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "..");
const required = [
  "index.html", "version-a.html", "version-b.html", "version-c.html", "_headers",
  "css/base.css", "css/theme-a.css", "css/theme-b.css", "css/theme-c.css",
  "js/data.js", "js/app.js",
  "assets/a-orbit-launch.png", "assets/b-editorial-founder.jpg",
  "assets/c-action-leap.png", "assets/c-workbench-result.png"
];

for (const file of required) {
  const target = path.join(site, file);
  assert.ok(fs.existsSync(target), `缺少文件：${file}`);
  assert.ok(fs.statSync(target).size > 0, `空文件：${file}`);
}

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(site, "js/data.js"), "utf8"), sandbox);
const data = sandbox.window.Business48Data;

assert.equal(data.steps.length, 7, "步骤必须恰好 7 个");
assert.equal(data.businessModels.length, 27, "商业模式必须恰好 27 个");
assert.equal(new Set(data.businessModels.map((item) => item.id)).size, 27, "商业模式 ID 必须唯一");
assert.equal(data.ideaChecks.length, 8, "检查问题必须恰好 8 个");
assert.equal(Object.keys(data.variants).length, 3, "视觉版本必须恰好 3 个");
assert.equal(new Set(Object.values(data.variants).map((item) => item.storageKey)).size, 3, "三个本地存储键必须独立");
assert.equal(data.customerChannels.length, 25, "获客渠道应与本地书摘的 25 项一致");
assert.equal(data.variants.a.name, "两天开启个人事业", "A 应使用正式产品名");
assert.equal(data.variants.a.heroTitle, "两天\n开启个人事业", "A 首页标题必须保持两行");

for (const id of ["a", "b", "c"]) {
  const html = fs.readFileSync(path.join(site, `version-${id}.html`), "utf8");
  assert.match(html, new RegExp(`data-variant="${id}"`), `版本 ${id} 缺少 body 标记`);
  assert.match(html, /js\/data\.js/, `版本 ${id} 未加载共享数据`);
  assert.match(html, /js\/app\.js/, `版本 ${id} 未加载共享交互`);
  assert.match(html, new RegExp(`css/theme-${id}\\.css`), `版本 ${id} 未加载自己的主题`);
}

const app = fs.readFileSync(path.join(site, "js/app.js"), "utf8");
const aHtml = fs.readFileSync(path.join(site, "version-a.html"), "utf8");
const indexHtml = fs.readFileSync(path.join(site, "index.html"), "utf8");
assert.match(app, /window\.localStorage/, "缺少本地保存");
assert.match(app, /copyActionCard/, "缺少行动卡复制");
assert.match(app, /confirm-reset/, "缺少重置确认");
assert.doesNotMatch(app, /\bfetch\s*\(|XMLHttpRequest|WebSocket/, "不应上传或请求远程业务数据");
assert.match(aHtml, /<title>两天开启个人事业<\/title>/, "A 页面标题必须使用正式产品名");
assert.match(aHtml, /js\/data\.js\?v=formal-20260825/, "A 必须加载正式版数据资源");
assert.match(aHtml, /js\/app\.js\?v=formal-20260825/, "A 必须加载正式版交互资源");
assert.match(indexHtml, /url=version-a\.html/, "根入口必须直接打开 A 正式版");
assert.match(app, /const formal = variantId === "a"/, "A 必须有正式版首页分支");

for (const image of required.filter((file) => file.startsWith("assets/"))) {
  assert.ok(fs.statSync(path.join(site, image)).size > 20_000, `图片疑似未正确复制：${image}`);
}

console.log(JSON.stringify({
  ok: true,
  files: required.length + 1,
  steps: data.steps.length,
  businessModels: data.businessModels.length,
  ideaChecks: data.ideaChecks.length,
  variants: Object.keys(data.variants).length,
  customerChannels: data.customerChannels.length
}, null, 2));
