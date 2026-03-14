const observerOptions = {
  threshold: 0.05,
  rootMargin: "0px 0px -30px 0px",
};

let revealObserver;

function createRevealObserver() {
  if (revealObserver) revealObserver.disconnect();

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("vis");
    });
  }, observerOptions);
}

function initReveal() {
  if (!revealObserver) createRevealObserver();

  document.querySelectorAll(".reveal").forEach((el) => {
    if (!el.classList.contains("vis")) revealObserver.observe(el);
  });

  setTimeout(() => {
    document.querySelectorAll(".reveal").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add("vis");
    });
  }, 50);
}

let lastScroll = 0;

function handleNavScroll() {
  const nav = document.querySelector("nav");
  if (!nav) return;
  const currentScroll = window.pageYOffset;
  nav.classList.toggle("scrolled", currentScroll > 100);
  lastScroll = currentScroll;
}

window.addEventListener("scroll", handleNavScroll, { passive: true });

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href === "#!") return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  createRevealObserver();
  initReveal();
  initSmoothScroll();

  setTimeout(() => {
    document.querySelectorAll(".reveal").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add("vis");
    });
  }, 100);
});

const originalShowPage = window.showPage;
if (typeof originalShowPage === "function") {
  window.showPage = function (pageName) {
    originalShowPage(pageName);
    setTimeout(() => initReveal(), 100);
  };
}

window.initReveal = initReveal;
window.createRevealObserver = createRevealObserver;
