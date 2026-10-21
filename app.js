const $ = id => document.getElementById(id);
const storageKey = "tileReelsFinder.saved.v1";
let items = [];
try { items = JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { items = []; }

function searchUrl(query, source) {
  const q = encodeURIComponent(query.trim());
  if (source === "google") return `https://www.google.com/search?q=${q}+Instagram+Reels+tile+installation`;
  if (source === "youtube") return `https://www.youtube.com/results?search_query=${q}`;
  const slug = query.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zа-яё0-9 ]/gi, " ").trim().replace(/\s+/g, "");
  return `https://www.instagram.com/explore/tags/${slug}/`;
}

$("search").addEventListener("click", () => {
  const q = $("query").value.trim();
  if (!q) { $("status").textContent = "Сначала введи тему поиска."; return; }
  window.open(searchUrl(q, $("source").value), "_blank", "noopener,noreferrer");
  $("status").textContent = "Поиск открыт во внешнем сервисе. Доступные результаты зависят от возможностей сервиса.";
});
document.querySelectorAll("[data-query]").forEach(button => {
  button.addEventListener("click", () => {
    $("query").value = button.dataset.query;
    $("source").value = "instagram";
    window.open(searchUrl(button.dataset.query, "instagram"), "_blank", "noopener,noreferrer");
  });
});
$("save").addEventListener("click", () => {
  const url = $("url").value.trim();
  const note = $("note").value.trim();
  let parsed;
  try { parsed = new URL(url); } catch { $("status").textContent = "Вставь корректную ссылку."; return; }
  if (!["instagram.com","www.instagram.com","youtube.com","www.youtube.com","youtu.be"].includes(parsed.hostname)) {
    $("status").textContent = "Поддерживаются ссылки Instagram и YouTube.";
    return;
  }
  const normalized = url.replace(/\/+$/, "");
  if (items.some(x => x.url.replace(/\/+$/, "") === normalized)) {
    $("status").textContent = "Эта ссылка уже есть в библиотеке.";
    return;
  }
  items.unshift({url, note, created: Date.now()});
  persist();
  $("url").value = ""; $("note").value = "";
  $("status").textContent = "Ссылка сохранена в этом браузере.";
});
function persist() {
  localStorage.setItem(storageKey, JSON.stringify(items));
  render();
}
function render() {
  $("count").textContent = items.length;
  const container = $("saved");
  container.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "Пока пусто. Найди видео и добавь ссылку сюда.";
    container.append(empty);
    return;
  }
  items.forEach((item, index) => {
    const card = document.createElement("article"); card.className = "item";
    const title = document.createElement("strong"); title.textContent = item.note || "Сохранённое видео";
    const anchor = document.createElement("a"); anchor.href = item.url; anchor.target = "_blank"; anchor.rel = "noopener noreferrer"; anchor.textContent = item.url;
    const actions = document.createElement("div"); actions.className = "item-actions";
    const open = document.createElement("button"); open.textContent = "Открыть"; open.addEventListener("click", () => window.open(item.url, "_blank", "noopener,noreferrer"));
    const remove = document.createElement("button"); remove.textContent = "Удалить"; remove.addEventListener("click", () => { items.splice(index,1); persist(); });
    actions.append(open, remove); card.append(title, anchor, actions); container.append(card);
  });
}
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
render();
