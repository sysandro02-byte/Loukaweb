import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { emptyDb, writeDb } from './utils/storage';

const now = new Date();
const iso = (offsetDays = 0) => new Date(now.getTime() + offsetDays * 86400000).toISOString();

const services = [
  'Creation de sites Internet',
  'Developpement de logiciels',
  "Developpement d'applications mobiles",
  "Gestion d'entreprise",
  "Integration de l'intelligence artificielle",
  "Creation d'agents IA"
].map((title, index) => ({
  id: randomUUID(),
  title,
  description: `Service LoukaTech pour ${title.toLowerCase()} avec cadrage, conception, developpement et maintenance.`,
  icon: ['Globe', 'Code', 'Smartphone', 'Briefcase', 'Brain', 'Bot'][index],
  image: `/assets/images/about/about-image-0${(index % 2) + 1}.jpg`,
  active: true,
  createdAt: iso(-20 + index)
}));

const pages = [
  ['accueil', 'Accueil'],
  ['services', 'Services'],
  ['apropos', 'A propos'],
  ['portfolio', 'Portfolio'],
  ['contact', 'Contact']
].map(([slug, name], index) => ({
  id: randomUUID(),
  slug,
  name,
  title: `${name} LoukaTech`,
  subtitle: 'Solutions digitales, logiciels, applications mobiles et IA.',
  description: 'Texte editable depuis l espace administrateur LoukaTech.',
  buttonText: index === 4 ? 'Envoyer un message' : 'Demander un devis',
  image: '/assets/images/hero/hero-image.jpg',
  sections: ['Hero', 'Services', 'Preuves', 'Contact'].map((label, order) => ({ id: randomUUID(), label, visible: true, order: order + 1 })),
  updatedAt: iso(-2)
}));

const db = emptyDb();
db.admins.push({
  id: randomUUID(),
  name: 'Super Admin LoukaTech',
  email: 'admin@loukatech.com',
  passwordHash: bcrypt.hashSync('ChangeMe!2026', 12),
  role: 'super_admin',
  active: true,
  createdAt: iso(-30),
  lastLoginAt: iso(-1)
});
db.pages = pages as typeof db.pages;
db.services = services;
db.messages = [
  { id: randomUUID(), name: 'Grace M.', email: 'grace@example.com', phone: '+243 810 000 001', subject: 'Projet web', message: 'Nous voulons refaire notre site vitrine.', status: 'nouveau', createdAt: iso(-1) },
  { id: randomUUID(), name: 'Junior K.', email: 'junior@example.com', phone: '+243 810 000 002', subject: 'Agent IA', message: 'Besoin d un agent IA pour support client.', status: 'lu', createdAt: iso(-3) }
];
db.visits = Array.from({ length: 42 }, (_, index) => ({
  id: randomUUID(),
  ip: `192.168.1.${index + 10}`,
  country: ['RDC', 'Congo', 'France', 'Belgique'][index % 4],
  city: ['Kinshasa', 'Brazzaville', 'Paris', 'Bruxelles'][index % 4],
  page: ['/', '/services.html', '/contact.html', '/about.html'][index % 4],
  referrer: index % 3 === 0 ? 'Google' : '',
  browser: ['Chrome', 'Safari', 'Edge'][index % 3],
  os: ['Windows', 'Android', 'iOS', 'macOS'][index % 4],
  device: ['Desktop', 'Mobile', 'Tablette'][index % 3],
  createdAt: iso(-index % 14)
}));
db.activity = [
  { id: randomUUID(), action: 'Connexion admin', userId: db.admins[0].id, userEmail: db.admins[0].email, target: 'auth', createdAt: iso(-1) }
];

const heavenConversationId = randomUUID();
const heavenLeadId = randomUUID();
db.heavenConversations.unshift({
  id: heavenConversationId,
  visitorId: 'visitor-demo-heaven',
  status: 'active',
  sourcePage: '/index.html',
  serviceRequested: 'Creation de sites Internet',
  leadId: heavenLeadId,
  createdAt: iso(-1),
  updatedAt: iso(-1)
});
db.heavenMessages.push(
  {
    id: randomUUID(),
    conversationId: heavenConversationId,
    role: 'user',
    content: 'Bonjour, je veux un devis pour creer un site web. Mon nom est David, WhatsApp +243 810 000 777, email david@example.com, budget 1500$.',
    createdAt: iso(-1)
  },
  {
    id: randomUUID(),
    conversationId: heavenConversationId,
    role: 'assistant',
    content: "Merci David. LoukaTech peut vous accompagner pour creer un site web professionnel. Je transmets les informations a l'equipe pour un cadrage.",
    createdAt: iso(-1)
  }
);
db.heavenLeads.unshift({
  id: heavenLeadId,
  conversationId: heavenConversationId,
  name: 'David',
  phone: '+243 810 000 777',
  email: 'david@example.com',
  serviceRequested: 'Creation de sites Internet',
  budget: '1500$',
  status: 'nouveau',
  createdAt: iso(-1),
  updatedAt: iso(-1)
});

writeDb(db);
console.log('Seed admin cree. Email: admin@loukatech.com / Mot de passe: ChangeMe!2026');
