export type AdminRole = 'super_admin' | 'editor' | 'moderator' | 'readonly';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
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

export type HeavenConversation = {
  id: string;
  visitorId: string;
  status: 'active' | 'archived' | 'deleted';
  sourcePage: string;
  serviceRequested?: string;
  leadId?: string;
  createdAt: string;
  updatedAt: string;
};

export type HeavenMessage = {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
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

export type Database = {
  admins: AdminUser[];
  pages: SitePage[];
  services: Service[];
  messages: ContactMessage[];
  visits: Visit[];
  media: MediaItem[];
  activity: Activity[];
  heavenSettings: HeavenSettings;
  heavenConversations: HeavenConversation[];
  heavenMessages: HeavenMessage[];
  heavenLeads: HeavenLead[];
};

declare global {
  namespace Express {
    interface Request {
      admin?: AdminUser;
    }
  }
}
