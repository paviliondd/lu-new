export interface CommentRecord {
  id: string;
  postSlug: string;
  parentId: string | null;
  name: string;
  avatarUrl: string | null;
  body: string;
  bodyHtml: string;
  createdAt: string;
}
