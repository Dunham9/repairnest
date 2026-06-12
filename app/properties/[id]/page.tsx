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

export default function PropertyPage() {
  const params = useParams();
  const router = useRouter();

  const propertyId = params.id as string;

  const [loading, setLoading] = useState(true);

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

      <hr />

      <h2>Open Jobs</h2>

      {openJobs.length === 0 && <p>No open jobs.</p>}

      {openJobs.map((job) => (
        <div
          key={job.id}
          style={{
            border: "1px solid #ddd",
            padding: 15,
            marginBottom: 10,
          }}
        >
          <strong>{job.title}</strong>

          <p>{formatLabel(job.workflow_status)}</p>

          <button
            onClick={() => router.push(`/issues/${job.id}`)}
          >
            View Job
          </button>
        </div>
      ))}

      <hr />

      <h2>Closed Jobs</h2>

      {closedJobs.length === 0 && <p>No closed jobs.</p>}

      {closedJobs.map((job) => (
        <div
          key={job.id}
          style={{
            border: "1px solid #ddd",
            padding: 15,
            marginBottom: 10,
          }}
        >
          <strong>{job.title}</strong>

          <button
            onClick={() => router.push(`/issues/${job.id}`)}
          >
            View Job
          </button>
        </div>
      ))}

      <hr />

      <h2>Compliance</h2>

      {complianceJobs.length === 0 && (
        <p>No compliance records.</p>
      )}

      {complianceJobs.map((job) => (
        <div
          key={job.id}
          style={{
            border: "1px solid #ddd",
            padding: 15,
            marginBottom: 10,
          }}
        >
          <strong>{job.title}</strong>

          <p>{formatLabel(job.category)}</p>

          <button
            onClick={() => router.push(`/issues/${job.id}`)}
          >
            View Job
          </button>
        </div>
      ))}
    </div>
  );
}

function formatLabel(value: string) {
  if (value === "maintenance") return "Maintenance";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}