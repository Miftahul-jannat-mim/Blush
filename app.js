/*
  The Blush Makeover — booking site.

  There's no real server: the browser's localStorage plays the role
  of the studio's database. auth.html creates/checks accounts,
  dashboard.html is where a signed-in customer books an appointment,
  and admin.html is the studio-side view of every account, booking
  and sign-in attempt (including failed ones).
*/

const ACCOUNTS_KEY = "blush_accounts";
const LOGS_KEY = "blush_logs";
const BOOKINGS_KEY = "blush_bookings";
const SESSION_KEY = "blush_session";
const MIN_PASSWORD_LENGTH = 6;

// ---------- storage helpers ----------

function getAccounts() { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]"); }
function saveAccounts(list) { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list)); }

function getLogs() { return JSON.parse(localStorage.getItem(LOGS_KEY) || "[]"); }
function addLog(entry) {
  const logs = getLogs();
  logs.unshift({ time: new Date().toISOString(), ...entry });
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 200)));
}

function getBookings() { return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]"); }
function saveBookings(list) { localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list)); }

function getSession() { return sessionStorage.getItem(SESSION_KEY); }

// ---------- formatting ----------

function formatTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function formatDateOnly(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function formatBookingDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso) {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return formatDateOnly(iso);
}

function initials(name) { return name.trim().slice(0, 2).toUpperCase(); }

function friendlyActivityText(entry) {
  if (entry.action === "signup") return entry.status === "ok" ? "Account created" : `Sign-up failed — ${entry.message}`;
  if (entry.action === "login") return entry.status === "ok" ? "Signed in" : `Sign-in attempt failed — ${entry.message}`;
  if (entry.action === "logout") return "Signed out";
  if (entry.action === "delete") return "Account deleted";
  if (entry.action === "booking") return `Booked ${entry.message}`;
  return entry.message;
}

// ---------- password show/hide (every page with a password field) ----------

function initPasswordToggles() {
  document.querySelectorAll(".toggle-visibility").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      btn.classList.toggle("is-showing", !showing);
      btn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
      btn.querySelector(".icon-eye").hidden = !showing;
      btn.querySelector(".icon-eye-off").hidden = showing;
    });
  });
}

// ---------- auth page ----------

function initAuthPage() {
  if (getSession()) {
    window.location.href = "dashboard.html";
    return;
  }

  const tabSignup = document.getElementById("tab-signup");
  const tabLogin = document.getElementById("tab-login");
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const message = document.getElementById("message");

  function showMessage(text, kind) {
    message.textContent = text;
    message.className = "message" + (kind ? " " + kind : "");
  }

  function switchTab(tab) {
    const showSignup = tab === "signup";
    tabSignup.classList.toggle("active", showSignup);
    tabLogin.classList.toggle("active", !showSignup);
    signupForm.hidden = !showSignup;
    loginForm.hidden = showSignup;
    showMessage("", "");
  }

  tabSignup.addEventListener("click", () => switchTab("signup"));
  tabLogin.addEventListener("click", () => switchTab("login"));

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value;

    if (!username || !password) {
      showMessage("Enter your name and a password.", "error");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      showMessage(`Password needs to be at least ${MIN_PASSWORD_LENGTH} characters.`, "error");
      addLog({ username, action: "signup", status: "error", message: `Password too short (${password.length}/${MIN_PASSWORD_LENGTH} min)` });
      return;
    }

    const accounts = getAccounts();
    if (accounts.some((a) => a.username.toLowerCase() === username.toLowerCase())) {
      showMessage("An account with that name already exists.", "error");
      addLog({ username, action: "signup", status: "error", message: "Username already exists" });
      return;
    }

    accounts.push({ username, password, createdAt: new Date().toISOString() });
    saveAccounts(accounts);
    addLog({ username, action: "signup", status: "ok", message: "Account created" });
    addLog({ username, action: "login", status: "ok", message: "Signed in after signup" });

    sessionStorage.setItem(SESSION_KEY, username);
    window.location.href = "dashboard.html";
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    const accounts = getAccounts();
    const account = accounts.find((a) => a.username.toLowerCase() === username.toLowerCase());

    if (!account) {
      showMessage("No account with that name.", "error");
      addLog({ username: username || "(blank)", action: "login", status: "error", message: "Unknown username" });
      return;
    }
    if (account.password !== password) {
      showMessage("Incorrect password.", "error");
      addLog({ username: account.username, action: "login", status: "error", message: "Incorrect password" });
      return;
    }

    addLog({ username: account.username, action: "login", status: "ok", message: "Signed in" });
    sessionStorage.setItem(SESSION_KEY, account.username);
    window.location.href = "dashboard.html";
  });
}

