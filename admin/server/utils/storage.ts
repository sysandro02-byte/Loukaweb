import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import bcrypt from 'bcryptjs';
import type { Database } from '../types';

const dbPath = process.env.DATA_FILE || (process.env.VERCEL ? join('/tmp', 'loukatech-admin-db.json') : join(process.cwd(), 'server', 'data', 'db.json'));

const defaultPages = (updatedAt: string): Database['pages'] => [
  { id: 'page-accueil', slug: 'accueil', name: 'Accueil', title: 'Construisons ensemble votre futur numérique.', subtitle: 'Startup technologique africaine', description: 'LoukaTech conçoit des logiciels, applications mobiles, plateformes web et solutions intelligentes qui accélèrent la croissance des entreprises.', buttonText: 'Démarrer un projet', image: '', sections: ['Hero', 'Services', 'Entreprise', 'Solutions'].map((label, order) => ({ id: `accueil-${order}`, label, visible: true, order: order + 1 })), updatedAt },
  { id: 'page-services', slug: 'services', name: 'Services', title: 'Des expertises complémentaires pour construire votre produit numérique.', subtitle: 'Nos services', description: 'De la stratégie au déploiement, LoukaTech rassemble les compétences nécessaires pour faire avancer votre projet.', buttonText: 'Demander un devis', image: 'assets/images/loukatech/software-consulting-team.png', sections: ['Hero', 'Expertises', 'Processus', 'Contact'].map((label, order) => ({ id: `services-${order}`, label, visible: true, order: order + 1 })), updatedAt },
  { id: 'page-apropos', slug: 'apropos', name: 'Entreprise', title: 'Une entreprise tech qui relie stratégie, design, code et intelligence artificielle.', subtitle: 'Notre vision', description: 'LoukaTech construit des solutions digitales fiables pour aider les organisations à travailler plus vite, mieux servir leurs clients et automatiser leurs opérations.', buttonText: 'Demander un devis', image: 'assets/images/loukatech/product-workshop-team.png', sections: ['Hero', 'Vision', 'Valeurs', 'Contact'].map((label, order) => ({ id: `apropos-${order}`, label, visible: true, order: order + 1 })), updatedAt },
  { id: 'page-portfolio', slug: 'portfolio', name: 'Réalisations', title: 'Des projets digitaux conçus pour être utiles, performants et durables.', subtitle: 'Portfolio', description: 'Chaque réalisation combine stratégie produit, interface claire, architecture solide et suivi après livraison.', buttonText: 'Demander un devis', image: 'assets/images/loukatech/africa-dashboard-meeting.png', sections: ['Hero', 'Portfolio', 'Résultats', 'Contact'].map((label, order) => ({ id: `portfolio-${order}`, label, visible: true, order: order + 1 })), updatedAt },
  { id: 'page-contact', slug: 'contact', name: 'Contact', title: 'Parlons de votre besoin et trouvons le bon chemin technique.', subtitle: 'Contact direct', description: 'Expliquez-nous votre objectif, votre contexte et vos priorités. Nous revenons vers vous avec une réponse claire.', buttonText: 'Envoyer le message', image: 'assets/images/loukatech/software-consulting-team.png', sections: ['Hero', 'Coordonnées', 'Formulaire'].map((label, order) => ({ id: `contact-${order}`, label, visible: true, order: order + 1 })), updatedAt }
];

const defaultServices = (createdAt: string): Database['services'] => [
  ['Développement logiciel', 'Logiciels métiers sur mesure pour optimiser vos processus.', 'software', 'service-developpement-logiciel.html'],
  ['Développement web', 'Sites web, plateformes SaaS et applications performantes.', 'web', 'service-developpement-web.html'],
  ['Développement mobile', 'Applications natives et hybrides pour Android et iOS.', 'mobile', 'service-developpement-mobile.html'],
  ['UX / UI Design', 'Interfaces modernes, intuitives et centrées utilisateur.', 'design', 'service-ux-ui-design.html'],
  ['Intégration IA', 'Fonctionnalités intelligentes intégrées à vos applications.', 'ai', 'service-integration-ia.html'],
  ['Agents IA', 'Agents intelligents pour automatiser des tâches complexes.', 'agent', 'service-agents-ia.html'],
  ['Automatisation', 'Workflows métiers, documents, messages et intégrations API.', 'automation', 'service-automatisation.html'],
  ['Infographie & branding', 'Identité visuelle, supports marketing et communication.', 'branding', 'service-infographie-branding.html']
].map(([title, description, icon, image], index) => ({ id: `service-${index + 1}`, title, description, icon, image, active: true, createdAt }));

