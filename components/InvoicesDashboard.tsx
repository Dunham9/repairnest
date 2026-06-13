"use client";

type Issue = {
  id: string;
  title: string;
  workflow_status: string;
  contractor_name: string | null;
  property_id: string | null;
  invoice_submitted: boolean;
};

type Property = {
  id: string;
  address: string;
};

export default function InvoicesDashboard({
  issues,
  properties,
}: {
  issues: Issue[];
  properties: Property[];
}) {
  const invoiceIssues = issues.filter(
    (issue) => issue.invoice_submitted
  );

  return (
    <div>
      <h2>Invoices Submitted</h2>

      {invoiceIssues.length === 0 && (
        <p>No invoices submitted yet.</p>
      )}

      {invoiceIssues.map((issue) => {
        const property = properties.find(
          (p) => p.id === issue.property_id
        );

        return (
          <div
            key={issue.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              background: "white",
            }}
          >
            <h3>{issue.title}</h3>

            <p>
              <strong>Property:</strong>{" "}
              {property?.address || "Unknown property"}
            </p>

            <p>
              <strong>Contractor:</strong>{" "}
              {issue.contractor_name || "Unassigned"}
            </p>

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
      })}
    </div>
  );
}