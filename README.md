# The Blush Makeover

This is my project. It's a booking website for a made-up bridal makeup
business. Here's how I'd explain it.

---

## 1. What I built

A website where a visitor can look at services and prices, create an
account, log in, and book a makeup appointment. There's also an admin
page only I would know about, where I can see every account, every
booking, and every login attempt — including the failed ones.

## 2. Where's the backend?

Right here: `admin.html`, plus the `localStorage` box it reads from.
That combination **is** my backend. If ANYONE asks "where's the
backend," that's the direct answer.

- My **frontend** is what a visitor sees and clicks: the homepage,
  the sign-in page, and the customer dashboard.
- My **backend** is `localStorage` (the storage) plus `admin.html`
  (the page that reads that storage and displays it) — accounts,
  bookings, and the activity log all live there.

## 3. Why I built it this way

I wanted a full-stack-feeling project, but I didn't want to set up a
real server or a real database — that felt like too much for a first
project, and I needed something I could run instantly with zero
setup. `localStorage` is a storage box built into the browser itself,
so using it as my "database" meant I didn't need to install anything
or run a server to show this off. It's plain HTML, CSS and
JavaScript, and it all runs in the browser.

## 4. My files, and what each one does

- `index.html` — the homepage: services, prices (in taka), reviews, contact info
- `auth.html` — sign up and sign in
- `dashboard.html` — what a customer sees once logged in: book an appointment, see their bookings, see their activity, delete their account
- `admin.html` — my backend view: every account, every booking, every login attempt
- `style.css` — all the styling, shared by every page
- `app.js` — all the logic: what happens when someone clicks a button or submits a form

I also wrote a second file, `CODE_GUIDE.md`, that goes through the
actual code line by line if I need to point to exactly where
something happens.

## 5. How I'd walk through it live

1. Open `index.html` — this is the homepage.
2. Click "Book Now" — takes me to `auth.html`.
3. Create an account with a password under 6 characters — I'd show the
   error message that appears.
4. Create a real account — I get signed in automatically and land on
   `dashboard.html`.
5. Book an appointment — pick a service, pick a date, submit — and
   show it appearing instantly in "My bookings."
6. Open `admin.html` in a second tab — show that same booking sitting
   in the admin table, along with an activity log entry.
7. Go back to `auth.html`, log out, and try logging in with the wrong
   password on purpose — show the red error, then flip back to
   `admin.html` and point out that the failed attempt got logged
   there too — that's the backend recording it, not just the
   frontend showing it once and forgetting.
8. Click the eye icon next to a password field to show the show/hide
   toggle.

## 6. How I'm running it online for class

I'm using Netlify Drop — it's the fastest way I found:

1. Go to `https://app.netlify.com/drop`.
2. Drag my whole project folder onto the page.
3. It gives me a live link in a few seconds, something like
   `https://random-name-123.netlify.app`.
4. That's what I'll open in front of my teacher — no account, no
   install, no deployment commands.

If I ever need to show it from GitHub instead, I'd push the folder to
a repo and turn on GitHub Pages under Settings → Pages.

## 7. One thing I'd be upfront about

Passwords are stored as plain text in the browser's storage box. I
know that's not how a real production app should do it — a real
backend would hash the password before saving it. I built it this way
because the point of this project was learning how frontend and
backend pieces talk to each other, not shipping something production-
ready. If asked, I'd say that out loud rather than pretend otherwise.
