// Drop-in usecases widget. Usage:
// <div id="usecases-widget"></div>
// <script src="https://your-app/widget.js"
//         data-api-key="uc_..."
//         data-target="#usecases-widget"
//         data-fn-url="https://your-project.supabase.co/functions/v1/generate"></script>
(function () {
  var script = document.currentScript;
  if (!script) return;
  var apiKey = script.getAttribute("data-api-key");
  var targetSel = script.getAttribute("data-target") || "#usecases-widget";
  var fnUrl = script.getAttribute("data-fn-url");

  var mount = document.querySelector(targetSel);
  if (!mount) { console.warn("[usecases] target not found:", targetSel); return; }
  if (!apiKey) { console.warn("[usecases] missing data-api-key"); return; }
  if (!fnUrl) {
    console.warn("[usecases] data-fn-url is required (point at your Supabase edge function)");
  }

  var styles = "" +
    "._uc{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#0a0a0a;max-width:560px;}" +
    "._uc input,._uc textarea{width:100%;border:1px solid #e2e2dc;border-radius:4px;padding:.75rem;font:inherit;background:#fff;outline:none;}" +
    "._uc textarea{min-height:80px;resize:vertical;}" +
    "._uc .row{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.75rem;}" +
    "._uc button{width:100%;background:#0a0a0a;color:#fafaf8;border:0;padding:.85rem;border-radius:4px;font:inherit;letter-spacing:.08em;text-transform:uppercase;font-size:.75rem;cursor:pointer;}" +
    "._uc button:disabled{opacity:.4;cursor:not-allowed;}" +
    "._uc ul{list-style:none;margin:1.5rem 0 0;padding:0;border:1px solid #e2e2dc;border-radius:4px;}" +
    "._uc li{padding:1rem 1.2rem;border-bottom:1px solid #e2e2dc;}" +
    "._uc li:last-child{border-bottom:0;}" +
    "._uc .t{font-weight:500;margin-bottom:.25rem;}" +
    "._uc .d{font-size:.8rem;color:#8a8a85;line-height:1.6;}" +
    "._uc .err{color:#c0392b;font-size:.8rem;margin-top:.5rem;}";

  var styleEl = document.createElement("style");
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  mount.innerHTML =
    '<div class="_uc">' +
      '<div class="row"><input type="text" placeholder="your website (e.g. acme.com)" data-uc-website></div>' +
      '<div class="row"><textarea placeholder="or describe what you do" data-uc-desc></textarea></div>' +
      '<button type="button" data-uc-go>Generate use cases</button>' +
      '<div class="err" data-uc-err style="display:none"></div>' +
      '<ul data-uc-list style="display:none"></ul>' +
    '</div>';

  var btn = mount.querySelector("[data-uc-go]");
  var web = mount.querySelector("[data-uc-website]");
  var desc = mount.querySelector("[data-uc-desc]");
  var err = mount.querySelector("[data-uc-err]");
  var list = mount.querySelector("[data-uc-list]");

  btn.addEventListener("click", function () {
    err.style.display = "none";
    list.style.display = "none";
    list.innerHTML = "";
    var w = (web.value || "").trim();
    var d = (desc.value || "").trim();
    if (!w && !d) { err.textContent = "Enter a website or description."; err.style.display = "block"; return; }
    btn.disabled = true; btn.textContent = "Generating...";
    fetch(fnUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({ website: w || undefined, description: d || undefined })
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, data: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.data && res.data.error || "Failed");
        (res.data.use_cases || []).forEach(function (uc) {
          var li = document.createElement("li");
          li.innerHTML = '<div class="t"></div><div class="d"></div>';
          li.querySelector(".t").textContent = uc.title;
          li.querySelector(".d").textContent = uc.description;
          list.appendChild(li);
        });
        list.style.display = "block";
      })
      .catch(function (e) { err.textContent = e.message || "Error"; err.style.display = "block"; })
      .finally(function () { btn.disabled = false; btn.textContent = "Generate use cases"; });
  });
})();
