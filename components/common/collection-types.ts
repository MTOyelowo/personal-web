export interface CollectionPost {
  id: string;
  title: string;
  slug: string;
  meta: string;
  thumbnailUrl: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CollectionData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  items: {
    id: string;
    order: number;
    post: CollectionPost;
  }[];
}
