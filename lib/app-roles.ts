export const APP_ROLES = [
  "spiritual_director",
  "elder",
  "head_servant",
  "asst_head_servant",
  "ministry_head",
  "builder",
  "cluster_head",
  "ministry_coordinator",
  "finance",
  "member",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  spiritual_director: "Spiritual Director",
  elder: "Elder",
  head_servant: "Head Servant",
  asst_head_servant: "Asst. Head Servant",
  ministry_head: "Ministry Head",
  builder: "Builder",
  cluster_head: "Cluster Head",
  ministry_coordinator: "Master of Ceremonies",
  finance: "Finance Officer",
  member: "Member",
};
