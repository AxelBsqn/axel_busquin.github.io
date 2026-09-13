(() => {
  "use strict";

  const SECTION_IDS = ["biographie", "travaux", "projets", "pedagogie", "ressources"];
  const DEFAULT_SECTION = "biographie";

  const panelIds = new Set(SECTION_IDS);
  const navButtons = Array.from(document.querySelectorAll("[data-panel-target]"));
  const mobileSelect = document.getElementById("mobile-section");
  const loadingState = document.getElementById("loading-state");
  const pdfDialog = document.getElementById("pdf-dialog");
  const pdfFrame = document.getElementById("pdf-frame");
  const pdfTitle = document.getElementById("pdf-dialog-title");
  const pdfExternalLink = document.getElementById("pdf-open-external");
  const pdfCloseButton = document.getElementById("pdf-close");

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function nonEmpty(value) {
    return typeof value === "string" && value.trim() ? value.trim() : "";
  }

  function tagsFrom(value) {
    if (Array.isArray(value)) return value.map(nonEmpty).filter(Boolean);
    if (typeof value === "string") return value.split(",").map(nonEmpty).filter(Boolean);
    return [];
  }

  function safeWebUrl(value) {
    const candidate = nonEmpty(value);
    if (!candidate) return "";

    try {
      const url = new URL(candidate, document.baseURI);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function documentUrl(value) {
    const candidate = nonEmpty(value);
    if (!candidate) return "";

    try {
      const parsed = new URL(candidate, document.baseURI);
      if (!["http:", "https:"].includes(parsed.protocol)) return "";

      if (/^https?:\/\//i.test(candidate)) return parsed.href;

      // Pages CMS enregistre par défaut « /media/... ». En retirant le slash,
      // le document fonctionne aussi sur une GitHub Project Page (/nom-du-depot/).
      const siteRoot = new URL("./", document.baseURI);
      return new URL(candidate.replace(/^\/+/, ""), siteRoot).href;
    } catch {
      return "";
    }
  }

  function setText(selector, value) {
    const content = nonEmpty(value);
    if (!content) return;
    document.querySelectorAll(selector).forEach(node => {
      node.textContent = content;
    });
  }

  function addTags(parent, tags, label = "Mots-clés") {
    const values = tagsFrom(tags);
    if (!values.length) return;

    const list = element("ul", "chip-list");
    list.setAttribute("aria-label", label);
    values.forEach(tag => list.append(element("li", "chip", tag)));
    parent.append(list);
  }

  function actionLink(label, url, className = "text-link") {
    const href = safeWebUrl(url);
    if (!href || !nonEmpty(label)) return null;

    const link = element("a", className, label);
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }

  function statusBadge(value) {
    const status = nonEmpty(value);
    return status ? element("span", "status-badge", status) : null;
  }

  function renderTextBlock(block) {
    const card = element("article", `block-card content-card${block.wide ? " block-wide" : ""}`);
    const kicker = nonEmpty(block.kicker);
    const title = nonEmpty(block.title);
    const body = nonEmpty(block.body);

    if (kicker) card.append(element("p", "block-kicker", kicker));
    if (title) card.append(element("h2", "", title));
    if (body) card.append(element("p", `block-body${block.statement ? " statement" : ""}`, body));
    addTags(card, block.tags);

    const link = actionLink(block.link_label, block.link_url);
    if (link) {
      const actions = element("div", "block-actions");
      actions.append(link);
      card.append(actions);
    }
    return card;
  }

  function renderTimelineBlock(block) {
    const card = element("article", "block-card block-wide work-card");
    const meta = element("div", "work-meta", nonEmpty(block.label) || "Parcours");
    const date = nonEmpty(block.date);
    if (date) meta.append(element("span", "work-date", date));

    const content = element("div", "work-content");
    const title = nonEmpty(block.title);
    const body = nonEmpty(block.body);
    if (title) content.append(element("h2", "", title));
    if (body) content.append(element("p", "block-body", body));
    addTags(content, block.tags);

    const link = actionLink(block.link_label, block.link_url);
    if (link) {
      const actions = element("div", "block-actions");
      actions.append(link);
      content.append(actions);
    }

    card.append(meta, content);
    const badge = statusBadge(block.status);
    if (badge) card.append(badge);
    return card;
  }

  function renderProjectBlock(block) {
    const card = element("article", "block-card project-card");
    const top = element("div", "block-top");
    top.append(element("span", "project-code", nonEmpty(block.code) || "•"));
    const badge = statusBadge(block.status);
    if (badge) top.append(badge);
    card.append(top);

    const title = nonEmpty(block.title);
    const body = nonEmpty(block.body);
    if (title) card.append(element("h2", "", title));
    if (body) card.append(element("p", "block-body", body));
    addTags(card, block.tags);

    const category = nonEmpty(block.category);
    const link = actionLink(block.link_label || "Voir le projet →", block.link_url);
    if (category || link) {
      const footer = element("div", "block-footer");
      footer.append(element("span", "block-category", category));
      if (link) footer.append(link);
      card.append(footer);
    }
    return card;
  }

  function renderPdfBlock(block) {
    const card = element("article", "block-card pdf-card");
    const top = element("div", "block-top");
    top.append(element("span", "pdf-symbol", "PDF"));
    const badge = statusBadge(block.status);
    if (badge) top.append(badge);
    card.append(top);

    const title = nonEmpty(block.title) || "Document PDF";
    const body = nonEmpty(block.body);
    card.append(element("h2", "", title));
    if (body) card.append(element("p", "block-body", body));
    addTags(card, block.tags);

    const url = documentUrl(block.file);
    if (!url) {
      card.append(element("p", "pdf-placeholder", "Document à ajouter depuis l’administration."));
      return card;
    }

    const actions = element("div", "block-actions");
    const readButton = element("button", "action action-primary action-small", "Lire le PDF");
    readButton.type = "button";
    readButton.addEventListener("click", () => openPdf(url, title));

    const external = element("a", "action action-outline action-small", "Ouvrir ↗");
    external.href = url;
    external.target = "_blank";
    external.rel = "noopener noreferrer";
    actions.append(readButton, external);
    card.append(actions);
    return card;
  }

  function renderLinkBlock(block) {
    const card = element("article", "block-card resource-card");
    const head = element("div", "resource-head");
    head.append(element("span", "resource-symbol", nonEmpty(block.symbol) || "↗"));
    head.append(element("p", "resource-category", nonEmpty(block.category) || "Ressource"));
    card.append(head);

    const title = nonEmpty(block.title);
    const body = nonEmpty(block.body);
    if (title) card.append(element("h2", "", title));
    if (body) card.append(element("p", "block-body", body));
    const link = actionLink(block.link_label || "Consulter la ressource →", block.link_url);
    if (link) card.append(link);
    return card;
  }

  function renderBlock(block) {
    if (!block || typeof block !== "object") return null;

    switch (block.type) {
      case "texte": return renderTextBlock(block);
      case "parcours": return renderTimelineBlock(block);
      case "projet": return renderProjectBlock(block);
      case "pdf": return renderPdfBlock(block);
      case "lien": return renderLinkBlock(block);
      default: return null;
    }
  }

  function renderBlocks(sectionId, blocks) {
    const container = document.querySelector(`[data-blocks="${sectionId}"]`);
    if (!container) return;
    container.replaceChildren();

    const visibleBlocks = Array.isArray(blocks)
      ? blocks.filter(block => block && block.published !== false)
      : [];

    visibleBlocks.forEach(block => {
      const rendered = renderBlock(block);
      if (rendered) container.append(rendered);
    });

    if (!container.children.length) {
      const empty = element("div", "empty-card");
      empty.append(
        element("strong", "", "Cette rubrique sera bientôt enrichie"),
        document.createTextNode("De nouveaux contenus peuvent être ajoutés depuis l’administration.")
      );
      container.append(empty);
    }
  }

  function renderDisplayName(name) {
    const heading = document.querySelector("[data-profile-name]");
    const fullName = nonEmpty(name);
    if (!heading || !fullName) return;

    const parts = fullName.split(/\s+/);
    const last = parts.pop();
    heading.replaceChildren(document.createTextNode(parts.length ? `${parts.join(" ")} ` : ""));
    heading.append(element("span", "", last));
  }

  function configureLink(node, url) {
    const href = safeWebUrl(url);
    if (!node || !href) {
      if (node) {
        node.removeAttribute("href");
        node.classList.add("is-disabled");
        node.setAttribute("aria-disabled", "true");
        node.title = "Lien à renseigner depuis l’administration";
      }
      return;
    }

    node.href = href;
    node.classList.remove("is-disabled");
    node.removeAttribute("aria-disabled");
    node.removeAttribute("title");
  }

  function renderProfile(profile = {}) {
    setText('[data-profile="name"]', profile.name);
    setText('[data-profile="role"]', profile.role);
    setText('[data-profile="tagline"]', profile.tagline);
    setText('[data-profile="location"]', profile.location);
    setText('[data-profile="footer_note"]', profile.footer_note);
    renderDisplayName(profile.name);

    const name = nonEmpty(profile.name) || "Portfolio";
    const role = nonEmpty(profile.role) || "Portfolio professionnel";
    document.title = `${name} — ${role}`;

    const description = nonEmpty(profile.meta_description) || nonEmpty(profile.tagline);
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.content = description;

    const contact = document.getElementById("contact-link");
    const email = nonEmpty(profile.email);
    if (email && email.includes("@")) {
      contact.href = `mailto:${email}`;
      contact.classList.remove("is-disabled");
      contact.removeAttribute("aria-disabled");
    } else {
      contact.removeAttribute("href");
      contact.classList.add("is-disabled");
      contact.setAttribute("aria-disabled", "true");
      contact.title = "Adresse à renseigner depuis l’administration";
    }

    configureLink(document.getElementById("github-nav-link"), profile.github_url);

    const cvButton = document.getElementById("cv-button");
    const cvFile = documentUrl(profile.cv_pdf);
    const cvUrl = safeWebUrl(profile.cv_url);
    if (cvFile || cvUrl) {
      cvButton.disabled = false;
      cvButton.classList.remove("is-disabled");
      cvButton.addEventListener("click", () => {
        if (cvFile) openPdf(cvFile, `CV — ${name}`);
        else window.open(cvUrl, "_blank", "noopener,noreferrer");
      });
    } else {
      cvButton.disabled = true;
      cvButton.classList.add("is-disabled");
      cvButton.title = "CV à ajouter depuis l’administration";
    }
  }

  function renderSection(sectionId, section = {}) {
    ["eyebrow", "title", "intro"].forEach(field => {
      const value = nonEmpty(section[field]);
      if (!value) return;
      document.querySelectorAll(`[data-section="${sectionId}"][data-field="${field}"]`).forEach(node => {
        node.textContent = value;
      });
    });

    const label = nonEmpty(section.nav_label);
    if (label) {
      const navLabel = document.querySelector(`[data-panel-target="${sectionId}"] span:last-child`);
      const option = mobileSelect.querySelector(`option[value="${sectionId}"]`);
      if (navLabel) navLabel.textContent = label;
      if (option) option.textContent = label;
    }

    renderBlocks(sectionId, section.blocks);
  }

  function activatePanel(panelId, updateAddress = true) {
    const targetId = panelIds.has(panelId) ? panelId : DEFAULT_SECTION;

    document.querySelectorAll("[data-panel]").forEach(panel => {
      panel.hidden = panel.id !== targetId;
    });

    navButtons.forEach(button => {
      if (button.dataset.panelTarget === targetId) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    mobileSelect.value = targetId;
    if (updateAddress) history.replaceState(null, "", `#${targetId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openPdf(url, title) {
    const href = documentUrl(url);
    if (!href) return;

    if (!pdfDialog || typeof pdfDialog.showModal !== "function") {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }

    pdfTitle.textContent = nonEmpty(title) || "Document PDF";
    pdfFrame.src = href;
    pdfExternalLink.href = href;
    pdfDialog.showModal();
  }

  function closePdf() {
    if (pdfDialog.open) pdfDialog.close();
    pdfFrame.removeAttribute("src");
    pdfExternalLink.removeAttribute("href");
  }

  function showLoadError() {
    const container = document.querySelector('[data-blocks="biographie"]');
    if (!container) return;
    container.replaceChildren();
    const card = element("div", "error-card");
    card.append(
      element("strong", "", "Le contenu n’a pas pu être chargé"),
      document.createTextNode("Vérifiez que le site est servi par GitHub Pages ou par un serveur local, puis rechargez la page.")
    );
    container.append(card);
  }

  async function loadContent() {
    try {
      const contentUrl = new URL("content/site.json", document.baseURI);
      const response = await fetch(contentUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const content = await response.json();

      renderProfile(content.profile);
      SECTION_IDS.forEach(sectionId => renderSection(sectionId, content[sectionId]));
    } catch (error) {
      console.error("Impossible de charger content/site.json", error);
      showLoadError();
    } finally {
      loadingState.hidden = true;
    }
  }

  navButtons.forEach(button => {
    button.addEventListener("click", () => activatePanel(button.dataset.panelTarget));
  });

  mobileSelect.addEventListener("change", event => activatePanel(event.target.value));
  window.addEventListener("hashchange", () => activatePanel(window.location.hash.slice(1), false));

  pdfCloseButton.addEventListener("click", closePdf);
  pdfDialog.addEventListener("close", () => {
    pdfFrame.removeAttribute("src");
    pdfExternalLink.removeAttribute("href");
  });
  pdfDialog.addEventListener("click", event => {
    if (event.target === pdfDialog) closePdf();
  });

  document.getElementById("current-year").textContent = new Date().getFullYear();
  activatePanel(window.location.hash.slice(1), false);
  loadContent();
})();
