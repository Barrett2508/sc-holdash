// ====== CONFIG ======
const API_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

// IMPORTANT:
// We use Content-Type: text/plain to avoid CORS preflight issues from GitHub Pages.
async function api(action, payload = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload })
  });

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    // Show a snippet of what came back (usually an HTML login page)
    toast("Bad response from API", text.slice(0, 180) + "…", "err");
    return { ok: false, error: "Bad JSON response" };
  }
}


// ====== STORAGE ======
function setToken(token) { localStorage.setItem("holiday_token", token); }
function getToken() { return localStorage.getItem("holiday_token"); }
function clearToken() { localStorage.removeItem("holiday_token"); }

// ====== TOAST ======
let toastTimer = null;
function toast(title, message, type = "ok") {
  const el = document.getElementById("toast");
  if (!el) return alert(`${title}\n\n${message}`);
  el.className = `toast ${type}`;
  el.innerHTML = `<strong>${escapeHtml(title)}</strong><div class="small">${escapeHtml(message)}</div>`;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

// ====== GUARDS ======
async function requireAuth({ adminOnly = false } = {}) {
  const token = getToken();
  if (!token) return (location.href = "login.html");

  const me = await api("me", { token });
  if (!me.ok) {
    clearToken();
    return (location.href = "login.html");
  }

  if (adminOnly && me.user.role !== "admin") {
    toast("Access denied", "Admin rights required.", "err");
    return (location.href = "dashboard.html");
  }

  return me.user;
}

function logout() {
  clearToken();
  location.href = "login.html";
}
