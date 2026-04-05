const pptxgen = require("pptxgenjs");
const pptx = new pptxgen();

pptx.defineLayout({ name: "LAYOUT", width: 13.33, height: 7.5 });
pptx.layout = "LAYOUT";

const RED = "E53E3E";
const DARK = "2D3748";
const GRAY = "718096";
const WHITE = "FFFFFF";
const LIGHT = "F0F4F8";
const GREEN = "38A169";
const BLUE = "3182CE";

// Helper: red top bar
function topBar(slide) {
  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: 0.06, fill: { color: RED } });
}

// Helper: slide title
function slideTitle(slide, icon, text) {
  slide.addText(icon + " " + text, {
    x: 0.6, y: 0.3, w: 10, h: 0.7,
    fontSize: 24, color: DARK, bold: true, fontFace: "Segoe UI"
  });
  slide.addShape("rect", { x: 0.6, y: 1.0, w: 3, h: 0.04, fill: { color: RED } });
  slide.addText("Lab 9 — GymTrack | Sokolova Sofia", {
    x: 0.6, y: 6.8, w: 5, h: 0.3, fontSize: 9, color: "A0AEC0"
  });
}

// ========== SLIDE 1: Title ==========
const s1 = pptx.addSlide();
s1.background = { color: DARK };
s1.addShape("rect", { x: 0, y: 0, w: "100%", h: 0.06, fill: { type: "solid", color: RED } });
s1.addText("🏋️  GymTrack", {
  x: 0, y: 1.8, w: "100%", h: 1.2,
  fontSize: 44, color: WHITE, bold: true, align: "center", fontFace: "Segoe UI"
});
s1.addText("Track your workouts, see your progress", {
  x: 0, y: 3.0, w: "100%", h: 0.5,
  fontSize: 18, color: "CBD5E0", align: "center", fontFace: "Segoe UI"
});

const info = [
  ["Name", "Sokolova Sofia"],
  ["Email", "sofi.sokolova@innopolis.university"],
  ["Group", "CSE-02"]
];
info.forEach((item, i) => {
  const x = 3.3 + i * 2.4;
  s1.addShape("roundRect", { x, y: 4.0, w: 2.0, h: 0.9, fill: { color: "374151" }, rectRadius: 0.15 });
  s1.addText(item[0], {
    x, y: 4.05, w: 2.0, h: 0.3, fontSize: 8, color: "A0AEC0",
    align: "center", fontFace: "Segoe UI", bold: true
  });
  s1.addText(item[1], {
    x, y: 4.4, w: 2.0, h: 0.35, fontSize: 11, color: WHITE,
    align: "center", fontFace: "Segoe UI"
  });
});
s1.addText("Lab 9 — Quiz and Hackathon", {
  x: 0, y: 6.5, w: "100%", h: 0.3,
  fontSize: 10, color: "718096", align: "center", fontFace: "Segoe UI"
});

// ========== SLIDE 2: Context ==========
const s2 = pptx.addSlide();
s2.background = { color: LIGHT };
topBar(s2);
slideTitle(s2, "📋", "Context");

const cards = [
  { title: "End User", text: "Students and young people who go to the gym regularly and want to track their progress over time.", color: RED },
  { title: "Problem", text: "People track workouts in notes or in their head and lose progress history — they can't see if they're actually improving.", color: RED },
  { title: "Solution", text: "A web application where users log exercises via a simple form, and view their personal progress with interactive charts.", color: RED },
];
cards.forEach((c, i) => {
  const x = 0.6 + i * 4.1;
  s2.addShape("roundRect", { x, y: 1.4, w: 3.8, h: 2.2, fill: { color: WHITE }, rectRadius: 0.12 });
  s2.addShape("rect", { x, y: 1.4, w: 0.06, h: 2.2, fill: { color: c.color } });
  s2.addText(c.title.toUpperCase(), {
    x: x + 0.25, y: 1.6, w: 3.3, h: 0.35, fontSize: 11, color: c.color,
    bold: true, fontFace: "Segoe UI"
  });
  s2.addText(c.text, {
    x: x + 0.25, y: 2.1, w: 3.3, h: 1.3, fontSize: 12, color: "4A5568",
    fontFace: "Segoe UI", lineSpacingMultiple: 1.4
  });
});

