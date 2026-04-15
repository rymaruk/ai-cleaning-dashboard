export type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  role: "user" | "admin";
  created_at: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_days: number;
  price: number;
  currency: string;
  features: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
};

export type ColumnMappingEntry = {
  source: string;
  target: string | null;
  embed: boolean;
};

export type ColumnMapping = {
  mappings: ColumnMappingEntry[];
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  site_url: string;
  widget_token: string;
  column_mapping: ColumnMapping | null;
  source_file_path: string | null;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  project_id: string;
  plan_id: string;
  status: "active" | "expired" | "cancelled";
  starts_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

export type ProjectProduct = {
  id: string;
  project_id: string;
  external_id: string | null;
  name: string | null;
  description: string | null;
  brand: string | null;
  category: string | null;
  price: number | null;
  currency: string | null;
  url: string | null;
  images: string[] | null;
  extra_data: Record<string, unknown>;
  embedding_text: string | null;
  embedding_hash: string | null;
  created_at: string;
};

export type QueryLog = {
  id: string;
  user_id: string | null;
  query_text: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
  results_shown: Array<{
    id: string;
    name: string;
    brand: string | null;
    price: number | null;
    similarity: number | null;
    is_recommended: boolean;
  }> | null;
  project_id: string | null;
};

export type ProjectWithSubscription = Project & {
  subscription: Subscription | null;
  plan: SubscriptionPlan | null;
  product_count: number;
};
