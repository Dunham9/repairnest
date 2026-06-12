"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ActivityTimeline from "@/components/ActivityTimeline";

type Issue = {
  id: string;
  title: string;
  description: string;
  status: string;
  workflow_status: string;
  category: string;
  contractor_name: string | null;
  property_id: string | null;
};

type Property = {
  id: string;
  address: string;
};

type Activity = {
  id: string;
  event_type: string;
  details: string | null;
  created_at: string;
};

export default function IssuePage() {
  const params = useParams();
  const router = useRouter();

  const issueId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [issue, setIssue] = useState<Issue | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);

  useEffect(() => {
    async function loadIssue() {
      const { data: issueData, error: issueError } = await supabase
        .from("issues")
        .select("*")
        .eq("id", issueId)
        .maybeSingle();

      if (issueError) {
        alert(issueError.message);
        setLoading(false);
        return;
      }

      if (!issueData) {
        setLoading(false);
        return;
      }

      setIssue(issueData);

      if (issueData.property_id) {
        const { data: propertyData } = await supabase
          .from("properties")
          .select("id, address")
          .eq("id", issueData.property_id)
          .maybeSingle();

        setProperty(propertyData || null);
      }

      const { data: activityData } = await supabase
        .from("activity_log")
        .select("*")
        .eq("issue_id", issueId)
        .order("created_at", { ascending: false });

      setActivity(activityData || []);

      setLoading(false);
    }

    loadIssue();
  }, [issueId]);

  if (loading) {
    return <div style={{ padding: 40 }}>Loading job...</div>;
  }

  if (!issue) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Job not found</h1>
        <button onClick={() => router.push("/")}>Back to dashboard</button>
      </div>
    );
  }

  const tabs = [
    "overview",
    "workflow",
    "quotes",
    "invoices",
    "photos",
    "comments",
    "activity",
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 40 }}>
      <button onClick={() => router.push("/")}>← Back to dashboard</button>

      <div style={{ marginTop: 20, marginBottom: 24 }}>
        <h1>{issue.title}</h1>
        <p>{property?.address || "Unknown property"}</p>
        <p>
          <strong>Status:</strong> {formatLabel(issue.workflow_status)}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid #ddd",
          marginBottom: 24,
        }}
      >
        {tabs.map((tab) => (
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
            {formatLabel(tab)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div>
          <h2>Overview</h2>

          <p>
            <strong>Property:</strong> {property?.address || "Unknown property"}
          </p>

          <p>
            <strong>Category:</strong> {formatLabel(issue.category)}
          </p>

          <p>
            <strong>Workflow:</strong> {formatLabel(issue.workflow_status)}
          </p>

          <p>
            <strong>Open/Closed:</strong> {issue.status}
          </p>

          <p>
            <strong>Contractor:</strong>{" "}
            {issue.contractor_name || "Unassigned"}
          </p>

          <h3>Description</h3>
          <p>{issue.description}</p>
        </div>
      )}

      {activeTab === "workflow" && (
        <div>
          <h2>Workflow</h2>
          <p>Current stage: {formatLabel(issue.workflow_status)}</p>
          <p>Workflow controls will move here next.</p>
        </div>
      )}

      {activeTab === "quotes" && (
        <div>
          <h2>Quotes</h2>
          <p>Quote documents will show here.</p>
        </div>
      )}

      {activeTab === "invoices" && (
        <div>
          <h2>Invoices</h2>
          <p>Invoice documents will show here.</p>
        </div>
      )}

      {activeTab === "photos" && (
        <div>
          <h2>Photos</h2>
          <p>Issue photos will show here.</p>
        </div>
      )}

      {activeTab === "comments" && (
        <div>
          <h2>Comments</h2>
          <p>Comments will show here.</p>
        </div>
      )}

      {activeTab === "activity" && <ActivityTimeline activity={activity} />}
    </div>
  );
}

function formatLabel(value: string) {
  if (value === "maintenance") return "Maintenance";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}