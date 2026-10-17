export interface Profile {
  name: string;
  title: string;
  tagline: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  portfolio: string;
  summary: string;
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  period: string;
  coursework: string[];
}

export interface Experience {
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

export interface Project {
  slug: string;
  title: string;
  badge: string;
  stack: string[];
  description: string[];
  image?: string;
  imageCaption?: string;
}

export interface SkillGroup {
  group: string;
  skills: string[];
  note?: string;
}

export interface Achievement {
  title: string;
  detail?: string;
}

export interface Certification {
  title: string;
  issuer: string;
}
