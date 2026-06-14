"use client";

type Issue = {
  id: string;
  workflow_status: string;
  status: string;
};

export default function IssueActionPanel({
  issue,
  onRequestQuotes,
  onInstructContractor,
  onResetToReported,
  onCloseJob,
  onAcceptQuote,
}: {
  issue: Issue;
  onRequestQuotes: () => void;
  onInstructContractor: () => void;
  onResetToReported: () => void;
  onCloseJob: () => void;
  onAcceptQuote: () => void;
}) {
  if (issue.status === "closed") {
    return null;
  }

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        background: "white",
        marginBottom: 24,
      }}
    >
      <h2>Actions</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {issue.workflow_status === "reported" && (
          <>
            <button onClick={onRequestQuotes}>Request Quotes</button>
            <button onClick={onInstructContractor}>Instruct Contractor</button>
          </>
        )}

        {issue.workflow_status === "quote_submitted" && (
          <button onClick={onAcceptQuote}>Accept Quote</button>
        )}

        <button onClick={onResetToReported}>Reset to Reported</button>

        <button onClick={onCloseJob}>Close Job</button>
      </div>
    </div>
  );
}