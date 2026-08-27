(function () {
  "use strict";

  const data = window.Business48Data;
  const root = document.getElementById("app");
  const variantId = document.body.dataset.variant;
  const variant = data && data.variants ? data.variants[variantId] : null;

  if (!data || !root || !variant) {
    if (root) root.textContent = "页面数据没有正确加载，请刷新后重试。";
    return;
  }

  let modelSearch = "";
  let notice = "";
  let copyStatus = "";
  let resetOpen = false;
  let storageAvailable = true;

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function makeTasks(items, prefix) {
    return items.map((text, index) => ({ id: `${prefix}-${index + 1}`, text, done: false, custom: false }));
  }

  function initialState() {
    const now = new Date().toISOString();
    return {
      schemaVersion: data.schemaVersion,
      variant: variantId,
      currentStep: 0,
      startedAt: now,
      updatedAt: now,
      interests: [{ id: uid("interest"), topic: "", reason: "" }],
      problems: [{ id: uid("problem"), problem: "", audience: "", wouldPay: "unsure" }],
      selectedModelIds: [],
      idea: "",
      ideaChecks: Array(data.ideaChecks.length).fill(null),
      day1Tasks: makeTasks(data.day1Tasks, "day1"),
      day2Tasks: makeTasks(data.day2Tasks, "day2"),
      brand: {
        name: "", tagline: "", sellingPoint: "", audience: "", whyBuy: "", noNos: "",
        product: "", promotion: "", place: "", price: ""
      },
      customers: {
        selectedChannels: [], firstAction: "", deadline: "", responseSignal: ""
      }
    };
  }

  function normalize(raw) {
    const base = initialState();
    if (!raw || typeof raw !== "object") return base;
    return {
      ...base,
      ...raw,
      schemaVersion: data.schemaVersion,
      variant: variantId,
      currentStep: Number.isInteger(raw.currentStep) && raw.currentStep >= 0 && raw.currentStep <= 8 ? raw.currentStep : 0,
      interests: Array.isArray(raw.interests) ? raw.interests : base.interests,
      problems: Array.isArray(raw.problems) ? raw.problems : base.problems,
      selectedModelIds: Array.isArray(raw.selectedModelIds) ? raw.selectedModelIds.filter((id) => data.businessModels.some((item) => item.id === id)) : [],
      ideaChecks: Array.isArray(raw.ideaChecks) && raw.ideaChecks.length === data.ideaChecks.length ? raw.ideaChecks : base.ideaChecks,
      day1Tasks: Array.isArray(raw.day1Tasks) && raw.day1Tasks.length ? raw.day1Tasks : base.day1Tasks,
      day2Tasks: Array.isArray(raw.day2Tasks) && raw.day2Tasks.length ? raw.day2Tasks : base.day2Tasks,
      brand: { ...base.brand, ...(raw.brand || {}) },
      customers: { ...base.customers, ...(raw.customers || {}) }
    };
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(variant.storageKey);
      return raw ? normalize(JSON.parse(raw)) : initialState();
    } catch (error) {
      storageAvailable = false;
      return initialState();
    }
  }

  let state = loadState();

  function saveState() {
    state.updatedAt = new Date().toISOString();
    try {
      window.localStorage.setItem(variant.storageKey, JSON.stringify(state));
      storageAvailable = true;
      return true;
    } catch (error) {
      storageAvailable = false;
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function heroTitleMarkup() {
    return escapeHtml(variant.heroTitle).replaceAll("\n", "<br>");
  }

  function setByPath(target, path, value) {
    const keys = path.split(".");
    let cursor = target;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) cursor[key] = value;
      else cursor = cursor[key];
    });
  }

  function isFilled(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function stepComplete(step) {
    if (step === 1) return state.interests.some((item) => isFilled(item.topic) && isFilled(item.reason));
    if (step === 2) return state.problems.some((item) => isFilled(item.problem) && isFilled(item.audience));
    if (step === 3) return state.selectedModelIds.length > 0;
    if (step === 4) return isFilled(state.idea) && state.ideaChecks.every(Boolean);
    if (step === 5) return state.day1Tasks.length > 0 && state.day2Tasks.length > 0;
    if (step === 6) return isFilled(state.brand.name) && isFilled(state.brand.sellingPoint) && isFilled(state.brand.audience);
    if (step === 7) return state.customers.selectedChannels.length > 0 && isFilled(state.customers.firstAction);
    return false;
  }

  function completedCount() {
    return data.steps.filter((step) => stepComplete(step.id)).length;
  }

  function progressMarkup() {
    const completed = completedCount();
    return `
      <aside class="step-rail" aria-label="七步进度">
        <div class="progress-summary">
          <span>${completed} / 7 已整理</span>
          <div class="progress-track" aria-hidden="true"><span style="width:${(completed / 7) * 100}%"></span></div>
        </div>
        <nav class="step-nav">
          ${data.steps.map((step) => {
            const active = state.currentStep === step.id;
            const complete = stepComplete(step.id);
            return `<button class="step-link${active ? " is-active" : ""}${complete ? " is-complete" : ""}" type="button" data-action="go-step" data-step="${step.id}" ${active ? 'aria-current="step"' : ""}>
              <span class="step-number">${String(step.id).padStart(2, "0")}</span>
              <span class="step-name">${step.short}</span>
              <span class="step-state" aria-label="${complete ? "已完成" : "未完成"}">${complete ? "✓" : "·"}</span>
            </button>`;
          }).join("")}
          <button class="step-link step-link-result${state.currentStep === 8 ? " is-active" : ""}" type="button" data-action="go-step" data-step="8" ${state.currentStep === 8 ? 'aria-current="step"' : ""}>
            <span class="step-number">08</span><span class="step-name">行动卡</span><span class="step-state">→</span>
          </button>
        </nav>
      </aside>`;
  }

  function field(id, label, path, value, options = {}) {
    const tag = options.multiline ? "textarea" : "input";
    const hint = options.hint ? `<small id="${id}-hint">${options.hint}</small>` : "";
    const described = options.hint ? ` aria-describedby="${id}-hint"` : "";
    if (tag === "textarea") {
      return `<label class="field field-wide" for="${id}"><span>${label}</span><textarea id="${id}" data-field="${path}" placeholder="${escapeHtml(options.placeholder || "")}"${described}>${escapeHtml(value)}</textarea>${hint}</label>`;
    }
    return `<label class="field${options.wide ? " field-wide" : ""}" for="${id}"><span>${label}</span><input id="${id}" data-field="${path}" type="${options.type || "text"}" value="${escapeHtml(value)}" placeholder="${escapeHtml(options.placeholder || "")}"${described}>${hint}</label>`;
  }

  function renderInterests() {
    const items = state.interests.map((item, index) => `
      <article class="repeat-card">
        <div class="repeat-head"><span>兴趣 ${index + 1}</span><button class="text-button" type="button" data-action="remove-interest" data-index="${index}">删除</button></div>
        <div class="form-grid">
          ${field(`interest-topic-${index}`, "我感兴趣的事情", `interests.${index}.topic`, item.topic, { placeholder: "例如：帮普通人把复杂事情说清楚" })}
          ${field(`interest-reason-${index}`, "我为什么关心它", `interests.${index}.reason`, item.reason, { placeholder: "写一个真实原因，不需要漂亮" })}
        </div>
      </article>`).join("");
    return `${items || '<p class="empty-note">还没有兴趣项。先加一项，不判断它能不能赚钱。</p>'}<button class="secondary-button" type="button" data-action="add-interest">＋ 添加一项兴趣</button>`;
  }

  function renderProblems() {
    const items = state.problems.map((item, index) => `
      <article class="repeat-card">
        <div class="repeat-head"><span>问题 ${index + 1}</span><button class="text-button" type="button" data-action="remove-problem" data-index="${index}">删除</button></div>
        <div class="form-grid">
          ${field(`problem-${index}`, "具体问题", `problems.${index}.problem`, item.problem, { wide: true, placeholder: "不要写‘效率低’，写清楚在什么时候、哪里卡住" })}
          ${field(`audience-${index}`, "谁也可能遇到它", `problems.${index}.audience`, item.audience, { placeholder: "例如：刚开始做内容的职场人" })}
          <fieldset class="choice-field">
            <legend>我愿意花钱解决吗</legend>
            <div class="segmented">
              ${[["yes", "愿意"], ["unsure", "不确定"], ["no", "不愿意"]].map(([value, label]) => `<button type="button" data-action="set-pay" data-index="${index}" data-value="${value}" class="segment${item.wouldPay === value ? " is-selected" : ""}" aria-pressed="${item.wouldPay === value}">${label}</button>`).join("")}
            </div>
          </fieldset>
        </div>
      </article>`).join("");
    return `${items || '<p class="empty-note">还没有问题项。回想一次你真的被卡住的场景。</p>'}<button class="secondary-button" type="button" data-action="add-problem">＋ 添加一个问题</button>`;
  }

  function renderModels() {
    const term = modelSearch.trim().toLowerCase();
    const models = data.businessModels.filter((item) => !term || `${item.name}${item.prompt}${item.group}`.toLowerCase().includes(term));
    return `
      <label class="field search-field" for="model-search"><span>搜索 27 种商业模式</span><input id="model-search" data-model-search="true" type="search" value="${escapeHtml(modelSearch)}" placeholder="输入：内容、服务、订阅、产品……"></label>
      <p class="selection-summary">已选择 <strong>${state.selectedModelIds.length}</strong> 种。数量不代表质量，选你真的愿意测试的。</p>
      <div class="model-grid">
        ${models.map((item) => {
          const selected = state.selectedModelIds.includes(item.id);
          return `<button type="button" class="model-card${selected ? " is-selected" : ""}" data-action="toggle-model" data-id="${item.id}" aria-pressed="${selected}">
            <span class="model-group">${item.group}</span><strong>${item.name}</strong><small>${item.prompt}</small><span class="model-mark">${selected ? "已选择" : "选择"}</span>
          </button>`;
        }).join("") || '<p class="empty-note">没有匹配的模式。换一个更短的关键词。</p>'}
      </div>`;
  }

  function renderChecks() {
    return `
      ${field("idea", "你准备测试的想法", "idea", state.idea, { multiline: true, placeholder: "用一句话写清：我为谁解决什么问题，先提供什么。", hint: "这不是最终商业计划，只是接下来要验证的假设。" })}
      <div class="check-list">
        ${data.ideaChecks.map((question, index) => {
          const current = state.ideaChecks[index];
          return `<fieldset class="check-row"><legend><span>${String(index + 1).padStart(2, "0")}</span>${question}</legend><div class="segmented">
            ${[["yes", "是"], ["unsure", "不确定"], ["no", "否"]].map(([value, label]) => `<button type="button" class="segment${current === value ? " is-selected" : ""}" data-action="set-check" data-index="${index}" data-value="${value}" aria-pressed="${current === value}">${label}</button>`).join("")}
          </div></fieldset>`;
        }).join("")}
      </div>
      <div class="evidence-legend"><span><i class="dot dot-yes"></i>是：已有证据</span><span><i class="dot dot-unsure"></i>不确定：下一步验证</span><span><i class="dot dot-no"></i>否：需要调整</span></div>`;
  }

  function renderTaskColumn(day, title, subtitle, tasks) {
    return `<section class="task-column">
      <div class="task-title"><span>${day}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>
      <div class="task-list">
        ${tasks.map((task, index) => `<label class="task-item${task.done ? " is-done" : ""}"><input type="checkbox" data-task-day="${day.toLowerCase()}" data-task-index="${index}" ${task.done ? "checked" : ""}><span>${escapeHtml(task.text)}</span>${task.custom ? `<button type="button" class="task-remove" data-action="remove-task" data-day="${day.toLowerCase()}" data-index="${index}" aria-label="删除任务">×</button>` : ""}</label>`).join("")}
      </div>
      <div class="inline-add"><input type="text" data-new-task="${day.toLowerCase()}" placeholder="添加自己的任务"><button type="button" data-action="add-task" data-day="${day.toLowerCase()}">添加</button></div>
    </section>`;
  }

  function renderBrand() {
    return `<div class="form-grid brand-grid">
      ${field("brand-name", "名称", "brand.name", state.brand.name, { placeholder: "先用一个能说出口的工作名" })}
      ${field("brand-tagline", "标语", "brand.tagline", state.brand.tagline, { placeholder: "一句短句，不堆抽象词" })}
      ${field("brand-selling", "唯一卖点", "brand.sellingPoint", state.brand.sellingPoint, { wide: true, placeholder: "只突出一个：客户为什么先选你" })}
      ${field("brand-audience", "目标客户", "brand.audience", state.brand.audience, { placeholder: "具体到一类有共同场景的人" })}
      ${field("brand-why", "为什么应该购买", "brand.whyBuy", state.brand.whyBuy, { placeholder: "写清价值和证据，不夸大" })}
      ${field("brand-no", "不想出现的颜色、词或感觉", "brand.noNos", state.brand.noNos, { wide: true, placeholder: "例如：不要像成功学，不用亮绿色" })}
    </div>
    <section class="four-p"><div class="section-minihead"><span>4P</span><h3>把产品放进真实市场</h3></div><div class="form-grid">
      ${field("brand-product", "Product｜我卖什么", "brand.product", state.brand.product, { placeholder: "产品或服务的最小版本" })}
      ${field("brand-promotion", "Promotion｜怎样让客户知道", "brand.promotion", state.brand.promotion, { placeholder: "先写一种最可能执行的方式" })}
      ${field("brand-place", "Place｜客户在哪里找到我", "brand.place", state.brand.place, { placeholder: "平台、地点或关系网络" })}
      ${field("brand-price", "Price｜怎样定价才可能盈利", "brand.price", state.brand.price, { placeholder: "先写价格假设与要验证的问题" })}
    </div></section>`;
  }

  function renderCustomers() {
    const selected = state.customers.selectedChannels;
    return `<p class="selection-summary">最多选 3 种渠道。当前已选 <strong>${selected.length}</strong> 种。</p>
      <div class="channel-grid">
        ${data.customerChannels.map((channel) => {
          const active = selected.includes(channel);
          return `<button type="button" class="channel-chip${active ? " is-selected" : ""}" data-action="toggle-channel" data-channel="${escapeHtml(channel)}" aria-pressed="${active}">${channel}<span>${active ? "✓" : "+"}</span></button>`;
        }).join("")}
      </div>
      <div class="form-grid action-fields">
        ${field("first-action", "48 小时内的第一动作", "customers.firstAction", state.customers.firstAction, { wide: true, multiline: true, placeholder: "联系谁、发什么、提出什么明确请求？" })}
        ${field("deadline", "什么时候完成", "customers.deadline", state.customers.deadline, { placeholder: "例如：明天下午 6 点前" })}
        ${field("response", "怎样算有回应", "customers.responseSignal", state.customers.responseSignal, { placeholder: "例如：愿意聊 15 分钟或留下预订" })}
      </div>
      <details class="mentor-details"><summary>向有经验的人问什么？</summary><ul>${data.mentorQuestions.map((item) => `<li>${item}</li>`).join("")}</ul></details>`;
  }

  function renderStepContent(step) {
    if (step === 1) return renderInterests();
    if (step === 2) return renderProblems();
    if (step === 3) return renderModels();
    if (step === 4) return renderChecks();
    if (step === 5) return `<div class="day-grid">${renderTaskColumn("DAY1", "说清并验证", "先让想法碰到一个真人。", state.day1Tasks)}${renderTaskColumn("DAY2", "做出并发出去", "先做可见版本，再寻找第一位客户。", state.day2Tasks)}</div>`;
    if (step === 6) return renderBrand();
    if (step === 7) return renderCustomers();
    return "";
  }

  function stepPanel(step) {
    const meta = data.steps[step - 1];
    return `<section class="work-panel" data-screen-label="第${step}步-${meta.short}">
      <header class="panel-header"><p>${meta.kicker}</p><h1><span>0${step}</span>${meta.title}</h1>${notice ? `<div class="notice" role="alert">${escapeHtml(notice)}</div>` : ""}</header>
      <div class="panel-body">${renderStepContent(step)}</div>
      <footer class="panel-actions">
        <button class="secondary-button" type="button" data-action="previous">${step === 1 ? "返回首页" : "上一步"}</button>
        <button class="primary-button" type="button" data-action="next">${step === 7 ? "生成行动卡" : "保存并继续"}<span aria-hidden="true">→</span></button>
      </footer>
    </section>`;
  }

  function selectedModelNames() {
    return data.businessModels.filter((item) => state.selectedModelIds.includes(item.id)).map((item) => item.name);
  }

  function pendingQuestions() {
    return data.ideaChecks.filter((question, index) => state.ideaChecks[index] === "unsure" || state.ideaChecks[index] === "no");
  }

  function joinedOrPending(items) {
    const clean = items.filter(Boolean);
    return clean.length ? clean.join("、") : "待完成";
  }

  function cardText() {
    const completedDay1 = state.day1Tasks.filter((item) => item.done).length;
    const completedDay2 = state.day2Tasks.filter((item) => item.done).length;
    const nextDay1 = state.day1Tasks.filter((item) => !item.done).slice(0, 3).map((item) => item.text);
    const nextDay2 = state.day2Tasks.filter((item) => !item.done).slice(0, 3).map((item) => item.text);
    return [
      "48 小时行动卡",
      "",
      `1. 我准备测试的想法：${state.idea.trim() || "待完成"}`,
      `2. 我服务的人：${state.brand.audience.trim() || state.problems[0]?.audience?.trim() || "待完成"}`,
      `3. 要解决的问题：${state.problems.find((item) => isFilled(item.problem))?.problem?.trim() || "待完成"}`,
      `4. 商业模式：${joinedOrPending(selectedModelNames())}`,
      `5. 下一步要验证：${joinedOrPending(pendingQuestions())}`,
      `6. Day 1：已完成 ${completedDay1}/${state.day1Tasks.length}；接下来：${joinedOrPending(nextDay1)}`,
      `7. Day 2：已完成 ${completedDay2}/${state.day2Tasks.length}；接下来：${joinedOrPending(nextDay2)}`,
      `8. 品牌：${state.brand.name.trim() || "待完成"}｜${state.brand.tagline.trim() || "标语待完成"}`,
      `9. 唯一卖点：${state.brand.sellingPoint.trim() || "待完成"}`,
      `10. 4P：产品 ${state.brand.product.trim() || "待完成"}；促销 ${state.brand.promotion.trim() || "待完成"}；地点 ${state.brand.place.trim() || "待完成"}；价格 ${state.brand.price.trim() || "待完成"}`,
      `11. 第一批客户渠道：${joinedOrPending(state.customers.selectedChannels)}`,
      `12. 第一动作：${state.customers.firstAction.trim() || "待完成"}`,
      `13. 完成时间：${state.customers.deadline.trim() || "待完成"}`,
      `14. 有回应的标准：${state.customers.responseSignal.trim() || "待完成"}`,
      "",
      "内容只保存在当前浏览器。"
    ].join("\n");
  }

  function cardItem(index, label, value, step) {
    const missing = !value || value === "待完成";
    return `<article class="result-item${missing ? " is-missing" : ""}"><span>${String(index).padStart(2, "0")}</span><div><h3>${label}</h3><p>${escapeHtml(value || "待完成")}</p>${missing ? `<button type="button" class="text-button" data-action="go-step" data-step="${step}">回去填写</button>` : ""}</div></article>`;
  }

  function resultPanel() {
    const problem = state.problems.find((item) => isFilled(item.problem));
    const day1Left = state.day1Tasks.filter((item) => !item.done).slice(0, 3).map((item) => item.text);
    const day2Left = state.day2Tasks.filter((item) => !item.done).slice(0, 3).map((item) => item.text);
    const resultImage = variant.resultImage || variant.image;
    const resultKicker = variantId === "a" ? "48小时行动卡" : "YOUR 48H ACTION CARD";
    const resultNote = variantId === "a" ? "你可以随时回来，继续更新这张行动卡。" : "关注 Chen Hongye，后续继续把想法做成可以使用的工具。";
    return `<section class="result-panel" data-screen-label="48小时行动卡">
      <header class="result-header"><div><p>${resultKicker}</p><h1>你的个人事业，<br>先从这一张卡开始。</h1><span>${completedCount()} / 7 个步骤已有内容</span></div><img src="${resultImage}" alt="${variant.imageAlt}"></header>
      ${notice ? `<div class="notice" role="alert">${escapeHtml(notice)}</div>` : ""}
      <div class="result-grid">
        ${cardItem(1, "我准备测试的想法", state.idea.trim(), 4)}
        ${cardItem(2, "为谁解决什么问题", `${state.brand.audience.trim() || problem?.audience?.trim() || "待完成"}｜${problem?.problem?.trim() || "待完成"}`, 2)}
        ${cardItem(3, "选择的商业模式", joinedOrPending(selectedModelNames()), 3)}
        ${cardItem(4, "下一步需要验证", joinedOrPending(pendingQuestions()), 4)}
        ${cardItem(5, "Day 1 接下来", joinedOrPending(day1Left), 5)}
        ${cardItem(6, "Day 2 接下来", joinedOrPending(day2Left), 5)}
        ${cardItem(7, "品牌与唯一卖点", `${state.brand.name.trim() || "待完成"}｜${state.brand.sellingPoint.trim() || "待完成"}`, 6)}
        ${cardItem(8, "第一位客户动作", `${joinedOrPending(state.customers.selectedChannels)}｜${state.customers.firstAction.trim() || "待完成"}`, 7)}
      </div>
      <div class="copy-box"><pre id="action-card-text">${escapeHtml(cardText())}</pre><div><button class="primary-button" type="button" data-action="copy-card">复制行动卡</button><span class="copy-status" role="status">${escapeHtml(copyStatus)}</span></div></div>
      <footer class="result-footer"><button class="secondary-button" type="button" data-action="go-step" data-step="1">返回修改</button><p>${resultNote}</p></footer>
    </section>`;
  }

  function hero() {
    const formal = variantId === "a";
    const eyebrow = variant.eyebrow ? `<p class="hero-eyebrow">${variant.eyebrow}</p>` : "";
    const compareLink = formal ? "" : '<a class="quiet-link" href="index.html">比较三个版本</a>';
    const sourceDetails = formal ? "" : '<details class="source-details"><summary>内容从哪里来？</summary><p>七步结构来自 Chen Hongye 的演示脚本及《48小时启动》读书笔记。书名、人物经历与历史描述尚未在本轮外部核验。</p></details>';
    const artCaption = formal ? "" : `<figcaption>${variant.name}</figcaption>`;
    const startLabel = formal ? "开始制定计划" : "开始第 1 步";
    return `<main class="hero" data-screen-label="首页">
      <section class="hero-copy">${eyebrow}<h1>${heroTitleMarkup()}</h1><p class="hero-body">${variant.heroBody}</p>
        <div class="hero-actions"><button class="primary-button" type="button" data-action="start">${startLabel} <span aria-hidden="true">→</span></button>${compareLink}</div>
        <div class="hero-proof"><span>7 步</span><span>27 种商业模式</span><span>1 张行动卡</span></div>
        <p class="privacy-line"><span aria-hidden="true">●</span> 填写内容只保存在当前浏览器，不会上传。</p>
        ${sourceDetails}
      </section>
      <figure class="hero-art"><img src="${variant.image}" alt="${variant.imageAlt}">${artCaption}</figure>
      <ol class="hero-steps" aria-label="七步概览">${data.steps.map((step) => `<li><span>0${step.id}</span>${step.short}</li>`).join("")}</ol>
    </main>`;
  }

  function resetDialog() {
    if (!resetOpen) return "";
    return `<div class="dialog-backdrop"><section class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title"><p>只清空当前版本</p><h2 id="reset-title">重新开始？</h2><p>这会删除“${variant.name}”保存在本机的全部填写内容，不影响另外两个版本。</p><div><button class="secondary-button" type="button" data-action="cancel-reset">取消</button><button class="danger-button" type="button" data-action="confirm-reset">确认清空</button></div></section></div>`;
  }

  function appShell() {
    const isHome = state.currentStep === 0;
    const formal = variantId === "a";
    const brand = formal
      ? `<div class="brand-link formal-brand"><span>48H</span><strong>${variant.name}</strong></div>`
      : `<a class="brand-link" href="index.html"><span>48H</span><strong>${variant.name}</strong></a>`;
    const footerName = formal ? variant.name : "Chen Hongye · 48小时开启个人事业";
    return `<div class="site-shell">
      <header class="site-header">${brand}<div class="header-tools"><span class="save-state" role="status">${storageAvailable ? "已保存在本机" : "当前无法自动保存"}</span>${!isHome ? '<button class="text-button" type="button" data-action="open-reset">重新开始</button>' : ""}</div></header>
      ${isHome ? hero() : `<main class="workspace">${progressMarkup()}${state.currentStep === 8 ? resultPanel() : stepPanel(state.currentStep)}</main>`}
      <footer class="site-footer"><span>${footerName}</span><span>本机保存 · 不上传 · 可随时重置</span></footer>
      ${resetDialog()}
    </div>`;
  }

  function render(options = {}) {
    let focusToken = options.focusToken || "";
    let start = null;
    let end = null;
    if (!focusToken && document.activeElement && root.contains(document.activeElement)) {
      const active = document.activeElement;
      focusToken = active.dataset.field ? `field:${active.dataset.field}` : active.dataset.modelSearch ? "model-search" : active.dataset.newTask ? `new-task:${active.dataset.newTask}` : "";
      if (typeof active.selectionStart === "number") {
        start = active.selectionStart;
        end = active.selectionEnd;
      }
    }
    root.innerHTML = appShell();
    if (focusToken) {
      let target = null;
      if (focusToken.startsWith("field:")) target = root.querySelector(`[data-field="${focusToken.slice(6)}"]`);
      if (focusToken === "model-search") target = root.querySelector("[data-model-search]");
      if (focusToken.startsWith("new-task:")) target = root.querySelector(`[data-new-task="${focusToken.slice(9)}"]`);
      if (target) {
        target.focus({ preventScroll: true });
        if (start !== null && target.setSelectionRange) target.setSelectionRange(start, end);
      }
    }
  }

  function validationMessage(step) {
    if (step === 1) return "至少写完整一项兴趣和你关心它的原因。";
    if (step === 2) return "至少写完整一个具体问题和会遇到它的人。";
    if (step === 3) return "先选择至少一种你愿意测试的商业模式。";
    if (step === 4) return "写下想法，并完成全部 8 个问题；不确定也可以。";
    if (step === 5) return "Day 1 和 Day 2 都需要保留至少一项任务。";
    if (step === 6) return "请至少写下名称、目标客户和唯一卖点。";
    if (step === 7) return "请选择至少一种渠道，并写下 48 小时内的第一动作。";
    return "请补齐当前步骤。";
  }

  function focusForStep(step) {
    if (step === 1) return "field:interests.0.topic";
    if (step === 2) return "field:problems.0.problem";
    if (step === 3) return "model-search";
    if (step === 4) return "field:idea";
    if (step === 6) return "field:brand.name";
    if (step === 7) return "field:customers.firstAction";
    return "";
  }

  async function copyActionCard() {
    const text = cardText();
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        if (!ok) throw new Error("copy failed");
      }
      copyStatus = "已复制，可以粘贴到 Obsidian 或备忘录。";
    } catch (error) {
      copyStatus = "自动复制失败，行动卡文字已保留，请手动选择复制。";
    }
    render();
  }

  root.addEventListener("input", (event) => {
    const target = event.target;
    if (target.dataset.field) {
      setByPath(state, target.dataset.field, target.value);
      saveState();
      const status = root.querySelector(".save-state");
      if (status) status.textContent = storageAvailable ? "已保存在本机" : "当前无法自动保存";
    }
    if (target.dataset.modelSearch) {
      modelSearch = target.value;
      render({ focusToken: "model-search" });
    }
  });

  root.addEventListener("change", (event) => {
    const target = event.target;
    if (target.dataset.taskDay) {
      const list = target.dataset.taskDay === "day1" ? state.day1Tasks : state.day2Tasks;
      const task = list[Number(target.dataset.taskIndex)];
      if (task) task.done = target.checked;
      saveState();
      render();
    } else if (target.dataset.field) {
      saveState();
      render();
    }
  });

  root.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.dataset.newTask) {
      event.preventDefault();
      const day = event.target.dataset.newTask;
      const button = root.querySelector(`[data-action="add-task"][data-day="${day}"]`);
      if (button) button.click();
    }
    if (event.key === "Escape" && resetOpen) {
      resetOpen = false;
      render();
    }
  });

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    notice = "";

    if (action === "start") {
      state.currentStep = 1;
      saveState();
      render();
    }
    if (action === "go-step") {
      state.currentStep = Number(button.dataset.step);
      saveState();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (action === "previous") {
      state.currentStep = state.currentStep === 1 ? 0 : state.currentStep - 1;
      saveState();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (action === "next") {
      if (!stepComplete(state.currentStep)) {
        notice = validationMessage(state.currentStep);
        render({ focusToken: focusForStep(state.currentStep) });
      } else {
        state.currentStep = state.currentStep === 7 ? 8 : state.currentStep + 1;
        saveState();
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    if (action === "add-interest") {
      state.interests.push({ id: uid("interest"), topic: "", reason: "" });
      saveState();
      render({ focusToken: `field:interests.${state.interests.length - 1}.topic` });
    }
    if (action === "remove-interest") {
      state.interests.splice(Number(button.dataset.index), 1);
      saveState();
      render();
    }
    if (action === "add-problem") {
      state.problems.push({ id: uid("problem"), problem: "", audience: "", wouldPay: "unsure" });
      saveState();
      render({ focusToken: `field:problems.${state.problems.length - 1}.problem` });
    }
    if (action === "remove-problem") {
      state.problems.splice(Number(button.dataset.index), 1);
      saveState();
      render();
    }
    if (action === "set-pay") {
      const item = state.problems[Number(button.dataset.index)];
      if (item) item.wouldPay = button.dataset.value;
      saveState();
      render();
    }
    if (action === "toggle-model") {
      const id = button.dataset.id;
      state.selectedModelIds = state.selectedModelIds.includes(id) ? state.selectedModelIds.filter((item) => item !== id) : [...state.selectedModelIds, id];
      saveState();
      render();
    }
    if (action === "set-check") {
      state.ideaChecks[Number(button.dataset.index)] = button.dataset.value;
      saveState();
      render();
    }
    if (action === "add-task") {
      const day = button.dataset.day;
      const input = root.querySelector(`[data-new-task="${day}"]`);
      const value = input ? input.value.trim() : "";
      if (!value) {
        notice = "先写下要添加的任务。";
        render({ focusToken: `new-task:${day}` });
      } else {
        const list = day === "day1" ? state.day1Tasks : state.day2Tasks;
        list.push({ id: uid(day), text: value, done: false, custom: true });
        saveState();
        render({ focusToken: `new-task:${day}` });
      }
    }
    if (action === "remove-task") {
      const list = button.dataset.day === "day1" ? state.day1Tasks : state.day2Tasks;
      list.splice(Number(button.dataset.index), 1);
      saveState();
      render();
    }
    if (action === "toggle-channel") {
      const channel = button.dataset.channel;
      if (state.customers.selectedChannels.includes(channel)) {
        state.customers.selectedChannels = state.customers.selectedChannels.filter((item) => item !== channel);
      } else if (state.customers.selectedChannels.length < 3) {
        state.customers.selectedChannels = [...state.customers.selectedChannels, channel];
      } else {
        notice = "最多选择 3 种渠道。先删掉一种，再添加新的。";
      }
      saveState();
      render();
    }
    if (action === "copy-card") copyActionCard();
    if (action === "open-reset") {
      resetOpen = true;
      render();
      const cancel = root.querySelector('[data-action="cancel-reset"]');
      if (cancel) cancel.focus();
    }
    if (action === "cancel-reset") {
      resetOpen = false;
      render();
    }
    if (action === "confirm-reset") {
      try { window.localStorage.removeItem(variant.storageKey); } catch (error) { storageAvailable = false; }
      state = initialState();
      resetOpen = false;
      notice = "当前版本已清空。";
      saveState();
      render();
    }
  });

  render();
})();
