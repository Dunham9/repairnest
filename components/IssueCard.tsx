"use client";

import PhotoUpload from "@/components/PhotoUpload";
import QuoteUpload from "@/components/QuoteUpload";
import InvoiceUpload from "@/components/InvoiceUpload";

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
  contractors,
  comments,
  photos,
  commentValue,
  setCommentValue,
  assignContractor,
  updateIssueWorkflow,
  toggleAttention,
  deleteIssue,
  addComment,
  refreshPhotos,
  refreshAll,
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
    <div style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
      <h4>{issue.title}</h4>
      <p>{issue.description}</p>

      <p>
        <strong>Category:</strong> {formatLabel(issue.category)}
      </p>

      <p>
        <strong>Workflow:</strong> {formatLabel(issue.workflow_status)}
      </p>

      <p>
        <strong>Contractor:</strong> {issue.contractor_name || "Unassigned"}
      </p>

      <select
        value={issue.contractor_id || ""}
        onChange={(e) => assignContractor(issue.id, e.target.value)}
        style={{ padding: 8, marginRight: 8 }}
      >
        <option value="">Assign contractor</option>
        {contractors.map((contractor) => (
          <option key={contractor.id} value={contractor.id}>
            {contractor.name}
          </option>
        ))}
      </select>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        {issue.workflow_status === "reported" && (
          <button onClick={() => updateIssueWorkflow(issue.id, "quote_requested")}>
            Request Quote
          </button>
        )}

        {issue.workflow_status === "quote_requested" && (
          <span>Awaiting quote upload</span>
        )}

        {issue.workflow_status === "quote_submitted" && (
          <button onClick={() => updateIssueWorkflow(issue.id, "job_awarded")}>
            Accept Quote
          </button>
        )}

        {issue.workflow_status === "job_awarded" && (
          <button onClick={() => updateIssueWorkflow(issue.id, "job_complete")}>
            Mark Job Complete
          </button>
        )}

        {issue.workflow_status === "job_complete" && (
          <span>Awaiting invoice upload</span>
        )}

        {issue.workflow_status === "invoice_submitted" && (
          <button onClick={() => updateIssueWorkflow(issue.id, "closed")}>
            Close Job
          </button>
        )}

        {issue.workflow_status === "closed" && <strong>Job Closed</strong>}
      </div>

      <button onClick={() => toggleAttention(issue.id, issue.requires_attention)}>
        {issue.requires_attention ? "Clear Attention" : "Mark Attention"}
      </button>

      <button onClick={() => deleteIssue(issue.id)}>Delete</button>

      <div style={{ marginTop: 12 }}>
        <strong>Quote</strong>

        {issue.workflow_status === "quote_requested" && (
          <QuoteUpload
            issueId={issue.id}
            contractorId={issue.contractor_id}
            refreshAll={refreshAll}
          />
        )}

        {issue.workflow_status === "quote_submitted" && (
          <p>Quote received. Awaiting agent approval.</p>
        )}

        {issue.workflow_status === "job_awarded" && (
          <p>Quote accepted. Job awarded.</p>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Invoice</strong>

        {issue.workflow_status === "job_complete" && (
          <InvoiceUpload
            issueId={issue.id}
            contractorId={issue.contractor_id}
            refreshAll={refreshAll}
          />
        )}

        {issue.workflow_status === "invoice_submitted" && (
          <p>Invoice received. Ready to close.</p>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Photos</strong>

        {photos.length === 0 && <p>No photos yet.</p>}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.photo_url}
              alt="Issue photo"
              style={{
                width: 120,
                height: 120,
                objectFit: "cover",
                border: "1px solid #ddd",
              }}
            />
          ))}
        </div>

        <PhotoUpload issueId={issue.id} refreshPhotos={refreshPhotos} />
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Comments</strong>

        {comments.length === 0 && <p>No comments yet.</p>}

        {comments.map((comment) => (
          <div
            key={comment.id}
            style={{ background: "#f5f5f5", padding: 8, marginTop: 8 }}
          >
            <p>{comment.content}</p>
            <small>{new Date(comment.created_at).toLocaleString()}</small>
          </div>
        ))}

        <input
          placeholder="Add comment"
          value={commentValue}
          onChange={(e) => setCommentValue(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            marginTop: 8,
            marginBottom: 8,
          }}
        />

        <button onClick={() => addComment(issue.id)}>Add Comment</button>
      </div>
    </div>
  );
}

function formatLabel(value: string) {
  if (value === "maintenance") return "Maintenance";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}