// ---------- dashboard page ----------

function initDashboard() {
  const user = getSession();
  if (!user) { window.location.href = "auth.html"; return; }

  const accounts = getAccounts();
  const account = accounts.find((a) => a.username === user);
  if (!account) {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "auth.html";
    return;
  }

  document.getElementById("profile-avatar").textContent = initials(account.username);
  document.getElementById("profile-username").textContent = account.username;

  const myLogins = getLogs().filter((l) => l.username === user && l.action === "login" && l.status === "ok");
  const lastLogin = myLogins[1];
  const lastLoginText = lastLogin ? `Last signed in ${timeAgo(lastLogin.time)}` : "This is your first sign-in";
  document.getElementById("profile-meta").textContent = `Customer since ${formatDateOnly(account.createdAt)} · ${lastLoginText}`;

  // tabs
  const tabs = document.querySelectorAll(".dash-tab");
  const panels = { bookings: document.getElementById("panel-bookings"), activity: document.getElementById("panel-activity"), settings: document.getElementById("panel-settings") };
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      Object.entries(panels).forEach(([key, el]) => { el.hidden = key !== tab.dataset.tab; });
    });
  });

  // booking form
  const bookingForm = document.getElementById("booking-form");
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const service = document.getElementById("booking-service").value;
    const date = document.getElementById("booking-date").value;
    const notes = document.getElementById("booking-notes").value.trim();
    if (!service || !date) return;

    const bookings = getBookings();
    bookings.unshift({ username: user, service, date, notes, requestedAt: new Date().toISOString() });
    saveBookings(bookings);
    addLog({ username: user, action: "booking", status: "ok", message: service });

    bookingForm.reset();
    renderMyBookings();
  });

  function renderMyBookings() {
    const list = document.getElementById("booking-list");
    const empty = document.getElementById("booking-empty");
    const mine = getBookings().filter((b) => b.username === user);
    list.innerHTML = "";
    empty.hidden = mine.length > 0;
    mine.forEach((b) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <div class="b-service">${b.service}</div>
          <div class="b-meta">${formatBookingDate(b.date)} · requested ${timeAgo(b.requestedAt)}</div>
        </div>
        <span class="b-status">Pending confirmation</span>`;
      list.appendChild(li);
    });
  }
  renderMyBookings();

  // activity feed
  const logList = document.getElementById("log-list");
  const logEmpty = document.getElementById("log-empty");
  const myLogs = getLogs().filter((l) => l.username === user).slice(0, 12);
  logList.innerHTML = "";
  logEmpty.hidden = myLogs.length > 0;
  myLogs.forEach((entry) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="feed-dot ${entry.status === "ok" ? "" : "err"}"></span>
      <div>
        <div class="feed-text">${friendlyActivityText(entry)}</div>
        <div class="feed-time">${timeAgo(entry.time)}</div>
      </div>`;
    logList.appendChild(li);
  });

  // sign out / delete
  document.getElementById("sign-out").addEventListener("click", () => {
    addLog({ username: user, action: "logout", status: "ok", message: "Signed out" });
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "index.html";
  });

  document.getElementById("delete-account").addEventListener("click", () => {
    if (!confirm("Delete your account? This can't be undone.")) return;
    saveAccounts(getAccounts().filter((a) => a.username.toLowerCase() !== user.toLowerCase()));
    addLog({ username: user, action: "delete", status: "ok", message: "Account deleted by customer" });
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "index.html";
  });
}

// ---------- admin page ----------

function renderAdminLogs() {
  const logList = document.getElementById("log-list");
  const logEmpty = document.getElementById("log-empty");
  const logCount = document.getElementById("log-count");
  const logs = getLogs();
  logCount.textContent = logs.length ? `(${logs.length})` : "";
  logList.innerHTML = "";
  logEmpty.hidden = logs.length > 0;
  logs.forEach((entry) => {
    const li = document.createElement("li");
    const time = document.createElement("span");
    time.className = "log-time";
    time.textContent = formatTime(entry.time);
    const status = document.createElement("span");
    status.className = "log-status " + (entry.status === "ok" ? "ok" : "err");
    status.textContent = entry.status === "ok" ? "OK" : "ERR";
    const text = document.createElement("span");
    text.className = "log-text";
    text.innerHTML = `<span class="user">${entry.username}</span> — ${entry.action}: ${entry.message}`;
    li.append(time, status, text);
    logList.appendChild(li);
  });
}

