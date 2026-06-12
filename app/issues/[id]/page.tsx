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

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 40 }}>
      <button onClick={() => router.push("/")}>← Back to dashboard</button>

      <h1>{issue.title}</h1>

      <p>{issue.description}</p>

      <hr />

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
        <strong>Status:</strong> {issue.status}
      </p>

      <p>
        <strong>Contractor:</strong> {issue.contractor_name || "Unassigned"}
      </p>

      <hr />

      <ActivityTimeline activity={activity} />
    </div>
  );
}

function formatLabel(value: string) {
  if (value === "maintenance") return "Maintenance";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}