// Blog veri modeli ve tipleri

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

export interface BlogComment {
  id: string;
  postId: string;
  author: string | BlogAuthor;
  content: string;
  createdAt: string;
  parentId?: string;
  approved?: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: BlogCategory | string;
  author: BlogAuthor | string;
  tags?: string[];
  publishedAt: string;
  updatedAt?: string;
  views?: number;
  featured?: boolean;
  comments?: BlogComment[];
  seoTitle?: string;
  seoDescription?: string;
}
