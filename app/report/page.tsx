"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  address: string;
  organization_id: string;
};

export default function TenantReportPage() {
  const [loading, setLoading] = useState(true);
  const [validLink, setValidLink] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);

  const [propertyId, setPropertyId] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function loadReportLink() {
      const token = new URLSearchParams(window.location.search).get("token");

      if (!token) {
        setValidLink(false);
        setLoading(false);
        return;
      }

      const { data: link, error: linkError } = await supabase
        .from("tenant_report_links")
        .select("*")
        .eq("token", token)
        .eq("active", true)
        .maybeSingle();

      if (linkError || !link) {
        setValidLink(false);
        setLoading(false);
        return;
      }

      setOrganizationId(link.organization_id);
      setValidLink(true);

      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select("*")
        .eq("organization_id", link.organization_id)
        .order("address", { ascending: true });

      if (propertyError) {
        console.error("Property error:", propertyError);
      }

      setProperties(propertyData || []);
      setLoading(false);
    }

    loadReportLink();
  }, []);

  async function submitReport() {
    if (!organizationId || !propertyId || !title.trim()) {
      alert("Please select a property and enter the issue title.");
      return;
    }

    const fullDescription = `
Tenant name: ${tenantName || "Not provided"}
Tenant email: ${tenantEmail || "Not provided"}
Tenant phone: ${tenantPhone || "Not provided"}

Description:
${description || "No description provided"}
    `.trim();

    const { error } = await supabase.from("issues").insert([
      {
        organization_id: organizationId,
        property_id: propertyId,
        title: title.trim(),
        description: fullDescription,
        status: "open",
        workflow_status: "reported",
        category: "maintenance",
        requires_attention: false,
        quote_submitted: false,
        invoice_submitted: false,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setSubmitted(true);
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Loading repair form...</div>;
  }

  if (!validLink) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Invalid repair link</h1>
        <p>This repair reporting link is invalid or no longer active.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Repair reported</h1>
        <p>Thank you. Your repair has been sent to the letting agent.</p>
        <p>You do not need an account to report a repair.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "60px auto", padding: 20 }}>
      <h1>Report a Repair</h1>

      <p>
        You can report a repair without creating an account. Creating an account
        later will allow you to track repair history and updates.
      </p>

      <select
        value={propertyId}
        onChange={(e) => setPropertyId(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      >
        <option value="">Select your property</option>
        {properties.map((property) => (
          <option key={property.id} value={property.id}>
            {property.address}
          </option>
        ))}
      </select>

      <input
        placeholder="Your name"
        value={tenantName}
        onChange={(e) => setTenantName(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        placeholder="Your email"
        value={tenantEmail}
        onChange={(e) => setTenantEmail(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        placeholder="Your phone"
        value={tenantPhone}
        onChange={(e) => setTenantPhone(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        placeholder="What is the problem?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <textarea
        placeholder="Please describe the issue"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 10,
          minHeight: 120,
        }}
      />

      <button onClick={submitReport} style={{ padding: 12, width: "100%" }}>
        Submit Repair
      </button>
    </div>
  );
}