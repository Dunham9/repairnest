"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  address: string;
};

type Issue = {
  id: string;
  title: string;
  workflow_status: string;
  status: string;
  category: string;
};

type Activity = {
  id: string;
  issue_id: string;
  event_type: string;
  details: string | null;
  created_at: string;
};

export default function PropertyPage() {
  const params = useParams();
  const router = useRouter();

  const propertyId = params.id as string;

  const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState("Overview");
const [activity, setActivity] = useState<Activity[]>([]);

  const [property, setProperty] = useState<Property | null>(null);

  const [openJobs, setOpenJobs] = useState<Issue[]>([]);
  const [closedJobs, setClosedJobs] = useState<Issue[]>([]);
  const [complianceJobs, setComplianceJobs] = useState<Issue[]>([]);
  

  useEffect(() => {
    async function loadProperty() {
      const { data: propertyData } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .maybeSingle();

      if (!propertyData) {
        setLoading(false);
        return;
      }

      setProperty(propertyData);

      const { data: issues } = await supabase
        .from("issues")
        .select("*")
        .eq("property_id", propertyId);

      const issueList = issues || [];

      setOpenJobs(issueList.filter((i) => i.status === "open"));

      setClosedJobs(issueList.filter((i) => i.status === "closed"));

      setComplianceJobs(
        issueList.filter(
          (i) =>
            i.category === "gas_safety" ||
            i.category === "eicr" ||
            i.category === "epc"
        )
      );
      
const issueIds = issueList.map((issue) => issue.id);

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

    loadProperty();
  }, [propertyId]);

  if (loading) {
    return <div style={{ padding: 40 }}>Loading property...</div>;
  }

  if (!property) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Property not found</h1>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 40 }}>
      <button onClick={() => router.push("/")}>
        ← Back to dashboard
      </button>

      <h1>{property.address}</h1>
      <div
  style={{
    display: "flex",
    gap: 8,
    borderBottom: "1px solid #ddd",
    marginBottom: 24,
  }}
>
{["Overview", "Open Jobs", "History", "Compliance", "Activity"].map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      style={{
        padding: "10px 14px",
        border: "none",
        borderBottom:
          activeTab === tab ? "3px solid black" : "3px solid transparent",
        background: "transparent",
        cursor: "pointer",
        fontWeight: activeTab === tab ? "bold" : "normal",
      }}
    >
      {tab}
    </button>
  ))}
</div>

     <hr />

{activeTab === "Overview" && (
  <>
    <h2>Overview</h2>

    <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
      <PropertyBubble label="Open Jobs" value={openJobs.length} />
      <PropertyBubble label="History" value={closedJobs.length} />
      <PropertyBubble label="Compliance" value={complianceJobs.length} />
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          background: "white",
        }}
      >
        <h3>Last Activity</h3>

        {activity.length === 0 ? (
          <p>No activity yet.</p>
        ) : (
          <>
            <strong>{activity[0].event_type}</strong>
            <p style={{ color: "#666" }}>
              {new Date(activity[0].created_at).toLocaleString()}
            </p>
            {activity[0].details && <p>{activity[0].details}</p>}
          </>
        )}
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          background: "white",
        }}
      >
        <h3>Property Summary</h3>
        <p>{property.address}</p>
        <p>{openJobs.length} open job(s)</p>
      </div>
    </div>
  </>
)}

{activeTab === "Open Jobs" && (
  <>
    <h2>Open Jobs</h2>

    {openJobs.length === 0 && <p>No open jobs.</p>}

    {openJobs.map((job) => (
      <div key={job.id} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 10 }}>
        <strong>{job.title}</strong>
        <p>{formatLabel(job.workflow_status)}</p>
        <button onClick={() => router.push(`/issues/${job.id}`)}>View Job</button>
      </div>
    ))}
  </>
)}

{activeTab === "History" && (
  <>
    <h2>History</h2>

    {closedJobs.length === 0 && <p>No closed jobs.</p>}

    {closedJobs.map((job) => (
      <div key={job.id} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 10 }}>
        <strong>{job.title}</strong>
        <button onClick={() => router.push(`/issues/${job.id}`)}>View Job</button>
      </div>
    ))}
  </>
)}

{activeTab === "Compliance" && (
  
  <>
    <h2>Compliance</h2>

    {complianceJobs.length === 0 && <p>No compliance records.</p>}

    {complianceJobs.map((job) => (
      <div key={job.id} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 10 }}>
        <strong>{job.title}</strong>
        <p>{formatLabel(job.category)}</p>
        <button onClick={() => router.push(`/issues/${job.id}`)}>View Job</button>
      </div>
    ))}
  </>
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
function PropertyBubble({ label, value }: { label: string; value: number }) {
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
  if (value === "maintenance") return "Maintenance";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}