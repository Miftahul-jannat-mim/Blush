# The Blush Makeover — read this before class

This file explains everything in plain, simple words. No computer
jargon left unexplained. Read it once and you'll be able to explain
the whole project to your teacher.

---

## 1. What is this project, in one sentence?

It's a website for a made-up bridal makeup business. People can look
at services and prices, create an account, log in, and request a
booking. There's also a hidden "admin" page where the business owner
can see everyone who signed up and every booking that came in.

---

## 2. What is "frontend" and "backend" here, in plain words?

Think of a restaurant.

- The **frontend** is the dining area — the menu, the tables, what
  the customer sees and touches. In this project, that's the
  homepage, the sign-in page, and the customer's "My Account" page.
- The **backend** is the kitchen — where the order actually gets
  processed and remembered. In a real company, this is a separate
  computer (a server) with a database.
- In THIS project, there is no separate kitchen computer. Instead,
  we use a trick: the web browser itself remembers things, using a
  built-in storage box called `localStorage`. It behaves like a tiny
  database that lives inside the browser.
- The `admin.html` page is our stand-in "kitchen window" — it just
  reads that same storage box and shows everything in it: every
  customer, every booking, every login attempt.

This is why the project needs **zero installation** and **zero
server** to run. Everything happens inside the browser. That's what
makes it the easiest possible version of a "full stack" project.

---

## 3. What does each file do?

| File | What it is |
|---|---|
| `index.html` | The homepage. Business info, services, prices, reviews. |
| `auth.html` | The sign-up / sign-in page. |
| `dashboard.html` | The page a customer sees after logging in — book an appointment, see their bookings, see their activity, delete their account. |
| `admin.html` | The "backend" view — every account, every booking, every login attempt (including wrong passwords). |
| `style.css` | All the colors, fonts, spacing — makes it look nice. One file, used by every page. |
| `app.js` | All the "thinking" — what happens when you click a button, submit a form, etc. One file, used by every page. |

Every page (`.html` file) is like a **room** in a house. `style.css`
is the paint and furniture style used in every room. `app.js` is the
electricity — the thing that makes buttons actually do something.

---

## 4. How does an account actually get created?

1. You type a name and password on `auth.html` and press "Create account".
2. `app.js` checks: is the password at least 6 characters? Is the
   name already taken?
3. If something's wrong, it shows a red error message immediately —
   no page reload needed.
4. If everything's fine, it saves `{name, password, date}` into the
   browser's storage box, writes down "account created" in an
   activity log (also in the storage box), and sends you straight to
   `dashboard.html` — already logged in.

Logging in works the same way, except it checks your name and
password against what's already stored. Wrong password → red error
message on screen, AND a line gets added to the activity log that
you can see later on `admin.html`, saying exactly what went wrong
("Incorrect password").

---

## 5. Where does the password show/hide (the little eye icon) happen?

Next to every password box there's a small eye button. Clicking it
flips the password box between two modes:
- hidden (dots: `••••••`)
- visible (plain text: `mypassword123`)

This is done in `app.js`, in a function called
`initPasswordToggles()`. It just changes the box's "type" from
`password` to `text` and back, and swaps the open-eye icon for a
closed-eye icon.

---

## 6. What happens when a customer books an appointment?

On `dashboard.html`, under "My bookings", there's a form: pick a
service, pick a date, optionally write a note, press "Request
booking". `app.js` saves that booking into the storage box (tagged
with your name), and it instantly shows up in two places:
1. Your own "My bookings" list, right there on the same page.
2. The "Bookings" table on `admin.html` — because the admin page
   just reads the same storage box.

That's the whole "frontend shows it, backend shows it too" idea in
action.

---

## 7. How do I run it myself, right now, on my own computer?

You don't need to install anything.

1. Find the folder with all these files in it.
2. Double-click `index.html`.
3. It opens in your browser. That's it — the whole site is running.

---

## 8. How do I show it to my teacher ONLINE? (the easy way)

This is the fastest way — about 2 minutes, no account needed.

1. Go to **https://app.netlify.com/drop** in your browser.
2. Drag your whole project folder (the one with `index.html` inside
   it) onto that page.
3. Wait a few seconds. Netlify gives you a live web address, like
   `https://random-name-123.netlify.app`.
4. Open that address on the projector / your teacher's screen. Done
   — it's genuinely live on the internet, anyone with the link can
   open it.

You do **not** need to sign up, buy anything, or write any deployment
commands for this method. Drag, drop, done.

If your teacher wants you to show it from a GitHub repository
instead, that also works — upload the folder to a new GitHub repo,
then in the repo go to **Settings → Pages**, set the source to your
main branch and root folder, and GitHub gives you a similar live
link within a minute or two.

---

## 9. What do I actually say to my teacher? (a script)

Something like this, in your own words:

> "This is a bridal makeup booking website. The homepage shows
> services and prices in taka. A visitor can create an account —
> if the password is too short, it shows an error immediately. If
> they type the wrong password while logging in, it also shows an
> error, and that failed attempt gets written down.
>
> Once logged in, they land on their dashboard, where they can book
> an appointment — pick a service, pick a date — and it shows up in
> their own booking list right away.
>
> There's no separate server — I'm using the browser's built-in
> storage as a stand-in database, which is why this can run
> completely offline or be deployed as a static site with no backend
> hosting needed. The `admin.html` page plays the role of the
> 'backend' — it reads that same stored data and shows every
> account, every booking, and every login attempt, including the
> failed ones, so you can see the wrong-password error was actually
> recorded, not just shown once and forgotten."

That's genuinely everything the project does — you're not leaving
anything out by saying this.

---

## 10. One honest thing to know (say if asked)

Passwords are stored as plain, readable text in the browser's
storage box — fine for a class demo, but never how a real app should
work. A real app would scramble ("hash") the password on an actual
server before saving it, and the "database" would live somewhere a
user's own browser can't just read. If your teacher asks "is this
secure enough for a real business?" — the honest answer is no, and
that's a great sentence to say out loud. It shows you understand
*why* real backends exist, not just how to fake one.
