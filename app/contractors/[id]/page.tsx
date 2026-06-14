"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Contractor = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  trade: string | null;
};

type Issue = {
  id: string;
  title: string;
  status: string;
  workflow_status: string;
  property_id: string | null;
};

  type Activity = {
  id: string;
  issue_id: string;
  event_type: string;
  details: string | null;
  created_at: string;
};

export default function ContractorPage() {
  const params = useParams();
  const router = useRouter();

  const contractorId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);

  useEffect(() => {
    async function loadContractor() {
      const { data: contractorData } = await supabase
        .from("contractors")
        .select("*")
        .eq("id", contractorId)
        .maybeSingle();

      if (!contractorData) {
        setLoading(false);
        return;
      }

      setContractor(contractorData);

      const { data: issueData } = await supabase
        .from("issues")
        .select("*")
        .eq("contractor_id", contractorId);

      setIssues(issueData || []);

      const issueIds = (issueData || []).map((issue) => issue.id);

if (issueIds.length > 0) {
  const { data: activityData } = await supabase
    .from("activity_log")
    .select("*")
    .in("issue_id", issueIds)
    .order("created_at", { ascending: false });

  setActivity(activityData || []);
}
      setLoading(false);
    }

    loadContractor();
  }, [contractorId]);

  if (loading) {
    return <div style={{ padding: 40 }}>Loading contractor...</div>;
  }

  if (!contractor) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Contractor not found</h1>
        <button onClick={() => router.push("/")}>Back to dashboard</button>
      </div>
    );
  }

  const awardedJobs = issues.filter(
  (issue) => issue.workflow_status === "job_awarded"
);

const quoteRequestedJobs = issues.filter(
  (issue) => issue.workflow_status === "quote_requested"
);

const quoteSubmittedJobs = issues.filter(
  (issue) => issue.workflow_status === "quote_submitted"
);

const invoiceSubmittedJobs = issues.filter(
  (issue) => issue.workflow_status === "invoice_submitted"
);

const historyJobs = issues.filter(
  (issue) => issue.status === "closed"
);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 40 }}>
      <button onClick={() => router.push("/")}>← Back to dashboard</button>

      <h1>{contractor.name}</h1>

      <p>{contractor.trade || "No trade listed"}</p>
      <p>{contractor.phone || "No phone"} | {contractor.email || "No email"}</p>

      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid #ddd",
          marginBottom: 24,
        }}
      >
        {["Overview", "Open Jobs", "Quotes Requested", "Quotes Submitted", "Invoices Submitted", "History", "Activity"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 14px",
                border: "none",
                borderBottom:
                  activeTab === tab
                    ? "3px solid black"
                    : "3px solid transparent",
                background: "transparent",
                cursor: "pointer",
                fontWeight: activeTab === tab ? "bold" : "normal",
              }}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {activeTab === "Overview" && (
        <>
          <h2>Overview</h2>

          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
      <ContractorBubble label="Open Jobs" value={awardedJobs.length} />
<ContractorBubble label="Quotes Requested" value={quoteRequestedJobs.length} />
<ContractorBubble label="Quotes Submitted" value={quoteSubmittedJobs.length} />
<ContractorBubble label="Invoices Submitted" value={invoiceSubmittedJobs.length} />
<ContractorBubble label="History" value={historyJobs.length} />
          </div>
        </>
      )}

   {activeTab === "Open Jobs" && (
  <ContractorJobList
    title="Open Jobs"
    jobs={awardedJobs}
    router={router}
  />
)}

{activeTab === "Quotes Requested" && (
  <ContractorJobList
    title="Quotes Requested"
    jobs={quoteRequestedJobs}
    router={router}
  />
)}

{activeTab === "Quotes Submitted" && (
  <ContractorJobList
    title="Quotes Submitted"
    jobs={quoteSubmittedJobs}
    router={router}
  />
)}

{activeTab === "Invoices Submitted" && (
  <ContractorJobList
    title="Invoices Submitted"
    jobs={invoiceSubmittedJobs}
    router={router}
  />
)}

{activeTab === "History" && (
  <ContractorJobList
    title="History"
    jobs={historyJobs}
    router={router}
  />
)}
{activeTab === "Activity" && (
  <>
    <h2>Activity</h2>

    {activity.length === 0 && <p>No activity yet.</p>}

    {activity.map((item) => (
      <div
        key={item.id}
        style={{
          borderLeft: "3px solid #ddd",
          paddingLeft: 15,
          marginBottom: 20,
        }}
      >
        <div style={{ color: "#666", fontSize: 14 }}>
          {new Date(item.created_at).toLocaleString()}
        </div>

        <div style={{ fontWeight: "bold" }}>
          {item.event_type}
        </div>

        {item.details && (
          <div style={{ color: "#555" }}>
            {item.details}
          </div>
        )}
      </div>
    ))}
  </>
)}
    </div>
  );
}

function ContractorJobList({
  title,
  jobs,
  router,
}: {
  title: string;
  jobs: Issue[];
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <>
      <h2>{title}</h2>

      {jobs.length === 0 && <p>No jobs.</p>}

      {jobs.map((job) => (
        <div
          key={job.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 15,
            marginBottom: 10,
            background: "white",
          }}
        >
          <strong>{job.title}</strong>
          <p>{formatLabel(job.workflow_status)}</p>

          <button onClick={() => router.push(`/issues/${job.id}`)}>
            View Job
          </button>
        </div>
      ))}
    </>
  );
}

function ContractorBubble({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        flex: 1,
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        background: "white",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 13, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}