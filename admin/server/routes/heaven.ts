import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import type { HeavenLead, HeavenMessage } from '../types';
import { addActivity } from '../utils/activity';
import { readDb, writeDb } from '../utils/storage';

export const heavenRouter = Router();
export const adminHeavenRouter = Router();

const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de messages envoyes. Reessayez dans quelques minutes.' }
});

const chatSchema = z.object({
  conversationId: z.string().optional(),
  visitorId: z.string().min(6).max(120),
  message: z.string().min(1).max(1500),
  sourcePage: z.string().max(300).optional().default('/')
});

const settingsSchema = z.object({
  enabled: z.boolean(),
  botName: z.string().min(2).max(40),
  welcomeMessage: z.string().min(5).max(500),
  systemPrompt: z.string().min(20).max(4000),
  quickSuggestions: z.array(z.string().min(1).max(80)).max(8),
  faqs: z.array(z.object({ id: z.string(), question: z.string().min(2), answer: z.string().min(2) })).max(20),
  services: z.array(z.object({ id: z.string(), title: z.string().min(2), description: z.string().min(2), active: z.boolean() })).max(20),
  whatsappNumber: z.string().min(6).max(40),
  receiverEmail: z.string().email()
});

const leadStatusSchema = z.object({
  status: z.enum(['nouveau', 'contacte', 'en_discussion', 'converti', 'abandonne'])
});

function containsUnsafeContent(message: string) {
  return /(pirater|hack|malware|virus|phishing|arnaque|attaque|exploit)/i.test(message);
}

function isQuoteIntent(message: string) {
  return /(devis|prix|budget|tarif|combien|whatsapp|contact|projet)/i.test(message);
}

function serviceFromMessage(message: string) {
  const normalized = message.toLowerCase();
  if (/site|web|landing/.test(normalized)) return 'Creation de sites Internet';
  if (/application|mobile|android|ios/.test(normalized)) return 'Applications mobiles';
  if (/logiciel|gestion|erp|crm/.test(normalized)) return 'Logiciels de gestion';
  if (/\bia\b|intelligence artificielle|automatisation/.test(normalized)) return 'Integration IA';
  if (/agent/.test(normalized)) return 'Agents IA';
  if (/maintenance|support|informatique/.test(normalized)) return 'Maintenance informatique';
  return '';
}

function extractLead(content: string, conversationId: string): Omit<HeavenLead, 'id' | 'createdAt' | 'updatedAt' | 'status'> | null {
  const email = content.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const phone = content.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() || '';
  const budget = content.match(/(\d+[\s.,]?\d*\s?(?:\$|usd|fc|cdf|eur|€)|budget\s*:?\s*[^,;\n]+)/i)?.[0] || '';
  const serviceRequested = serviceFromMessage(content);
  const name = content.match(/(?:nom|je suis|moi c'est|mon nom est)\s*:?\s*([A-Za-zÀ-ÿ' -]{2,60})/i)?.[1]?.trim() || '';

  if (!email && !phone && !serviceRequested) return null;

  return {
    conversationId,
    name,
    phone,
    email,
    serviceRequested,
    budget
  };
}

function buildLocalReply(message: string, botName: string) {
  const service = serviceFromMessage(message);

  if (containsUnsafeContent(message)) {
    return "Je ne peux pas aider sur ce sujet. Je peux toutefois vous orienter sur les services professionnels de LoukaTech : site web, application mobile, logiciel de gestion, IA, agents IA ou maintenance.";
  }

  if (isQuoteIntent(message)) {
    return `Bien sur. Pour preparer un devis, j'ai besoin de votre nom, votre numero WhatsApp, votre email, le type de projet et votre budget approximatif. Vous pouvez aussi cliquer sur WhatsApp ou Contact pour envoyer la demande a LoukaTech.`;
  }

  if (service) {
    return `Oui, LoukaTech peut vous accompagner pour ${service.toLowerCase()}. Nous pouvons cadrer le besoin, proposer une architecture claire, developper la solution et assurer la maintenance. Souhaitez-vous demander un devis ?`;
  }

  return `Je suis ${botName}, l'assistant IA de LoukaTech. Je peux vous renseigner sur la creation de sites web, les applications mobiles, les logiciels de gestion, l'integration IA, les agents IA, la maintenance et les devis. Quel est votre besoin ?`;
}

