"use client";

type Issue = {
  id: string;
  workflow_status: string;
};

export default function AnalyticsDashboard({ issues }: { issues: Issue[] }) {
  const stages = [
    "reported",
    "quote_requested",
    "quote_submitted",
    "job_awarded",
    "job_complete",
    "invoice_submitted",
    "closed",
  ];

  return (
    <div>
      <h2>Analytics</h2>

      {stages.map((stage) => {
        const count = issues.filter(
          (issue) => issue.workflow_status === stage
        ).length;

        return (
          <div
            key={stage}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
              background: "white",
            }}
          >
            <strong>{formatLabel(stage)}</strong>
            <div>{count} jobs</div>
          </div>
        );
      })}
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}