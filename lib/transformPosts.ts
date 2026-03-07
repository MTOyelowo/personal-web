export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  meta: string;
  content: string;
  tags: string[];
  thumbnailUrl: string | null;
  thumbnailBlobPath: string | null;
  featured: boolean;
  editorPick: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  collectionItems?: {
    id: string;
    collectionId: string;
    collection: {
      id: string;
      title: string;
      slug: string;
    };
  }[];
}

export function getReadTime(content: string): number {
  const text = content.replace(/<[^>]+>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