// ========== SLIDE 3: Implementation ==========
const s3 = pptx.addSlide();
s3.background = { color: LIGHT };
topBar(s3);
slideTitle(s3, "⚙️", "Implementation");

// V1 and V2 cards
s3.addShape("roundRect", { x: 0.6, y: 1.4, w: 5.8, h: 2.4, fill: { color: WHITE }, rectRadius: 0.12 });
s3.addShape("rect", { x: 0.6, y: 1.4, w: 0.06, h: 2.4, fill: { color: RED } });
s3.addText("VERSION 1 — Core feature", {
  x: 0.9, y: 1.5, w: 5.3, h: 0.3, fontSize: 12, color: RED, bold: true, fontFace: "Segoe UI"
});
s3.addText("User registration/login with JWT auth\nLog exercise sets (exercise, weight, reps)\nView workout history table\nView progress chart (weight over time)\n\nStack: FastAPI, SQLite, Chart.js, HTML/CSS/JS, Docker", {
  x: 0.9, y: 2.0, w: 5.3, h: 1.7, fontSize: 11, color: "4A5568", fontFace: "Segoe UI", lineSpacingMultiple: 1.3
});

s3.addShape("roundRect", { x: 6.7, y: 1.4, w: 5.8, h: 2.4, fill: { color: WHITE }, rectRadius: 0.12 });
s3.addShape("rect", { x: 6.7, y: 1.4, w: 0.06, h: 2.4, fill: { color: RED } });
s3.addText("VERSION 2 — Improvements & polish", {
  x: 7.0, y: 1.5, w: 5.3, h: 0.3, fontSize: 12, color: RED, bold: true, fontFace: "Segoe UI"
});
s3.addText("Added reps bar chart alongside weight line chart\nToday's workout summary\nResponsive mobile-friendly design\nSingle-container deployment\n\nTA feedback addressed: removed Telegram bot,\nmade web app primary client, simplified deployment", {
  x: 7.0, y: 2.0, w: 5.3, h: 1.7, fontSize: 11, color: "4A5568", fontFace: "Segoe UI", lineSpacingMultiple: 1.3
});

// Tech stack row
const stacks = [
  { title: "Backend", text: "FastAPI + aiosqlite\nJWT authentication\nREST API", color: RED },
  { title: "Database", text: "SQLite 3 (ACID)\nUsers + Sets tables\nDocker volume", color: BLUE },
  { title: "Frontend", text: "Vanilla HTML/CSS/JS\nChart.js 4\n3-tab interface", color: "D69E2E" },
];
stacks.forEach((st, i) => {
  const x = 0.6 + i * 4.1;
  s3.addShape("roundRect", { x, y: 4.3, w: 3.8, h: 1.8, fill: { color: WHITE }, rectRadius: 0.12 });
  s3.addShape("rect", { x, y: 4.3, w: 0.06, h: 1.8, fill: { color: st.color } });
  s3.addText(st.title.toUpperCase(), {
    x: x + 0.25, y: 4.5, w: 3.3, h: 0.3, fontSize: 10, color: st.color, bold: true, fontFace: "Segoe UI"
  });
  s3.addText(st.text, {
    x: x + 0.25, y: 4.9, w: 3.3, h: 1.1, fontSize: 11, color: "4A5568", fontFace: "Segoe UI", lineSpacingMultiple: 1.3
  });
});

// ========== SLIDE 4: Demo ==========
const s4 = pptx.addSlide();
s4.background = { color: LIGHT };
topBar(s4);
slideTitle(s4, "🎬", "Demo");

s4.addShape("roundRect", { x: 0.6, y: 1.4, w: 12.1, h: 2.0, fill: { color: WHITE }, rectRadius: 0.15 });
s4.addShape("ellipse", { x: 5.9, y: 1.8, w: 1.0, h: 1.0, fill: { color: RED } });
// Play triangle
s4.addShape("triangle", { x: 6.2, y: 2.05, w: 0.55, h: 0.5, fill: { color: WHITE }, shapeName: "play" });
s4.addText("GymTrack — Video Demonstration", {
  x: 0.6, y: 3.5, w: 12.1, h: 0.35, fontSize: 14, color: DARK, bold: true, align: "center", fontFace: "Segoe UI"
});
s4.addText("Pre-recorded walkthrough of Version 2 with voice-over (~2 min)", {
  x: 0.6, y: 3.9, w: 12.1, h: 0.3, fontSize: 11, color: GRAY, align: "center", fontFace: "Segoe UI"
});

