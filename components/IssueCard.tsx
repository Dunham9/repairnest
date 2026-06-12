"use client";

type Contractor = {
  id: string;
  name: string;
};

type Issue = {
  id: string;
  title: string;
  description: string;
  workflow_status: string;
  category: string;
  requires_attention: boolean;
  contractor_id: string | null;
  contractor_name: string | null;
};

type Comment = {
  id: string;
  issue_id: string;
  content: string;
  created_at: string;
};

type IssuePhoto = {
  id: string;
  issue_id: string;
  photo_url: string;
};

export default function IssueCard({
  issue,
}: {
  issue: Issue;
  contractors: Contractor[];
  comments: Comment[];
  photos: IssuePhoto[];
  commentValue: string;
  setCommentValue: (value: string) => void;
  assignContractor: (issueId: string, contractorId: string) => Promise<void>;
  updateIssueWorkflow: (issueId: string, workflow: string) => Promise<void>;
  toggleAttention: (issueId: string, current: boolean) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<void>;
  addComment: (issueId: string) => Promise<void>;
  refreshPhotos: () => Promise<void>;
  refreshAll: () => Promise<void>;
}) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        background: "white",
      }}
    >
      <h3>{issue.title}</h3>

      <p>
        <strong>{formatLabel(issue.workflow_status)}</strong>
      </p>

      <p>{issue.contractor_name || "Unassigned contractor"}</p>

      <a
        href={`/issues/${issue.id}`}
        style={{
          color: "#2563eb",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        View Job →
      </a>
    </div>
  );
}

function formatLabel(value: string) {
  if (value === "maintenance") return "Maintenance";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}