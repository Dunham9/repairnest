"use client";

import ContractorWorkloadChart from "@/components/ContractorWorkloadChart";

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
  const reportedCount = issues.filter((i) => i.workflow_status === "reported").length;
  const openCount = issues.filter((i) => i.status === "open").length;
  const attentionCount = issues.filter((i) => i.requires_attention).length;

  const gasSafetyCount = issues.filter((i) => i.category === "gas_safety").length;
  const eicrCount = issues.filter((i) => i.category === "eicr").length;
  const epcCount = issues.filter((i) => i.category === "epc").length;

  const quotedIssues = issues.filter((i) => i.workflow_status === "quote_submitted");
  const invoiceIssues = issues.filter((i) => i.invoice_submitted);
  

const workflowStages = [
  {
    key: "reported",
    label: "Reported",
  },
  {
    key: "quote_requested",
    label: "Quotes Requested",
  },
  {
    key: "quote_submitted",
    label: "Quotes Submitted",
  },
  {
    key: "job_awarded",
    label: "Job Awarded, Awaiting Appointment Date",
  },
  {
    key: "job_complete",
    label: "Job Complete, Awaiting Invoice",
  },
  {
    key: "invoice_submitted",
    label: "Invoices Submitted, Job Ready For Closure",
  },
];

const workflowData = workflowStages.map((stage) => ({
  stage: stage.key,
  label: stage.label,
  count: issues.filter(
    (issue) => issue.workflow_status === stage.key
  ).length,
}));

  function getPropertyAddress(propertyId: string | null) {
    const property = properties.find((p) => p.id === propertyId);
    return property?.address || "Unknown property";
  }

  return (
    <>
      <h2>Operations</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <DashboardBubble label="Reported" value={reportedCount} />
        <DashboardBubble label="Issues Requiring Attention" value={attentionCount} />
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

      <WorkflowPie data={workflowData} />

      <ContractorWorkloadChart issues={issues} />
      
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

function WorkflowPie({
  data,
}: {
  data: { stage: string; label: string; count: number }[];
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 20,
        background: "white",
        marginBottom: 30,
      }}
    >
      {total === 0 ? (
        <p>No workflow data yet.</p>
      ) : (
        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: buildConicGradient(data),
              border: "1px solid #eee",
            }}
          />

          <div style={{ flex: 1 }}>
            {data.map((item) => (
              <div
                key={item.stage}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #eee",
                  padding: "8px 0",
                }}
              >
          <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
  }}
>
  <div
    style={{
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: [
        "#2563eb",
        "#7c3aed",
        "#db2777",
        "#ea580c",
        "#ca8a04",
        "#16a34a",
      ][data.indexOf(item)],
    }}
  />

  <span>{item.label}</span>
</div>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function buildConicGradient(data: { stage: string; count: number }[]) {
  const colors = [
    "#2563eb",
    "#7c3aed",
    "#db2777",
    "#ea580c",
    "#ca8a04",
    "#16a34a",
    "#475569",
  ];

  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return "#eee";
  }

  let current = 0;

  const parts = data.map((item, index) => {
    const start = current;
    const end = current + (item.count / total) * 100;
    current = end;

    return `${colors[index]} ${start}% ${end}%`;
  });

  return `conic-gradient(${parts.join(", ")})`;
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