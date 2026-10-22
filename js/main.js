(function () {
  const images = window.VILLA_IMAGES || {};

  document.querySelectorAll("[data-image]").forEach((img) => {
    const item = images[img.dataset.image];
    if (!item) return;
    img.src = item.src;
    if (item.alt !== undefined) img.alt = item.alt;
    if (item.position) img.style.objectPosition = item.position;
    img.addEventListener("error", () => {
      img.closest(".media, .hero__media, .cta__photo")?.classList.add("is-missing");
    });
  });

  const header = document.querySelector(".header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-nav");

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => {
    setMenu(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const links = [...nav.querySelectorAll("a[href^='#']:not(.btn)")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-45% 0px -48% 0px", threshold: 0.01 }
    );
    sections.forEach((section) => spy.observe(section));
  }

  const dialog = document.querySelector("#lightbox");
  const shot = dialog.querySelector("img");
  const caption = dialog.querySelector("figcaption");
  const items = [...document.querySelectorAll(".gallery__item")];
  let index = 0;

  const show = (next) => {
    index = (next + items.length) % items.length;
    const source = items[index].querySelector("img");
    shot.src = source.currentSrc || source.src;
    shot.alt = source.alt;
    caption.textContent = items[index].dataset.caption || source.alt;
  };

  items.forEach((item, itemIndex) => {
    item.addEventListener("click", () => {
      show(itemIndex);
      dialog.showModal();
    });
  });

  dialog.querySelector(".lightbox__close").addEventListener("click", () => dialog.close());
  dialog.querySelector(".lightbox__prev").addEventListener("click", () => show(index - 1));
  dialog.querySelector(".lightbox__next").addEventListener("click", () => show(index + 1));

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(index + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(index - 1);
    }
  });

  const form = document.querySelector("#enquiry");
  const status = document.querySelector("#form-status");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const dates = String(data.get("dates") || "").trim();
    const message = String(data.get("message") || "").trim();
    let invalid = false;

    form.querySelectorAll("input, textarea").forEach((field) => {
      field.removeAttribute("aria-invalid");
    });

    if (!name) {
      form.elements.name.setAttribute("aria-invalid", "true");
      invalid = true;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      form.elements.email.setAttribute("aria-invalid", "true");
      invalid = true;
    }
    if (invalid) {
      status.textContent = "Please add your name and a valid email.";
      return;
    }

    const contact = window.VILLA_CONTACT || {};
    const body = [`Name: ${name}`, `Email: ${email}`, dates ? `Dates: ${dates}` : "", message]
      .filter(Boolean)
      .join("\n");

    if (contact.email) {
      const href = `mailto:${contact.email}?subject=${encodeURIComponent(
        "Villa Calmora enquiry"
      )}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
      status.textContent = "Your email draft is opening.";
      return;
    }

    status.textContent = `Thank you, ${name}. Nothing was sent yet — add an email address in js/villaImages.js when you want enquiries to open in your mail app.`;
  });
})();
