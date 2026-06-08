export interface Profile {
  id: number;
  nom: string;
  titre: string;
  bio: string;
  ville: string;
  projets: number;
  featured: boolean;
  avatar: string;
  skills: string[];
  username?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  website?: string;
}