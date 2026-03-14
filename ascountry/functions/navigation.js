let currentPage = "home";

function showPage(pageName) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.classList.add("active");
    currentPage = pageName;

    window.scrollTo({ top: 0, behavior: "smooth" });

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.classList.remove("active");
    });

    const activeLink = document.querySelector(`.nav-links a[onclick*="${pageName}"]`);
    if (activeLink) activeLink.classList.add("active");

    closeMobileMenu();

    if (typeof initReveal === "function") {
      setTimeout(() => initReveal(), 100);
    }
  }
}

function scrollToSection(sectionId) {
  setTimeout(() => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offsetPosition = section.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  }, 100);
}

function filterCategory(category) {
  showPage("produtos");
  setTimeout(() => {
    if (typeof renderProducts === "function") {
      renderProducts(category);
    } else {
      setTimeout(() => {
        if (typeof renderProducts === "function") renderProducts(category);
      }, 200);
    }
  }, 400);
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById("mm");
  if (mobileMenu) mobileMenu.classList.remove("open");
}

window.mobileNav = function (pageName) {
  closeMobileMenu();
  showPage(pageName);
  return false;
};

document.addEventListener("click", (e) => {
  if (e.target.id === "mm") closeMobileMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMobileMenu();
});

document.addEventListener("DOMContentLoaded", () => {
  showPage("home");
});

window.showPage = showPage;
window.scrollToSection = scrollToSection;
window.filterCategory = filterCategory;
window.closeMobileMenu = closeMobileMenu;
