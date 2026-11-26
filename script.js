/* ============================================================
   Dominion Care Pharmacy — interactions
   ============================================================ */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "233257979871";
  var WA_BASE = "https://wa.me/" + WHATSAPP_NUMBER;

  function openWhatsApp(message) {
    var url = WA_BASE + "?text=" + encodeURIComponent(message);
    var win = window.open(url, "_blank");
    if (win) {
      try { win.opener = null; } catch (e) { /* cross-origin safe */ }
    } else {
      window.location.href = url;
    }
  }

  function value(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Mobile navigation ---------- */
  var toggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  function closeNav() {
    if (!navLinks || !toggle) return;
    navLinks.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
  }

  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", function (event) {
      if (!navLinks.classList.contains("is-open")) return;
      if (!navLinks.contains(event.target) && !toggle.contains(event.target)) closeNav();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------- Category tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".cat-card"));
  var filterStatus = document.getElementById("filterStatus");

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var filter = tab.getAttribute("data-filter");

      tabs.forEach(function (other) {
        var active = other === tab;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-selected", String(active));
      });

      var shown = 0;
      cards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        card.hidden = !match;
        if (match) shown += 1;
      });

      if (filterStatus) {
        filterStatus.textContent = "Showing " + shown + " essentials in " + tab.textContent.trim() + ".";
      }
    });
  });

  /* ---------- One-tap product inquiries ---------- */
  document.querySelectorAll(".inquire").forEach(function (button) {
    button.addEventListener("click", function () {
      var item = button.getAttribute("data-item") || "this item";
      openWhatsApp(
        "Hello Dominion Care Pharmacy! I'd like to inquire about *" + item + "*.\n\n" +
        "Is it available today? Please let me know the price and whether a prescription is needed. Thank you."
      );
    });
  });

  /* ---------- Prescription request form ---------- */
  var form = document.getElementById("requestForm");
  var preview = document.getElementById("messagePreview");
  var formNote = document.getElementById("formNote");

  function selectedDelivery() {
    var checked = form ? form.querySelector('input[name="delivery"]:checked') : null;
    return checked ? checked.value : "Express Delivery in Ho";
  }

  function buildRequestMessage() {
    return [
      "🩺 *PRESCRIPTION & MEDICATION REQUEST*",
      "━━━━━━━━━━━━━━━━━━━━━━",
      "*Patient:* " + (value("patientName") || "—"),
      "*Phone:* " + (value("patientPhone") || "—"),
      "",
      "*Medication needed / hospital note:*",
      value("medicationNote") || "—",
      "",
      "*Delivery option:* " + selectedDelivery(),
      "*Delivery landmark:* " + (value("landmark") || "Not specified"),
      "━━━━━━━━━━━━━━━━━━━━━━",
      "Please confirm availability, prescription requirements and the total cost. Thank you!"
    ].join("\n");
  }

  function updatePreview() {
    if (preview) preview.textContent = buildRequestMessage();
  }

  function setNote(message, state) {
    if (!formNote) return;
    formNote.textContent = message;
    formNote.classList.remove("is-success", "is-error");
    if (state) formNote.classList.add("is-" + state);
  }

  if (form) {
    ["patientName", "patientPhone", "medicationNote", "landmark"].forEach(function (id) {
      var field = document.getElementById(id);
      if (!field) return;
      field.addEventListener("input", function () {
        field.classList.remove("is-invalid");
        updatePreview();
      });
    });

    form.querySelectorAll('input[name="delivery"]').forEach(function (radio) {
      radio.addEventListener("change", updatePreview);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var required = ["patientName", "patientPhone", "medicationNote"];
      var firstInvalid = null;

      required.forEach(function (id) {
        var field = document.getElementById(id);
        if (!field) return;
        var invalid = field.value.trim() === "";
        field.classList.toggle("is-invalid", invalid);
        field.setAttribute("aria-invalid", String(invalid));
        if (invalid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        setNote("Please complete the highlighted fields before sending your request.", "error");
        firstInvalid.focus();
        return;
      }

      var message = buildRequestMessage();
      setNote("Request ready — WhatsApp should open in a new tab. If it doesn't, please allow pop-ups for this site.", "success");
      openWhatsApp(message);
    });

    updatePreview();
  }

  /* Hero CTA: jump to the request tool and prepare the first field on desktop */
  var heroRequest = document.getElementById("heroRequest");
  if (heroRequest) {
    heroRequest.addEventListener("click", function () {
      if (window.matchMedia("(min-width: 901px)").matches) {
        window.setTimeout(function () {
          var nameField = document.getElementById("patientName");
          if (nameField) nameField.focus({ preventScroll: true });
        }, 650);
      }
    });
  }

  /* ---------- Subtle scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { observer.observe(el); });
  }
})();