export function emptyDb(): Database {
  const now = new Date().toISOString();

  return {
    admins: [],
    pages: defaultPages(now),
    services: defaultServices(now),
    messages: [],
    visits: [],
    media: [],
    activity: [],
    heavenSettings: {
      enabled: true,
      botName: 'Heaven',
      welcomeMessage: "Bonjour, je suis Heaven, l'assistant IA de LoukaTech. Comment puis-je vous aider ?",
      systemPrompt:
        "Tu es Heaven, l'assistant IA de LoukaTech. Reponds uniquement dans le contexte des services LoukaTech : sites web, applications mobiles, logiciels de gestion, integration IA, agents IA, maintenance, devis et contact. Sois professionnel, poli, clair et commercial. Si une demande est hors sujet, recentre vers LoukaTech. Ne promets pas de prix definitif sans cadrage.",
      quickSuggestions: ['Creer un site web', 'Developper une application', 'Demander un devis', 'Contacter LoukaTech'],
      faqs: [
        {
          id: 'faq-web',
          question: 'LoukaTech peut-il creer un site web ?',
          answer: 'Oui. LoukaTech cree des sites vitrines, plateformes web, landing pages et interfaces professionnelles.'
        },
        {
          id: 'faq-ia',
          question: "LoukaTech integre-t-il l'intelligence artificielle ?",
          answer: "Oui. LoukaTech integre des solutions IA, agents IA, automatisations et assistants metier."
        }
      ],
      services: [
        { id: 'site-web', title: 'Creation de sites Internet', description: 'Sites vitrines, plateformes et experiences web modernes.', active: true },
        { id: 'mobile', title: 'Applications mobiles', description: 'Applications Android/iOS et experiences mobiles performantes.', active: true },
        { id: 'logiciel', title: 'Logiciels de gestion', description: 'Outils de gestion, tableaux de bord et logiciels metier.', active: true },
        { id: 'ia', title: 'Integration IA', description: 'Automatisation, agents IA et assistants intelligents.', active: true },
        { id: 'maintenance', title: 'Maintenance informatique', description: 'Support, optimisation et maintenance continue.', active: true }
      ],
      whatsappNumber: '+243900000000',
      receiverEmail: 'contact@loukatech.com'
    },
    heavenConversations: [],
    heavenMessages: [],
    heavenLeads: []
  };
}

function normalizeDb(db: Partial<Database>): Database {
  const defaults = emptyDb();
  const normalized = {
    ...defaults,
    ...db,
    heavenSettings: { ...defaults.heavenSettings, ...(db.heavenSettings || {}) },
    heavenConversations: db.heavenConversations || [],
    heavenMessages: db.heavenMessages || [],
    heavenLeads: db.heavenLeads || []
  };

  if (normalized.pages.length === 0) normalized.pages = defaultPages(new Date().toISOString());
  if (normalized.services.length === 0) normalized.services = defaultServices(new Date().toISOString());

  if (normalized.admins.length === 0) {
    normalized.admins.push({
      id: randomUUID(),
      name: 'Super Admin LoukaTech',
      email: 'admin@loukatech.com',
      passwordHash: bcrypt.hashSync(process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe!2026', 12),
      role: 'super_admin',
      active: true,
      createdAt: new Date().toISOString()
    });
  }

  return normalized;
}

export function readDb(): Database {
  if (!existsSync(dbPath)) {
    writeDb(emptyDb());
  }

  return normalizeDb(JSON.parse(readFileSync(dbPath, 'utf-8')) as Partial<Database>);
}

export function writeDb(db: Database) {
  mkdirSync(dirname(dbPath), { recursive: true });
  writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export function publicAdmin(admin: Database['admins'][number]) {
  const { passwordHash, ...safeAdmin } = admin;
  return safeAdmin;
}
