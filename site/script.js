const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((element) => revealObserver.observe(element));

const counters = document.querySelectorAll("[data-count]");
let countersStarted = false;

function animateCounters() {
  if (countersStarted) return;
  const statsBand = document.querySelector(".stats-band");
  if (!statsBand || statsBand.getBoundingClientRect().top > window.innerHeight - 80) return;

  countersStarted = true;
  counters.forEach((counter) => {
    const target = Number(counter.dataset.count);
    const duration = 900;
    const startedAt = performance.now();

    function tick(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const suffix = counter.dataset.suffix || "";
      counter.textContent = `${Math.round(target * progress)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

window.addEventListener("scroll", animateCounters, { passive: true });
window.addEventListener("load", animateCounters);

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll(".filters").forEach((filters) => {
  const portfolioSection = filters.closest("section");
  const portfolioCards = portfolioSection ? portfolioSection.querySelectorAll(".portfolio-card[data-category]") : [];

  filters.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.filter || "all";

      filters.querySelectorAll("[data-filter]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      portfolioCards.forEach((card) => {
        const shouldShow = selectedFilter === "all" || card.dataset.category === selectedFilter;
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });
});

document.querySelectorAll("[data-slider]").forEach((slider) => {
  const slides = Array.from(slider.querySelectorAll("img"));
  if (slides.length < 2) return;

  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (activeIndex < 0) activeIndex = 0;
  slides[activeIndex].classList.add("is-active");

  window.setInterval(() => {
    slides[activeIndex].classList.remove("is-active");
    activeIndex = (activeIndex + 1) % slides.length;
    slides[activeIndex].classList.add("is-active");
  }, 3600);
});

document.querySelectorAll("[data-hero-slider]").forEach((slider) => {
  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  if (slides.length < 2) return;

  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (activeIndex < 0) activeIndex = 0;
  slides[activeIndex].classList.add("is-active");

  window.setInterval(() => {
    slides[activeIndex].classList.remove("is-active");
    activeIndex = (activeIndex + 1) % slides.length;
    slides[activeIndex].classList.add("is-active");
  }, 3600);
});

const techDetails = {
  flutter: {
    title: "Flutter",
    description: "Flutter permet de créer des applications mobiles modernes pour Android et iOS avec une seule base de code.",
    benefits: [
      "Développement plus rapide pour lancer une application mobile.",
      "Interface fluide, cohérente et proche du rendu natif.",
      "Maintenance simplifiée grâce à un code partagé.",
    ],
  },
  react: {
    title: "React",
    description: "React sert à construire des interfaces web dynamiques, rapides et faciles à faire évoluer.",
    benefits: [
      "Expérience utilisateur réactive sur les plateformes web.",
      "Composants réutilisables pour accélérer les développements.",
      "Écosystème solide pour connecter API, tableaux de bord et applications métiers.",
    ],
  },
  nextjs: {
    title: "Next.js",
    description: "Next.js est un framework React conçu pour les sites rapides, bien structurés et optimisés pour le référencement.",
    benefits: [
      "Chargement rapide des pages et meilleure performance SEO.",
      "Architecture adaptée aux sites vitrines, plateformes et dashboards.",
      "Déploiement moderne avec rendu serveur ou statique selon le besoin.",
    ],
  },
  laravel: {
    title: "Laravel",
    description: "Laravel est un framework PHP robuste pour créer des backends, API REST et applications métiers sécurisées.",
    benefits: [
      "Développement backend structuré et maintenable.",
      "Gestion efficace de l'authentification, des rôles et des données.",
      "Bon choix pour les plateformes internes et outils de gestion.",
    ],
  },
  nodejs: {
    title: "Node.js",
    description: "Node.js permet de créer des API rapides et des services temps réel avec JavaScript côté serveur.",
    benefits: [
      "API performantes pour applications web et mobiles.",
      "Bonne base pour messagerie, notifications et traitements temps réel.",
      "Stack JavaScript cohérente entre frontend et backend.",
    ],
  },
  typescript: {
    title: "TypeScript",
    description: "TypeScript ajoute un typage fiable à JavaScript pour réduire les bugs et mieux structurer les projets.",
    benefits: [
      "Moins d'erreurs lors des évolutions du code.",
      "Meilleure lisibilité sur les projets complexes.",
      "Collaboration plus simple entre développeurs.",
    ],
  },
  python: {
    title: "Python",
    description: "Python est utilisé pour l'automatisation, l'analyse de données, les scripts backend et les projets d'intelligence artificielle.",
    benefits: [
      "Rapide pour prototyper des outils IA et automatisations.",
      "Écosystème puissant pour data, machine learning et API.",
      "Idéal pour connecter des processus métiers intelligents.",
    ],
  },
  aws: {
    title: "AWS",
    description: "AWS fournit l'infrastructure cloud pour héberger, sécuriser et faire évoluer les applications.",
    benefits: [
      "Hébergement scalable selon la croissance du projet.",
      "Services cloud pour stockage, calcul, bases de données et sécurité.",
      "Bonne disponibilité pour les applications professionnelles.",
    ],
  },
  docker: {
    title: "Docker",
    description: "Docker emballe une application avec ses dépendances pour garantir un fonctionnement stable sur chaque environnement.",
    benefits: [
      "Déploiements plus fiables entre développement et production.",
      "Installation simplifiée des services backend.",
      "Réduction des conflits de configuration.",
    ],
  },
  postgresql: {
    title: "PostgreSQL",
    description: "PostgreSQL est une base de données relationnelle fiable pour gérer des données structurées et critiques.",
    benefits: [
      "Stockage robuste pour clients, paiements, contenus et opérations.",
      "Excellente intégrité des données grâce aux relations et transactions.",
      "Adapté aux applications métiers et plateformes évolutives.",
    ],
  },
  mongodb: {
    title: "MongoDB",
    description: "MongoDB est une base de données flexible, utile pour les données évolutives, documents et contenus non strictement relationnels.",
    benefits: [
      "Structure souple pour itérer vite sur un produit.",
      "Bon choix pour contenus, profils, logs et données semi-structurées.",
      "Scalabilité adaptée aux applications modernes.",
    ],
  },
  figma: {
    title: "Figma",
    description: "Figma permet de concevoir les interfaces, maquettes et parcours utilisateur avant le développement.",
    benefits: [
      "Validation visuelle rapide avant de coder.",
      "Collaboration fluide entre client, designer et développeur.",
      "Interfaces plus cohérentes et faciles à utiliser.",
    ],
  },
};

const techModal = document.getElementById("techModal");
const techModalTitle = document.getElementById("techModalTitle");
const techModalDescription = document.getElementById("techModalDescription");
const techModalBenefits = document.getElementById("techModalBenefits");
let lastFocusedTechItem = null;

function closeTechModal() {
  if (!techModal) return;
  techModal.classList.remove("is-open");
  techModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocusedTechItem) lastFocusedTechItem.focus();
}

document.querySelectorAll("[data-tech]").forEach((button) => {
  button.addEventListener("click", () => {
    const detail = techDetails[button.dataset.tech || ""];
    if (!techModal || !techModalTitle || !techModalDescription || !techModalBenefits || !detail) return;

    lastFocusedTechItem = button;
    techModalTitle.textContent = detail.title;
    techModalDescription.textContent = detail.description;
    techModalBenefits.replaceChildren();

    detail.benefits.forEach((benefit) => {
      const item = document.createElement("li");
      item.textContent = benefit;
      techModalBenefits.appendChild(item);
    });

    techModal.classList.add("is-open");
    techModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const closeButton = techModal.querySelector(".tech-modal__close");
    if (closeButton) closeButton.focus();
  });
});

document.querySelectorAll("[data-tech-close]").forEach((button) => {
  button.addEventListener("click", closeTechModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && techModal && techModal.classList.contains("is-open")) {
    closeTechModal();
  }
});

const solutionDetails = {
  mbote: {
    title: "MBote",
    description: "MBote est une application sociale pensée pour connecter les communautés, faciliter les échanges et créer des opportunités locales autour des contenus, discussions et relations professionnelles.",
    screens: [
      "assets/images/loukatech/developer-team-collaboration.png",
      "assets/images/loukatech/africa-dashboard-meeting.png",
      "assets/images/loukatech/web-developer-workstation.png",
    ],
    benefits: [
      "Créer un espace social adapté aux usages africains.",
      "Favoriser la communication, le partage et les opportunités.",
      "Préparer une base mobile évolutive pour de nouvelles fonctionnalités.",
    ],
    link: "contact.html",
    linkLabel: "Demander le lien de téléchargement",
  },
  drluna: {
    title: "Dr Luna",
    description: "Dr Luna centralise les consultations, rendez-vous, suivis patients et interactions médicales dans une plateforme de télémédecine simple à utiliser.",
    screens: [
      "assets/images/loukatech/software-consulting-team.png",
      "assets/images/loukatech/education-automation-office.png",
      "assets/images/loukatech/crm-dashboard-operator.png",
    ],
    benefits: [
      "Simplifier la prise de rendez-vous et le suivi médical.",
      "Améliorer la relation entre patients et professionnels de santé.",
      "Gagner du temps grâce à une organisation plus claire des consultations.",
    ],
    link: "contact.html",
    linkLabel: "Demander une démonstration",
  },
  custom: {
    title: "Solutions sur mesure",
    description: "LoukaTech conçoit des plateformes adaptées à vos processus : outils internes, tableaux de bord, automatisations, portails clients et logiciels métiers.",
    screens: [
      "assets/images/loukatech/africa-dashboard-meeting.png",
      "assets/images/loukatech/product-workshop-team.png",
      "assets/images/loukatech/web-developer-workstation.png",
    ],
    benefits: [
      "Construire une solution alignée avec vos vrais besoins.",
      "Automatiser les tâches répétitives et réduire les erreurs.",
      "Faire évoluer l'outil progressivement selon votre activité.",
    ],
    link: "devis.html",
    linkLabel: "Demander un devis",
  },
};

const solutionModal = document.getElementById("solutionModal");
const solutionModalTitle = document.getElementById("solutionModalTitle");
const solutionModalDescription = document.getElementById("solutionModalDescription");
const solutionModalScreens = document.getElementById("solutionModalScreens");
const solutionModalBenefits = document.getElementById("solutionModalBenefits");
const solutionModalLink = document.getElementById("solutionModalLink");
let lastFocusedSolutionCard = null;

function closeSolutionModal() {
  if (!solutionModal) return;
  solutionModal.classList.remove("is-open");
  solutionModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocusedSolutionCard) lastFocusedSolutionCard.focus();
}

document.querySelectorAll("[data-solution]").forEach((button) => {
  button.addEventListener("click", () => {
    const detail = solutionDetails[button.dataset.solution || ""];
    if (!solutionModal || !solutionModalTitle || !solutionModalDescription || !solutionModalScreens || !solutionModalBenefits || !solutionModalLink || !detail) return;

    lastFocusedSolutionCard = button;
    solutionModalTitle.textContent = detail.title;
    solutionModalDescription.textContent = detail.description;
    solutionModalScreens.replaceChildren();
    solutionModalBenefits.replaceChildren();

    detail.screens.forEach((screen, index) => {
      const image = document.createElement("img");
      image.src = screen;
      image.alt = `${detail.title} - ecran ${index + 1}`;
      image.loading = "lazy";
      solutionModalScreens.appendChild(image);
    });

    detail.benefits.forEach((benefit) => {
      const item = document.createElement("li");
      item.textContent = benefit;
      solutionModalBenefits.appendChild(item);
    });

    solutionModalLink.href = detail.link;
    solutionModalLink.textContent = detail.linkLabel;
    solutionModal.classList.add("is-open");
    solutionModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const closeButton = solutionModal.querySelector(".solution-modal__close");
    if (closeButton) closeButton.focus();
  });
});

document.querySelectorAll("[data-solution-close]").forEach((button) => {
  button.addEventListener("click", closeSolutionModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && solutionModal && solutionModal.classList.contains("is-open")) {
    closeSolutionModal();
  }
});

const portfolioDetails = {
  mbote: {
    title: "MBote App",
    description: "Application mobile sociale concue pour connecter les communautes, faciliter les echanges et creer des opportunites locales.",
    screens: [
      "assets/images/loukatech/mobile-app-development-studio.png",
      "assets/images/loukatech/mobile-app-debugging.png",
      "assets/images/loukatech/mobile-ux-wireframes.png",
      "assets/images/loukatech/mobile-ux-wireframes.png",
    ],
    details: [
      "Interface mobile adaptee aux contenus, profils et discussions.",
      "Base evolutive pour notifications, relations et publication de contenus.",
      "Parcours pense pour une utilisation rapide sur smartphone.",
    ],
    link: "service-developpement-mobile.html",
  },
  drluna: {
    title: "Dr Luna Platform",
    description: "Plateforme web de telemedecine pour organiser les consultations, les rendez-vous et le suivi des patients.",
    screens: [
      "assets/images/loukatech/education-automation-office.png",
      "assets/images/loukatech/education-automation-office.png",
      "assets/images/loukatech/team-dashboard-review.png",
    ],
    details: [
      "Gestion claire des rendez-vous et consultations.",
      "Parcours patient plus simple pour le suivi medical.",
      "Architecture prete pour dossiers, notifications et tableaux de bord.",
    ],
    link: "service-developpement-web.html",
  },
  school: {
    title: "Gestion scolaire",
    description: "Logiciel metier pour centraliser les inscriptions, notes, finances, utilisateurs et rapports scolaires.",
    screens: [
      "assets/images/loukatech/software-team-office.png",
      "assets/images/loukatech/software-engineer-dashboard.png",
      "assets/images/loukatech/software-dev-monitors.png",
    ],
    details: [
      "Tableaux de bord pour la direction et l'administration.",
      "Gestion des roles, classes, eleves et donnees critiques.",
      "Reporting fiable pour suivre les operations scolaires.",
    ],
    link: "service-developpement-logiciel.html",
  },
  ecommerce: {
    title: "E-commerce",
    description: "Site marchand pour presenter les produits, fluidifier le parcours d'achat et suivre les commandes.",
    screens: [
      "assets/images/loukatech/web-responsive-testing.png",
      "assets/images/loukatech/web-frontend-developer.png",
      "assets/images/loukatech/web-developer-multi-screen.png",
    ],
    details: [
      "Catalogue produit responsive et lisible.",
      "Structure prete pour commandes, paiement et espace client.",
      "Interface claire pour les visiteurs et les administrateurs.",
    ],
    link: "service-developpement-web.html",
  },
  branding: {
    title: "Branding Kemba",
    description: "Identite visuelle et supports graphiques pour renforcer une marque sur le web, les reseaux sociaux et les supports commerciaux.",
    screens: [
      "assets/images/loukatech/ux-wireframe-planning.png",
      "assets/images/loukatech/ux-wireframe-planning.png",
      "assets/images/loukatech/software-engineer-screens.png",
    ],
    details: [
      "Direction visuelle, logo et declinaisons graphiques.",
      "Supports reseaux sociaux, presentations et documents commerciaux.",
      "Cohérence entre les supports digitaux et les supports imprimes.",
    ],
    link: "service-infographie-branding.html",
  },
};

const portfolioModal = document.getElementById("portfolioModal");
const portfolioModalTitle = document.getElementById("portfolioModalTitle");
const portfolioModalDescription = document.getElementById("portfolioModalDescription");
const portfolioModalScreens = document.getElementById("portfolioModalScreens");
const portfolioModalDetails = document.getElementById("portfolioModalDetails");
const portfolioModalLink = document.getElementById("portfolioModalLink");
let lastFocusedPortfolioCard = null;

function closePortfolioModal() {
  if (!portfolioModal) return;
  portfolioModal.classList.remove("is-open");
  portfolioModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocusedPortfolioCard) lastFocusedPortfolioCard.focus();
}

document.querySelectorAll("[data-portfolio]").forEach((button) => {
  button.addEventListener("click", () => {
    const detail = portfolioDetails[button.dataset.portfolio || ""];
    if (!portfolioModal || !portfolioModalTitle || !portfolioModalDescription || !portfolioModalScreens || !portfolioModalDetails || !portfolioModalLink || !detail) return;

    lastFocusedPortfolioCard = button;
    portfolioModalTitle.textContent = detail.title;
    portfolioModalDescription.textContent = detail.description;
    portfolioModalScreens.replaceChildren();
    portfolioModalDetails.replaceChildren();

    detail.screens.forEach((screen, index) => {
      const image = document.createElement("img");
      image.src = screen;
      image.alt = `${detail.title} - visuel ${index + 1}`;
      image.loading = "lazy";
      portfolioModalScreens.appendChild(image);
    });

    detail.details.forEach((itemText) => {
      const item = document.createElement("li");
      item.textContent = itemText;
      portfolioModalDetails.appendChild(item);
    });

    portfolioModalLink.href = detail.link;
    portfolioModal.classList.add("is-open");
    portfolioModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    const closeButton = portfolioModal.querySelector(".solution-modal__close");
    if (closeButton) closeButton.focus();
  });
});

document.querySelectorAll("[data-portfolio-close]").forEach((button) => {
  button.addEventListener("click", closePortfolioModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && portfolioModal && portfolioModal.classList.contains("is-open")) {
    closePortfolioModal();
  }
});

const serviceDetailData = {
  logiciel: {
    title: "Developpement logiciel",
    description: "Nous concevons des logiciels metiers sur mesure pour digitaliser vos operations et centraliser vos donnees.",
    benefits: [
      "ERP, CRM, gestion scolaire, gestion hospitaliere, RH et outils internes.",
      "Architecture adaptee a vos processus, roles utilisateurs et indicateurs.",
      "Maintenance, securite et evolution progressive selon votre activite.",
    ],
    link: "devis.html",
  },
  web: {
    title: "Developpement web",
    description: "Nous creons des sites, plateformes SaaS, portails clients et interfaces web rapides, claires et securisees.",
    benefits: [
      "Site vitrine, e-commerce, marketplace ou dashboard professionnel.",
      "Interface responsive pour mobile, tablette et desktop.",
      "Optimisation performance, SEO technique et connexion API.",
    ],
    link: "devis.html",
  },
  mobile: {
    title: "Developpement mobile",
    description: "Nous developpons des applications Android, iOS, hybrides ou PWA avec une experience fluide et stable.",
    benefits: [
      "Applications pour clients, equipes terrain, livraison, sante ou education.",
      "Notifications, comptes utilisateurs, messagerie, paiement ou geolocalisation.",
      "Publication et accompagnement jusqu'au lancement.",
    ],
    link: "devis.html",
  },
  uxui: {
    title: "UX/UI Design",
    description: "Nous concevons les parcours, maquettes et interfaces pour rendre vos produits simples, lisibles et agreables.",
    benefits: [
      "Wireframes, prototypes, design system et parcours utilisateurs.",
      "Interface moderne adaptee a votre marque et a vos utilisateurs.",
      "Reduction des frictions avant le developpement.",
    ],
    link: "devis.html",
  },
  integrationIa: {
    title: "Integration IA",
    description: "Nous ajoutons des fonctionnalites intelligentes dans vos outils existants ou vos nouvelles plateformes.",
    benefits: [
      "OCR, recherche intelligente, analyse documentaire et assistants metiers.",
      "Connexion a vos donnees, fichiers, API et workflows existants.",
      "Automatisation de taches repetitives avec controle humain.",
    ],
    link: "pole-intelligence-artificielle.html",
  },
  agentsIa: {
    title: "Agents IA",
    description: "Nous creons des agents capables d'assister vos equipes, executer des taches et guider vos utilisateurs.",
    benefits: [
      "Agents support, vente, operations, documentation ou back-office.",
      "Actions connectees a vos outils : CRM, fichiers, formulaires et API.",
      "Scenarios controles pour eviter les erreurs et garder la tracabilite.",
    ],
    link: "pole-intelligence-artificielle.html",
  },
  automatisation: {
    title: "Automatisation & maintenance",
    description: "Nous automatisons vos workflows et assurons le suivi technique de vos plateformes.",
    benefits: [
      "Workflows metiers, integrations API, generation de documents et notifications.",
      "Monitoring, CI/CD, hebergement, securite et support technique.",
      "Moins de taches manuelles, moins d'erreurs, plus de visibilite.",
    ],
    link: "devis.html",
  },
  branding: {
    title: "Branding & infographie",
    description: "Nous creons une identite visuelle claire et des supports de communication coherents pour votre marque.",
    benefits: [
      "Logo, charte graphique, visuels reseaux sociaux, catalogues et brochures.",
      "Design coherent entre site, application et supports marketing.",
      "Meilleure perception de marque et communication plus professionnelle.",
    ],
    link: "contact.html",
  },
};

const serviceDetailModal = document.getElementById("serviceDetailModal");
const serviceDetailModalTitle = document.getElementById("serviceDetailModalTitle");
const serviceDetailModalDescription = document.getElementById("serviceDetailModalDescription");
const serviceDetailModalBenefits = document.getElementById("serviceDetailModalBenefits");
const serviceDetailModalLink = document.getElementById("serviceDetailModalLink");
let lastFocusedServiceCard = null;

function closeServiceDetailModal() {
  if (!serviceDetailModal) return;
  serviceDetailModal.classList.remove("is-open");
  serviceDetailModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocusedServiceCard) lastFocusedServiceCard.focus();
}

document.querySelectorAll("[data-service-detail]").forEach((button) => {
  button.addEventListener("click", () => {
    const detail = serviceDetailData[button.dataset.serviceDetail || ""];
    if (!serviceDetailModal || !serviceDetailModalTitle || !serviceDetailModalDescription || !serviceDetailModalBenefits || !serviceDetailModalLink || !detail) return;

    lastFocusedServiceCard = button;
    serviceDetailModalTitle.textContent = detail.title;
    serviceDetailModalDescription.textContent = detail.description;
    serviceDetailModalBenefits.replaceChildren();

    detail.benefits.forEach((benefit) => {
      const item = document.createElement("li");
      item.textContent = benefit;
      serviceDetailModalBenefits.appendChild(item);
    });

    serviceDetailModalLink.href = detail.link;
    serviceDetailModal.classList.add("is-open");
    serviceDetailModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const closeButton = serviceDetailModal.querySelector(".solution-modal__close");
    if (closeButton) closeButton.focus();
  });
});

document.querySelectorAll("[data-service-detail-close]").forEach((button) => {
  button.addEventListener("click", closeServiceDetailModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && serviceDetailModal && serviceDetailModal.classList.contains("is-open")) {
    closeServiceDetailModal();
  }
});

const adminApiBase = window.LOUKATECH_API_URL || "";
function addAdminLoginLink() {
  const navigation = document.querySelector('.nav-links');
  if (!navigation || navigation.querySelector('[data-admin-login]')) return;
  const link = document.createElement('a');
  link.href = window.LOUKATECH_ADMIN_URL || `${adminApiBase || 'https://loukatech-api.onrender.com'}/login`;
  link.className = 'nav-admin-login';
  link.dataset.adminLogin = 'true';
  link.textContent = 'Connexion admin';
  navigation.appendChild(link);
}

addAdminLoginLink();

function sendJson(path, payload) {
  return fetch(`${adminApiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  });
}


function publicApiUrl(path) { return `${adminApiBase}${path}`; }

function publicPageSlug() {
  const filename = window.location.pathname.split('/').pop() || 'index.html';
  return { 'index.html': 'accueil', 'services.html': 'services', 'about.html': 'apropos', 'realisations.html': 'portfolio', 'contact.html': 'contact', 'devis.html': 'contact' }[filename];
}

function managedImageUrl(value) {
  if (!value || /^(https?:|data:)/.test(value)) return value;
  return value.startsWith('/uploads/') ? publicApiUrl(value) : value;
}

async function hydratePublicPage() {
  const slug = publicPageSlug();
  if (!slug) return;
  const response = await fetch(publicApiUrl(`/api/pages/public/${slug}`));
  if (!response.ok) return;
  const page = await response.json();
  const hero = document.querySelector('.page-hero');
  if (hero) {
    const title = hero.querySelector('h1');
    const description = hero.querySelector('.page-hero-grid p');
    const image = hero.querySelector('.hero-mini-card img');
    if (title && page.title) title.textContent = page.title;
    if (description && page.description) description.textContent = page.description;
    if (image && page.image) image.src = managedImageUrl(page.image);
  }
  if (slug === 'contact' && page.buttonText) {
    const submitButton = document.querySelector('.contact-form button[type="submit"]');
    if (submitButton) submitButton.textContent = page.buttonText;
  }
}

async function hydratePublicServices() {
  const filename = window.location.pathname.split('/').pop() || 'index.html';
  if (filename !== 'index.html') return;
  const response = await fetch(publicApiUrl('/api/services/public'));
  if (!response.ok) return;
  const services = await response.json();
  const grid = document.querySelector('.services-grid');
  if (!grid || !Array.isArray(services) || services.length === 0) return;
  const links = { software: 'service-developpement-logiciel.html', web: 'service-developpement-web.html', mobile: 'service-developpement-mobile.html', design: 'service-ux-ui-design.html', ai: 'service-integration-ia.html', agent: 'service-agents-ia.html', automation: 'service-automatisation.html', branding: 'service-infographie-branding.html' };
  grid.replaceChildren(...services.map((service) => {
    const card = document.createElement('a'); card.className = 'service-card reveal';
    card.href = links[service.icon] || 'services.html';
    const icon = document.createElement('span'); icon.className = 'service-icon'; icon.dataset.icon = links[service.icon] ? service.icon : 'software';
    const title = document.createElement('h3'); title.textContent = service.title;
    const description = document.createElement('p'); description.textContent = service.description;
    card.append(icon, title, description); return card;
  }));
}

hydratePublicPage().catch(() => {});
hydratePublicServices().catch(() => {});

sendJson("/api/visitors/track", {
  page: window.location.pathname || "/",
  referrer: document.referrer || "",
}).catch(() => {});

document.querySelectorAll(".contact-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    const originalLabel = submitButton ? submitButton.textContent : "";
    const data = new FormData(form);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Envoi en cours...";
    }

    try {
      const response = await sendJson("/api/messages/public", {
        name: data.get("name") || "",
        email: data.get("email") || "",
        phone: data.get("phone") || "",
        subject: data.get("subject") || "Contact",
        message: data.get("message") || "",
      });
      if (!response.ok) throw new Error("Message non envoyé.");
      form.reset();
      if (submitButton) submitButton.textContent = "Message envoyé";
    } catch {
      if (submitButton) submitButton.textContent = "Erreur, réessayez";
    } finally {
      window.setTimeout(() => {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalLabel || "Envoyer le message";
        }
      }, 2200);
    }
  });
});

