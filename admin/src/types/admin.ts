export type AdminRole = 'super_admin' | 'editor' | 'moderator' | 'readonly';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  lastLoginAt?: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  active: boolean;
  createdAt: string;
};

export type SitePage = {
  id: string;
  slug: 'accueil' | 'services' | 'apropos' | 'portfolio' | 'contact';
  name: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  image: string;
  sections: Array<{ id: string; label: string; visible: boolean; order: number }>;
  updatedAt: string;
  draft?: Pick<SitePage, 'title' | 'subtitle' | 'description' | 'buttonText' | 'image' | 'sections'> & {
    updatedAt: string;
  };
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'nouveau' | 'lu' | 'traite';
  createdAt: string;
};

export type Visit = {
  id: string;
  ip: string;
  country: string;
  city: string;
  page: string;
  referrer: string;
  browser: string;
  os: string;
  device: string;
  createdAt: string;
};

export type MediaItem = {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  linkedTo?: string;
  createdAt: string;
};

export type Activity = {
  id: string;
  action: string;
  userId: string;
  userEmail: string;
  target: string;
  createdAt: string;
};

export type DashboardStats = {
  totalVisitors: number;
  todayVisitors: number;
  totalMessages: number;
  topPages: Array<{ name: string; value: number }>;
  countries: Array<{ name: string; value: number }>;
  devices: Array<{ name: string; value: number }>;
  browsers: Array<{ name: string; value: number }>;
  timeline: Array<{ day: string; visiteurs: number; messages: number }>;
  latestLogins: Activity[];
};

export type HeavenSettings = {
  enabled: boolean;
  botName: string;
  welcomeMessage: string;
  systemPrompt: string;
  quickSuggestions: string[];
  faqs: Array<{ id: string; question: string; answer: string }>;
  services: Array<{ id: string; title: string; description: string; active: boolean }>;
  whatsappNumber: string;
  receiverEmail: string;
};

export type HeavenLead = {
  id: string;
  conversationId: string;
  name: string;
  phone: string;
  email: string;
  serviceRequested: string;
  budget: string;
  status: 'nouveau' | 'contacte' | 'en_discussion' | 'converti' | 'abandonne';
  createdAt: string;
  updatedAt: string;
};

export type HeavenConversation = {
  id: string;
  visitorId: string;
  status: 'active' | 'archived' | 'deleted';
  sourcePage: string;
  serviceRequested?: string;
  leadId?: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{ id: string; conversationId: string; role: 'user' | 'assistant' | 'system'; content: string; createdAt: string }>;
  lead: HeavenLead | null;
};

export type HeavenStats = {
  totalConversations: number;
  totalProspects: number;
  conversionRate: number;
  topServices: Array<{ name: string; value: number }>;
};

export type AiControlAction = {
  id: 'reply-mails' | 'update-content' | 'refresh-images' | 'visitor-report' | 'organize-admin';
  title: string;
  status: 'pret' | 'en_attente';
  risk: string;
  preview: string;
};

export type AiVisitorReport = {
  totalVisitors: number;
  todayVisits: number;
  newMessages: number;
  topPages: Array<{ page: string; count: number }>;
  summary: string;
};

export type AiControlOverview = {
  enabled: boolean;
  mode: 'controle_admin';
  headline: string;
  description: string;
  report: AiVisitorReport;
  actions: AiControlAction[];
};
