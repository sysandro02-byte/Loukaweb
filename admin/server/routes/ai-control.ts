import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { addActivity } from '../utils/activity';
import { readDb, writeDb } from '../utils/storage';

export const aiControlRouter = Router();

const actionSchema = z.object({
  actionId: z.enum(['reply-mails', 'update-content', 'refresh-images', 'visitor-report', 'organize-admin'])
});

function buildVisitorReport() {
  const db = readDb();
  const visits = db.visits;
  const messages = db.messages;
  const today = new Date().toISOString().slice(0, 10);
  const todayVisits = visits.filter((visit) => visit.createdAt.startsWith(today)).length;
  const newMessages = messages.filter((message) => message.status === 'nouveau');
  const pageCounts = visits.reduce<Record<string, number>>((acc, visit) => {
    acc[visit.page] = (acc[visit.page] || 0) + 1;
    return acc;
  }, {});
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([page, count]) => ({ page, count }));

  return {
    totalVisitors: visits.length,
    todayVisits,
    newMessages: newMessages.length,
    topPages,
    summary:
      visits.length === 0
        ? 'Aucune visite enregistree pour le moment. Activez le suivi public et consultez le rapport apres trafic reel.'
        : `Le site compte ${visits.length} visites, dont ${todayVisits} aujourd'hui. ${newMessages.length} message(s) attendent une reponse admin.`
  };
}

function buildPlan() {
  const db = readDb();
  const latestMessage = db.messages.find((message) => message.status === 'nouveau') || db.messages[0];
  const latestPage = db.pages[0];
  const latestMedia = db.media[0];
  const report = buildVisitorReport();

  return [
    {
      id: 'reply-mails',
      title: 'Repondre aux mails entrants',
      status: latestMessage ? 'pret' : 'en_attente',
      risk: 'Validation admin obligatoire avant tout envoi externe.',
      preview: latestMessage
        ? `Brouillon pour ${latestMessage.name}: Bonjour ${latestMessage.name}, merci pour votre message concernant "${latestMessage.subject}". LoukaTech peut revenir vers vous avec une proposition adaptee.`
        : 'Aucun nouveau message a traiter.'
    },
    {
      id: 'update-content',
      title: 'Mettre a jour les articles et contenus',
      status: latestPage ? 'pret' : 'en_attente',
      risk: 'L IA prepare des suggestions; la publication reste manuelle ou validee par admin.',
      preview: latestPage
        ? `Suggestion: enrichir la page ${latestPage.name} avec un angle plus clair sur les benefices clients, l IA utile et les preuves de realisation.`
        : 'Aucune page admin disponible pour proposer une mise a jour.'
    },
    {
      id: 'refresh-images',
      title: 'Organiser les images du site',
      status: latestMedia ? 'pret' : 'en_attente',
      risk: 'Les images ne sont pas remplacees automatiquement sans controle visuel.',
      preview: latestMedia
        ? `Media prioritaire detecte: ${latestMedia.originalName}. L IA peut proposer un usage, un alt text et une page cible.`
        : 'Aucun media admin disponible. Ajoutez des images dans Medias pour recevoir des propositions.'
    },
    {
      id: 'visitor-report',
      title: 'Faire un rapport des visiteurs',
      status: 'pret',
      risk: 'Rapport analytique sans donnees personnelles sensibles.',
      preview: report.summary
    },
    {
      id: 'organize-admin',
      title: 'Organiser les priorites admin',
      status: 'pret',
      risk: 'L IA classe les taches; elle ne supprime rien automatiquement.',
      preview: `Priorite proposee: ${report.newMessages > 0 ? 'traiter les messages entrants, puis' : ''} verifier les pages les plus visitees et rafraichir les medias utiles.`
    }
  ];
}

aiControlRouter.get('/overview', requireAuth('heaven'), (_request, response) => {
  response.json({
    enabled: false,
    mode: 'controle_admin',
    headline: 'Pilotage IA sous validation admin',
    description:
      "L IA peut analyser les donnees admin, preparer des reponses, suggerer des articles/images et produire des rapports. Elle n'execute pas d'action sensible sans validation.",
    report: buildVisitorReport(),
    actions: buildPlan()
  });
});

aiControlRouter.post('/activate', requireAuth('heaven'), (request, response) => {
  const db = readDb();
  addActivity(db, request.admin, 'Activation du pilotage IA', 'Centre IA admin');
  writeDb(db);
  response.json({
    enabled: true,
    message: 'Pilotage IA active en mode controle admin.',
    actions: buildPlan(),
    report: buildVisitorReport()
  });
});

aiControlRouter.post('/apply', requireAuth('heaven'), (request, response) => {
  const parsed = actionSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: 'Action IA invalide.' });

  const db = readDb();
  const now = new Date().toISOString();
  let message = '';

  if (parsed.data.actionId === 'reply-mails') {
    const messageToPrepare = db.messages.find((item) => item.status === 'nouveau');
    if (messageToPrepare) {
      messageToPrepare.status = 'lu';
      message = `Brouillon prepare pour ${messageToPrepare.email}. Le message est marque comme lu, pas envoye automatiquement.`;
    } else {
      message = 'Aucun nouveau message a preparer.';
    }
  }

  if (parsed.data.actionId === 'update-content') {
    const page = db.pages[0];
    if (page) {
      const current = page.draft || page;
      const signature = 'LoukaTech vous accompagne avec une méthode claire, des livrables utiles et un suivi adapté à vos objectifs.';
      page.draft = {
        title: current.title,
        subtitle: 'Proposition IA à valider',
        description: current.description.includes(signature) ? current.description : `${current.description} ${signature}`,
        buttonText: current.buttonText,
        image: current.image,
        sections: current.sections,
        updatedAt: now
      };
      page.updatedAt = now;
      message = `Brouillon IA préparé pour ${page.name}. Vérifiez-le dans Gestion des pages avant publication.`;
    } else {
      message = 'Aucune page disponible pour une suggestion.';
    }
  }

  if (parsed.data.actionId === 'refresh-images') {
    message = db.media.length
      ? `${db.media.length} media(s) analyses. Verifiez les usages proposes avant remplacement.`
      : 'Aucun media disponible pour analyse.';
  }

  if (parsed.data.actionId === 'visitor-report') {
    message = buildVisitorReport().summary;
  }

  if (parsed.data.actionId === 'organize-admin') {
    message = 'Priorites admin organisees: messages, pages fortes, medias, puis rapport visiteurs.';
  }

  addActivity(db, request.admin, `Validation action IA: ${parsed.data.actionId}`, 'Centre IA admin');
  writeDb(db);
  response.json({ message, actions: buildPlan(), report: buildVisitorReport() });
});
