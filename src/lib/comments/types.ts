export interface CommentRecord {
  id: string;
  postSlug: string;
  parentId: string | null;
  name: string;
  email?: string | null;
  avatarUrl: string | null;
  provider?: "github" | "google" | null;
  providerUserId?: string | null;
  userId?: string | null;
  body: string;
  bodyHtml: string;
  status?: "pending" | "approved" | "rejected";
  createdAt: string;
}
