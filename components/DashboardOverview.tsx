"use client";

type Issue = {
  id: string;
  title: string;
  status: string;
  workflow_status: string;
  category: string;
  property_id: string | null;
  contractor_name: string | null;
  requires_attention: boolean;
  invoice_submitted: boolean;
};

type Property = {
  id: string;
  address: string;
};

export default function DashboardOverview({
  issues,
  properties,
}: {
  issues: Issue[];
  properties: Property[];
}) {
  const reportedCount = issues.filter(
    (i) => i.workflow_status === "reported"
  ).length;

  const openCount = issues.filter((i) => i.status === "open").length;

  const attentionCount = issues.filter((i) => i.requires_attention).length;

  const gasSafetyCount = issues.filter(
    (i) => i.category === "gas_safety"
  ).length;

  const eicrCount = issues.filter((i) => i.category === "eicr").length;

  const epcCount = issues.filter((i) => i.category === "epc").length;

  const quotedIssues = issues.filter(
    (i) => i.workflow_status === "quote_submitted"
  );

  const invoiceIssues = issues.filter((i) => i.invoice_submitted);

  const workflowStages = [
    "reported",
    "quote_requested",
    "quote_submitted",
    "job_awarded",
    "job_complete",
    "invoice_submitted",
    "closed",
  ];

  function getPropertyAddress(propertyId: string | null) {
    const property = properties.find((p) => p.id === propertyId);
    return property?.address || "Unknown property";
  }

  return (
    <>
      <h2>Operations</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <DashboardBubble label="Reported" value={reportedCount} />
        <DashboardBubble
          label="Issues Requiring Attention"
          value={attentionCount}
        />
        <DashboardBubble label="Open Jobs" value={openCount} />
      </div>

      <h2>Compliance</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <DashboardBubble label="Gas Safety" value={gasSafetyCount} />
        <DashboardBubble label="EICR" value={eicrCount} />
        <DashboardBubble label="EPC" value={epcCount} />
      </div>

      <h2>Finance</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 30,
        }}
      >
        <FinanceGrid
          title="Quotes Submitted"
          issues={quotedIssues}
          getPropertyAddress={getPropertyAddress}
        />

        <FinanceGrid
          title="Invoices Submitted"
          issues={invoiceIssues}
          getPropertyAddress={getPropertyAddress}
        />
      </div>

      <h2>Workflow Overview</h2>

      <div style={{ display: "grid", gap: 10, marginBottom: 30 }}>
        {workflowStages.map((stage) => (
          <div
            key={stage}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 14,
              background: "white",
            }}
          >
            <strong>{formatLabel(stage)}</strong>

            <div>
              {issues.filter((issue) => issue.workflow_status === stage).length}{" "}
              jobs
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function FinanceGrid({
  title,
  issues,
  getPropertyAddress,
}: {
  title: string;
  issues: Issue[];
  getPropertyAddress: (propertyId: string | null) => string;
}) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        background: "white",
        minHeight: 180,
      }}
    >
      <h3>{title}</h3>

      {issues.length === 0 && <p>None yet.</p>}

      {issues.map((issue) => (
        <a
          key={issue.id}
          href={`/issues/${issue.id}`}
          style={{
            display: "block",
            borderTop: "1px solid #eee",
            padding: "12px 0",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <strong>{issue.title}</strong>
          <div style={{ color: "#666", marginTop: 4 }}>
            {getPropertyAddress(issue.property_id)}
          </div>
        </a>
      ))}
    </div>
  );
}

function DashboardBubble({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        flex: 1,
        border: "1px solid #ddd",
        borderRadius: 999,
        padding: "14px 18px",
        textAlign: "center",
        background: "#fff",
      }}
    >
      <div style={{ fontSize: 13, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}