async function callAi(systemPrompt: string, messages: HeavenMessage[], userMessage: string) {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  if (!apiKey) return null;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10).map((message) => ({ role: message.role, content: message.content })),
        { role: 'user', content: userMessage }
      ],
      temperature: 0.4
    })
  });

  if (!response.ok) return null;

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content as string | undefined;
}

heavenRouter.get('/settings', (_request, response) => {
  const db = readDb();
  response.json({
    enabled: db.heavenSettings.enabled,
    botName: db.heavenSettings.botName,
    welcomeMessage: db.heavenSettings.welcomeMessage,
    quickSuggestions: db.heavenSettings.quickSuggestions,
    whatsappNumber: db.heavenSettings.whatsappNumber,
    receiverEmail: db.heavenSettings.receiverEmail
  });
});

heavenRouter.post('/chat', chatLimiter, async (request, response) => {
  const result = chatSchema.safeParse(request.body);
  if (!result.success) return response.status(400).json({ message: 'Message invalide.' });

  const db = readDb();
  const settings = db.heavenSettings;

  if (!settings.enabled) return response.status(403).json({ message: 'Heaven est actuellement desactive.' });

  const now = new Date().toISOString();
  let conversation = result.data.conversationId
    ? db.heavenConversations.find((item) => item.id === result.data.conversationId && item.status !== 'deleted')
    : undefined;

  if (!conversation) {
    conversation = {
      id: randomUUID(),
      visitorId: result.data.visitorId,
      status: 'active',
      sourcePage: result.data.sourcePage,
      createdAt: now,
      updatedAt: now
    };
    db.heavenConversations.unshift(conversation);
  }

  const previousMessages = db.heavenMessages.filter((message) => message.conversationId === conversation.id);
  const userMessage: HeavenMessage = {
    id: randomUUID(),
    conversationId: conversation.id,
    role: 'user',
    content: result.data.message,
    createdAt: now
  };
  db.heavenMessages.push(userMessage);

  let reply = containsUnsafeContent(result.data.message)
    ? buildLocalReply(result.data.message, settings.botName)
    : await callAi(settings.systemPrompt, previousMessages, result.data.message);

  if (!reply) reply = buildLocalReply(result.data.message, settings.botName);

  const assistantMessage: HeavenMessage = {
    id: randomUUID(),
    conversationId: conversation.id,
    role: 'assistant',
    content: reply,
    createdAt: new Date().toISOString()
  };
  db.heavenMessages.push(assistantMessage);

  const leadDraft = extractLead(result.data.message, conversation.id);
  if (leadDraft) {
    const existingLead = db.heavenLeads.find((lead) => lead.conversationId === conversation!.id);
    if (existingLead) {
      existingLead.name = leadDraft.name || existingLead.name;
      existingLead.phone = leadDraft.phone || existingLead.phone;
      existingLead.email = leadDraft.email || existingLead.email;
      existingLead.serviceRequested = leadDraft.serviceRequested || existingLead.serviceRequested;
      existingLead.budget = leadDraft.budget || existingLead.budget;
      existingLead.updatedAt = new Date().toISOString();
      conversation.leadId = existingLead.id;
    } else {
      const lead: HeavenLead = {
        id: randomUUID(),
        ...leadDraft,
        status: 'nouveau',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.heavenLeads.unshift(lead);
      conversation.leadId = lead.id;
    }
    conversation.serviceRequested = leadDraft.serviceRequested || conversation.serviceRequested;
  }

  conversation.updatedAt = new Date().toISOString();
  writeDb(db);

  response.json({
    conversationId: conversation.id,
    reply,
    whatsappUrl: `https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Bonjour LoukaTech, voici ma conversation avec ${settings.botName}: ${result.data.message}`)}`
  });
});

adminHeavenRouter.get('/settings', requireAuth('heaven'), (_request, response) => {
  response.json(readDb().heavenSettings);
});

adminHeavenRouter.put('/settings', requireAuth('heaven'), (request, response) => {
  const result = settingsSchema.safeParse(request.body);
  if (!result.success) return response.status(400).json({ message: 'Reglages Heaven invalides.' });
  const db = readDb();
  db.heavenSettings = result.data;
  addActivity(db, request.admin, 'Modification reglages Heaven IA', 'heaven_settings');
  writeDb(db);
  response.json(db.heavenSettings);
});

adminHeavenRouter.get('/conversations', requireAuth('heaven'), (_request, response) => {
  const db = readDb();
  const conversations = db.heavenConversations
    .filter((conversation) => conversation.status !== 'deleted')
    .map((conversation) => ({
      ...conversation,
      messages: db.heavenMessages.filter((message) => message.conversationId === conversation.id),
      lead: db.heavenLeads.find((lead) => lead.conversationId === conversation.id) || null
    }));
  response.json(conversations);
});

adminHeavenRouter.patch('/conversations/:id/archive', requireAuth('heaven'), (request, response) => {
  const db = readDb();
  const conversation = db.heavenConversations.find((item) => item.id === String(request.params.id));
  if (!conversation) return response.status(404).json({ message: 'Conversation introuvable.' });
  conversation.status = 'archived';
  conversation.updatedAt = new Date().toISOString();
  addActivity(db, request.admin, 'Archivage conversation Heaven', conversation.id);
  writeDb(db);
  response.json(conversation);
});

adminHeavenRouter.delete('/conversations/:id', requireAuth('heaven'), (request, response) => {
  const db = readDb();
  const conversation = db.heavenConversations.find((item) => item.id === String(request.params.id));
  if (!conversation) return response.status(404).json({ message: 'Conversation introuvable.' });
  conversation.status = 'deleted';
  conversation.updatedAt = new Date().toISOString();
  addActivity(db, request.admin, 'Suppression conversation Heaven', conversation.id);
  writeDb(db);
  response.json({ ok: true });
});

adminHeavenRouter.patch('/leads/:id/status', requireAuth('heaven'), (request, response) => {
  const result = leadStatusSchema.safeParse(request.body);
  if (!result.success) return response.status(400).json({ message: 'Statut prospect invalide.' });
  const db = readDb();
  const lead = db.heavenLeads.find((item) => item.id === String(request.params.id));
  if (!lead) return response.status(404).json({ message: 'Prospect introuvable.' });
  lead.status = result.data.status;
  lead.updatedAt = new Date().toISOString();
  addActivity(db, request.admin, 'Modification statut prospect Heaven', lead.email || lead.phone || lead.id);
  writeDb(db);
  response.json(lead);
});

adminHeavenRouter.get('/stats', requireAuth('heaven'), (_request, response) => {
  const db = readDb();
  const activeConversations = db.heavenConversations.filter((conversation) => conversation.status !== 'deleted');
  const serviceCounts = new Map<string, number>();
  db.heavenLeads.forEach((lead) => {
    if (lead.serviceRequested) serviceCounts.set(lead.serviceRequested, (serviceCounts.get(lead.serviceRequested) || 0) + 1);
  });
  const converted = db.heavenLeads.filter((lead) => lead.status === 'converti').length;
  response.json({
    totalConversations: activeConversations.length,
    totalProspects: db.heavenLeads.length,
    conversionRate: db.heavenLeads.length ? Math.round((converted / db.heavenLeads.length) * 100) : 0,
    topServices: [...serviceCounts.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  });
});
