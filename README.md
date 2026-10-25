# 📰 The Algorithm Times: Portfolio

A newspaper-themed personal portfolio where every section is a "page" of a daily edition. Built with plain HTML, CSS and JavaScript, with a **page-turn transition** between sections.

🔗 **Live site:** shambhavi-portfolio-eta.vercel.app

---

## ✨ Features

- **Newspaper design:** masthead, edition date, columns, classified-ad style skill cards, serif typography and a paper-toned palette.
- **Page-turn transition:** clicking a navbar link curls the current page away like a real newspaper page and reveals the next section.
  - Going to a later section turns the page forward; going to an earlier one turns it backward.
  - Built from scratch in vanilla JS and CSS 3D transforms, with no libraries.
  - Respects the OS "reduce motion" setting and falls back to normal navigation if anything goes wrong.
- **Landing page:** a loading screen that opens "Today's Edition" before the main portfolio.
- **Fully responsive:** works on desktop, tablet and mobile.
- **Working contact form:** messages are sent straight to my inbox using [EmailJS](https://www.emailjs.com/).
- **Downloadable resume** and certificate previews.

## 🗂️ Sections

| Page | What's inside |
|------|---------------|
| `landing.html` | Loading screen and entry to the edition |
| `index.html` | Home: about me, highlights, quick facts |
| `pages/skills2.html` | Skills & Expertise: languages, web, data science, AI/GenAI |
| `pages/projects.html` | Featured projects |
| `pages/experience.html` | Experience, internships and certifications |
| `pages/achievements.html` | Achievements and milestones |
| `pages/contact.html` | Contact form |

## 🛠️ Tech Stack

- **HTML5**, **CSS3**, **JavaScript (ES6)**
- **EmailJS** for the contact form
- **Vercel** for hosting

## 📁 Project Structure

```
.
├── landing.html          # Entry page
├── index.html            # Home
├── vercel.json           # Sends the root URL to landing.html
├── pages/                # Skills, Projects, Experience, Achievements, Contact
├── css/                  # One stylesheet per page + shared style.css / responsive.css
├── javascript/
│   ├── landing.js        # Landing page logic
│   ├── index.js          # Home page logic
│   ├── contact.js        # EmailJS contact form
│   └── page-turn.js      # Page-turn transition
└── images/               # Photos, project screenshots, certificates, resume
```

## 🚀 Run Locally

No build step needed.

```bash
# 1. Clone the repo
git clone https://github.com/gargshambhavi0802-pixel/My-Portfolio.git
cd My-Portfolio

# 2. Serve it (any static server works)
python -m http.server 8000
```

Then open `http://localhost:8000/landing.html`.

> You can also open `landing.html` directly in a browser, but a local server is closer to how it behaves when deployed.

## 🎞️ Customising the Page Turn

All options live at the top of `javascript/page-turn.js`, or you can override them before the script loads:

```html
<script>
  window.PAGE_TURN = { duration: 1400, strips: 20, bend: 70 };
</script>
<script src="javascript/page-turn.js" defer></script>
```

| Option | Default | Effect |
|--------|---------|--------|
| `duration` | `1150` | Length of the turn (ms) |
| `strips` | `16` | Smoothness of the curl |
| `bend` | `58` | How much the paper curls |
| `perspective` | `2600` | Lower = more dramatic 3D |

To use the transition on a new page, add this inside `<head>` (use `../javascript/...` for files inside `pages/`):

```html
<script src="javascript/page-turn.js" defer></script>
```

## ☁️ Deployment

Deployed on **Vercel** as a static site (Framework Preset: *Other*, no build command). Every push to `main` redeploys automatically.

## 📬 Contact

- 🌐 Portfolio: shambhavi-portfolio-eta.vercel.app
- 💼 LinkedIn: https://www.linkedin.com/in/shambhavi-garg-641147383?utm_source=share_via&utm_content=profile&utm_medium=member_android
- 🐙 GitHub: https://github.com/gargshambhavi0802-pixel