function renderAdmin() {
  const accountsBody = document.getElementById("accounts-body");
  const accountsEmpty = document.getElementById("accounts-empty");
  const accountCount = document.getElementById("account-count");

  const accounts = getAccounts();
  accountCount.textContent = accounts.length ? `(${accounts.length})` : "";
  accountsBody.innerHTML = "";
  accountsEmpty.hidden = accounts.length > 0;

  accounts.forEach((acc) => {
    const tr = document.createElement("tr");
    const nameTd = document.createElement("td");
    nameTd.textContent = acc.username;
    const createdTd = document.createElement("td");
    createdTd.textContent = formatTime(acc.createdAt);
    const actionTd = document.createElement("td");
    actionTd.className = "actions";
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      if (!confirm(`Delete account "${acc.username}"?`)) return;
      saveAccounts(getAccounts().filter((a) => a.username !== acc.username));
      addLog({ username: acc.username, action: "delete", status: "ok", message: "Deleted from studio admin" });
      renderAdmin();
    });
    actionTd.appendChild(delBtn);
    tr.append(nameTd, createdTd, actionTd);
    accountsBody.appendChild(tr);
  });

  const bookingsBody = document.getElementById("bookings-body");
  const bookingsEmpty = document.getElementById("bookings-empty");
  const bookingCount = document.getElementById("booking-count");
  const bookings = getBookings();
  bookingCount.textContent = bookings.length ? `(${bookings.length})` : "";
  bookingsBody.innerHTML = "";
  bookingsEmpty.hidden = bookings.length > 0;
  bookings.forEach((b) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${b.username}</td><td>${b.service}</td><td>${formatBookingDate(b.date)}</td><td>${formatTime(b.requestedAt)}</td>`;
    bookingsBody.appendChild(tr);
  });

  renderAdminLogs();
}

function seedDemoData() {
  const now = Date.now();
  const ago = (ms) => new Date(now - ms).toISOString();

  const accounts = getAccounts();
  const demoNames = ["Nusrat", "Farzana", "Adiba"];
  demoNames.forEach((name, i) => {
    if (!accounts.some((a) => a.username.toLowerCase() === name.toLowerCase())) {
      accounts.push({ username: name, password: "demo123", createdAt: ago((i + 1) * 86400000) });
    }
  });
  saveAccounts(accounts);

  const bookings = getBookings();
  bookings.unshift(
    { username: "Nusrat", service: "Bridal Makeup — Wedding Day (৳15,000)", date: "2026-12-10", notes: "", requestedAt: ago(3600000) },
    { username: "Farzana", service: "Party Makeup (৳4,000)", date: "2026-10-02", notes: "", requestedAt: ago(7200000) }
  );
  saveBookings(bookings);

  const logs = getLogs();
  logs.unshift(
    { time: ago(300000), username: "Adiba", action: "login", status: "error", message: "Incorrect password" },
    { time: ago(360000), username: "Adiba", action: "login", status: "ok", message: "Signed in" },
    { time: ago(1800000), username: "Farzana", action: "booking", status: "ok", message: "Party Makeup (৳4,000)" },
    { time: ago(3700000), username: "Nusrat", action: "booking", status: "ok", message: "Bridal Makeup — Wedding Day (৳15,000)" },
    { time: ago(86400000), username: "unknown", action: "login", status: "error", message: "Unknown username" },
    { time: ago(90000000), username: "Farzana", action: "signup", status: "ok", message: "Account created" },
    { time: ago(172800000), username: "Nusrat", action: "signup", status: "ok", message: "Account created" }
  );
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 200)));
}

function initAdmin() {
  renderAdmin();
  document.getElementById("clear-logs").addEventListener("click", () => {
    if (!confirm("Clear the activity log?")) return;
    localStorage.setItem(LOGS_KEY, "[]");
    renderAdmin();
  });
  document.getElementById("seed-demo").addEventListener("click", () => {
    seedDemoData();
    renderAdmin();
  });
  window.addEventListener("storage", renderAdmin);
}

// ---------- boot ----------

document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggles();
  if (document.getElementById("signup-form")) initAuthPage();
  if (document.getElementById("profile-username")) initDashboard();
  if (document.getElementById("accounts-body")) initAdmin();
});
