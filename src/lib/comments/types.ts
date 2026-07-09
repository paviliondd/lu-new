export interface CommentRecord {
  id: string;
  postSlug: string;
  parentId: string | null;
  name: string;
  email?: string | null;
  avatarUrl: string | null;
  body: string;
  bodyHtml: string;
  status?: "pending" | "approved" | "rejected";
  createdAt: string;
}