const heavenVisitorKey = "loukatech_heaven_visitor";
const heavenConversationKey = "loukatech_heaven_conversation";

function getHeavenVisitorId() {
  let visitorId = localStorage.getItem(heavenVisitorKey);
  if (!visitorId) {
    visitorId = `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(heavenVisitorKey, visitorId);
  }
  return visitorId;
}

function createHeavenChatbot(settings) {
  if (!settings.enabled || document.querySelector(".heaven-chat")) return;

  const root = document.createElement("section");
  root.className = "heaven-chat";
  root.innerHTML = `
    <button class="heaven-chat__toggle" type="button" aria-label="Ouvrir Heaven">AI</button>
    <div class="heaven-chat__panel" role="dialog" aria-label="${settings.botName}">
      <header class="heaven-chat__header">
        <div class="heaven-chat__avatar">H</div>
        <div class="heaven-chat__identity"><strong>${settings.botName}</strong><span>Assistant IA LoukaTech</span></div>
        <button class="heaven-chat__close" type="button" aria-label="Fermer">x</button>
      </header>
      <div class="heaven-chat__messages" aria-live="polite"></div>
      <div class="heaven-chat__suggestions"></div>
      <div class="heaven-chat__actions">
        <a class="heaven-chat__whatsapp" target="_blank" rel="noreferrer">WhatsApp</a>
        <a href="contact.html">Formulaire contact</a>
      </div>
      <form class="heaven-chat__form">
        <input class="heaven-chat__input" type="text" placeholder="Écrivez votre question..." maxlength="1500" required />
        <button class="heaven-chat__send" type="submit">Envoyer</button>
      </form>
    </div>
  `;

  document.body.appendChild(root);

  const toggle = root.querySelector(".heaven-chat__toggle");
  const close = root.querySelector(".heaven-chat__close");
  const messages = root.querySelector(".heaven-chat__messages");
  const suggestions = root.querySelector(".heaven-chat__suggestions");
  const form = root.querySelector(".heaven-chat__form");
  const input = root.querySelector(".heaven-chat__input");
  const sendButton = root.querySelector(".heaven-chat__send");
  const whatsappLink = root.querySelector(".heaven-chat__whatsapp");

  function addMessage(role, content) {
    const message = document.createElement("div");
    message.className = `heaven-chat__message heaven-chat__message--${role}`;
    message.textContent = content;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function updateWhatsApp(text) {
    const phone = String(settings.whatsappNumber || "").replace(/[^\d]/g, "");
    const message = encodeURIComponent(`Bonjour LoukaTech, je viens de discuter avec ${settings.botName}. ${text || ""}`);
    whatsappLink.href = `https://wa.me/${phone}?text=${message}`;
  }

  toggle.addEventListener("click", () => {
    root.classList.toggle("is-open");
    if (root.classList.contains("is-open")) input.focus();
  });
  close.addEventListener("click", () => root.classList.remove("is-open"));

  addMessage("assistant", settings.welcomeMessage);
  updateWhatsApp("");

  settings.quickSuggestions.forEach((suggestion) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = suggestion;
    button.addEventListener("click", () => {
      input.value = suggestion;
      form.requestSubmit();
    });
    suggestions.appendChild(button);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const content = input.value.trim();
    if (!content) return;
    addMessage("user", content);
    input.value = "";
    sendButton.disabled = true;
    sendButton.textContent = "...";

    try {
      const response = await sendJson("/api/heaven/chat", {
        conversationId: localStorage.getItem(heavenConversationKey) || undefined,
        visitorId: getHeavenVisitorId(),
        message: content,
        sourcePage: window.location.pathname || "/",
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Heaven ne répond pas.");
      localStorage.setItem(heavenConversationKey, payload.conversationId);
      addMessage("assistant", payload.reply);
      updateWhatsApp(`${content}\n\nHeaven: ${payload.reply}`);
    } catch (error) {
      addMessage("assistant", error.message || "Désolé, Heaven est momentanément indisponible. Vous pouvez contacter LoukaTech via WhatsApp ou le formulaire.");
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = "Envoyer";
    }
  });
}

fetch(`${adminApiBase}/api/heaven/settings`)
  .then((response) => response.json())
  .then(createHeavenChatbot)
  .catch(() => {});

const blogArticleDetails = {
  "ia-automatisation": {
    category: "IA & Automatisation",
    title: "Comment l'IA peut automatiser les taches repetitives en entreprise",
    intro: "L'IA apporte de la valeur quand elle cible un processus clair, frequent et mesurable. Le bon point de depart consiste a observer les taches manuelles qui consomment du temps sans exiger une decision complexe a chaque etape.",
    points: [
      "Cartographier les taches repetitives avant de choisir un outil IA.",
      "Mesurer le temps gagne, les erreurs evitees et le cout d'exploitation.",
      "Garder une validation humaine sur les actions sensibles ou financieres.",
    ],
    action: "Commencez par un workflow simple : tri de demandes, generation de documents, reponse support ou extraction de donnees. Testez sur un petit volume, puis automatisez progressivement les cas fiables.",
    link: "pole-intelligence-artificielle.html",
  },
  "logiciel-metier": {
    category: "Logiciel metier",
    title: "Pourquoi un logiciel metier bien concu change la productivite",
    intro: "Un logiciel metier utile ne remplace pas seulement un fichier Excel. Il clarifie les roles, securise les donnees et rend les operations plus rapides pour les equipes qui l'utilisent chaque jour.",
    points: [
      "Une architecture solide evite les blocages quand l'activite grandit.",
      "Une UX simple reduit la formation et augmente l'adoption interne.",
      "Une maintenance prevue des le depart limite les couts futurs.",
    ],
    action: "Priorisez les parcours les plus utilises : creation, validation, recherche, reporting. Le bon outil doit reduire les clics, proteger les donnees critiques et produire des indicateurs fiables.",
    link: "service-developpement-logiciel.html",
  },
  "presence-digitale": {
    category: "Web & Branding",
    title: "Construire une presence digitale credible des le depart",
    intro: "La credibilite digitale vient d'un message clair, d'un site rapide et d'une identite coherente. L'objectif est que le visiteur comprenne vite ce que vous proposez et comment vous contacter.",
    points: [
      "Formuler une offre lisible en quelques secondes.",
      "Optimiser la vitesse, le responsive et le referencement technique.",
      "Aligner logo, couleurs, visuels et ton de communication.",
    ],
    action: "Travaillez d'abord la proposition de valeur, puis structurez les pages autour des preuves, services et appels a l'action. Un formulaire ou WhatsApp doit rester accessible sans friction.",
    link: "service-developpement-web.html",
  },
  "application-mobile": {
    category: "Mobile",
    title: "Les criteres d'une application mobile vraiment utile",
    intro: "Une application mobile reussie resout un besoin frequent avec une experience rapide. Avant de developper, il faut verifier l'usage, la performance attendue et les donnees a proteger.",
    points: [
      "Limiter la premiere version aux fonctionnalites essentielles.",
      "Prevoir performance, mode reseau faible et securite des comptes.",
      "Installer des analytics pour comprendre les vrais usages.",
    ],
    action: "Validez un prototype avec les utilisateurs cibles, puis construisez une version progressive. Les notifications, paiements et messagerie doivent etre ajoutes seulement s'ils servent le parcours principal.",
    link: "service-developpement-mobile.html",
  },
};

const blogArticleModal = document.getElementById("blogArticleModal");
const blogArticleModalCategory = document.getElementById("blogArticleModalCategory");
const blogArticleModalTitle = document.getElementById("blogArticleModalTitle");
const blogArticleModalIntro = document.getElementById("blogArticleModalIntro");
const blogArticleModalPoints = document.getElementById("blogArticleModalPoints");
const blogArticleModalAction = document.getElementById("blogArticleModalAction");
const blogArticleModalLink = document.getElementById("blogArticleModalLink");
let lastFocusedBlogArticle = null;

function closeBlogArticleModal() {
  if (!blogArticleModal) return;
  blogArticleModal.classList.remove("is-open");
  blogArticleModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocusedBlogArticle) lastFocusedBlogArticle.focus();
}

