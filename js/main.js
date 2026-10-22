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

  const contact = window.VILLA_CONTACT || {};
  const mailBlock = document.querySelector("[data-contact-email]");
  if (contact.email && mailBlock) {
    const link = mailBlock.querySelector("[data-email-link]");
    link.href = `mailto:${contact.email}`;
    link.textContent = contact.email;
    mailBlock.hidden = false;
  }

  const mapsLink = document.querySelector("[data-maps]");
  if (contact.maps && mapsLink) {
    mapsLink.href = contact.maps;
    mapsLink.hidden = false;
  }

  const socialList = document.querySelector(".footer__social");
  document.querySelectorAll("[data-social]").forEach((link) => {
    const url = contact.social && contact.social[link.dataset.social];
    if (!url) return;
    link.href = url;
    link.hidden = false;
    if (socialList) socialList.classList.add("is-on");
  });

  const form = document.querySelector("#enquiry");
  const status = document.querySelector("#form-status");
  const checkin = form.elements.checkin;
  const checkout = form.elements.checkout;
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  checkin.min = today;
  checkout.min = today;

  const markDate = (input) => {
    input.classList.toggle("is-empty", !input.value);
  };
  markDate(checkin);
  markDate(checkout);

  const syncCheckout = () => {
    checkout.min = checkin.value || today;
    markDate(checkin);
    if (checkin.value && checkout.value && checkout.value < checkin.value) {
      checkout.value = "";
      markDate(checkout);
      checkout.setAttribute("aria-invalid", "true");
      status.textContent = "Check-out must be on or after check-in.";
    } else {
      checkout.removeAttribute("aria-invalid");
    }
  };

  checkin.addEventListener("change", syncCheckout);
  checkout.addEventListener("change", () => {
    markDate(checkout);
    if (checkin.value && checkout.value && checkout.value < checkin.value) {
      checkout.setAttribute("aria-invalid", "true");
      status.textContent = "Check-out must be on or after check-in.";
      checkout.value = "";
      markDate(checkout);
      return;
    }
    checkout.removeAttribute("aria-invalid");
    if (status.textContent.startsWith("Check-out")) status.textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const arrival = String(data.get("checkin") || "").trim();
    const departure = String(data.get("checkout") || "").trim();
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
    if (arrival && arrival < today) {
      checkin.setAttribute("aria-invalid", "true");
      invalid = true;
    }
    if ((departure && departure < today) || (departure && arrival && departure < arrival)) {
      checkout.setAttribute("aria-invalid", "true");
      invalid = true;
    }
    if (invalid) {
      status.textContent = "Please check your name, email, and dates.";
      return;
    }

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      arrival ? `Check-in: ${arrival}` : "",
      departure ? `Check-out: ${departure}` : "",
      message,
    ]
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