// Screenshots row
const demos = [
  { icon: "🔐", title: "Registration", desc: "Create account with\nusername + password,\nJWT auth" },
  { icon: "📝", title: "Log Workout", desc: "Select exercise, enter\nweight & reps, save\nto database" },
  { icon: "📊", title: "Progress Charts", desc: "Weight line chart +\nReps bar chart\nover time" },
];
demos.forEach((d, i) => {
  const x = 0.6 + i * 4.1;
  s4.addShape("roundRect", { x, y: 4.6, w: 3.8, h: 1.8, fill: { color: "EDF2F7" }, rectRadius: 0.1 });
  s4.addText(d.icon, { x, y: 4.65, w: 3.8, h: 0.5, fontSize: 24, align: "center", fontFace: "Segoe UI" });
  s4.addText(d.title, {
    x, y: 5.15, w: 3.8, h: 0.25, fontSize: 12, color: DARK, bold: true, align: "center", fontFace: "Segoe UI"
  });
  s4.addText(d.desc, {
    x, y: 5.45, w: 3.8, h: 0.8, fontSize: 9, color: GRAY, align: "center", fontFace: "Segoe UI"
  });
});

// ========== SLIDE 5: Links ==========
const s5 = pptx.addSlide();
s5.background = { color: LIGHT };
topBar(s5);
slideTitle(s5, "🔗", "Links");

// GitHub card
s5.addShape("roundRect", { x: 0.6, y: 1.4, w: 5.8, h: 3.5, fill: { color: WHITE }, rectRadius: 0.12 });
s5.addShape("rect", { x: 0.6, y: 1.4, w: 0.06, h: 3.5, fill: { color: DARK } });
s5.addText("📂  GitHub Repository", {
  x: 0.9, y: 1.55, w: 5.3, h: 0.35, fontSize: 14, color: DARK, bold: true, fontFace: "Segoe UI"
});
s5.addText("https://github.com/s0ftach/se-toolkit-hackathon", {
  x: 0.9, y: 2.0, w: 5.3, h: 0.5, fontSize: 10, color: RED, fontFace: "Segoe UI"
});
s5.addText("MIT License • Open source\nFull source code, README,\ndocker-compose.yml, deploy.sh", {
  x: 0.9, y: 2.6, w: 5.3, h: 1.0, fontSize: 11, color: "4A5568", fontFace: "Segoe UI", lineSpacingMultiple: 1.3
});

// Deployed card
s5.addShape("roundRect", { x: 6.7, y: 1.4, w: 5.8, h: 3.5, fill: { color: WHITE }, rectRadius: 0.12 });
s5.addShape("rect", { x: 6.7, y: 1.4, w: 0.06, h: 3.5, fill: { color: GREEN } });
s5.addText("🌐  Deployed Product", {
  x: 7.0, y: 1.55, w: 5.3, h: 0.35, fontSize: 14, color: DARK, bold: true, fontFace: "Segoe UI"
});
s5.addText("http://10.93.25.98/", {
  x: 7.0, y: 2.0, w: 5.3, h: 0.5, fontSize: 10, color: RED, fontFace: "Segoe UI"
});
s5.addText("Hosted on university VM\nUbuntu 24.04, Docker Compose\nSingle container: FastAPI + SQLite", {
  x: 7.0, y: 2.6, w: 5.3, h: 1.0, fontSize: 11, color: "4A5568", fontFace: "Segoe UI", lineSpacingMultiple: 1.3
});

s5.addText("Note: HTTP port may be blocked from outside university network.\nAccess via SSH tunnel:  ssh -L 8080:127.0.0.1:80 root@10.93.25.98", {
  x: 0.6, y: 5.3, w: 12.1, h: 0.5, fontSize: 9, color: GRAY, fontFace: "Segoe UI", align: "center"
});

// Save
pptx.writeFile({ fileName: "GymTrack_Presentation.pptx" });
console.log("✅ Presentation saved to GymTrack_Presentation.pptx");