document.querySelectorAll("[data-blog-article]").forEach((button) => {
  button.addEventListener("click", () => {
    const detail = blogArticleDetails[button.dataset.blogArticle || ""];
    if (!blogArticleModal || !blogArticleModalCategory || !blogArticleModalTitle || !blogArticleModalIntro || !blogArticleModalPoints || !blogArticleModalAction || !blogArticleModalLink || !detail) return;

    lastFocusedBlogArticle = button;
    blogArticleModalCategory.textContent = detail.category;
    blogArticleModalTitle.textContent = detail.title;
    blogArticleModalIntro.textContent = detail.intro;
    blogArticleModalAction.textContent = detail.action;
    blogArticleModalLink.href = detail.link;
    blogArticleModalPoints.replaceChildren();

    detail.points.forEach((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      blogArticleModalPoints.appendChild(item);
    });

    blogArticleModal.classList.add("is-open");
    blogArticleModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const closeButton = blogArticleModal.querySelector(".solution-modal__close");
    if (closeButton) closeButton.focus();
  });
});

document.querySelectorAll("[data-blog-article-close]").forEach((button) => {
  button.addEventListener("click", closeBlogArticleModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && blogArticleModal && blogArticleModal.classList.contains("is-open")) {
    closeBlogArticleModal();
  }
});
