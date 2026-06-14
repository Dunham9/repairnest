"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ActivityTimeline from "@/components/ActivityTimeline";
import IssueActionPanel from "@/components/IssueActionPanel";

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

type QuoteRequest = {
  id: string;
  issue_id: string;
  contractor_id: string | null;
  contractor_name: string;
  status: string;
  quote_amount: number | null;
  quote_url: string | null;
  notes: string | null;
  created_at: string;
  submitted_at: string | null;
};

type Contractor = {
  id: string;
  name: string;
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
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
 
  const [contractors, setContractors] = useState<Contractor[]>([]);
const [showQuoteBox, setShowQuoteBox] = useState(false);
const [quoteMessage, setQuoteMessage] = useState("");
const [selectedQuoteContractorIds, setSelectedQuoteContractorIds] = useState<string[]>([]);

const [showInstructionBox, setShowInstructionBox] = useState(false);
const [instructionContractorId, setInstructionContractorId] = useState("");
const [instructionAmount, setInstructionAmount] = useState("");
const [instructionMessage, setInstructionMessage] = useState("");

const [showCloseBox, setShowCloseBox] = useState(false);
const [closureReason, setClosureReason] = useState("");

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

      const { data: contractorData } = await supabase
  .from("contractors")
  .select("id, name")
  .order("name", { ascending: true });

setContractors(contractorData || []);

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

      const { data: quoteRequestData } = await supabase
  .from("issue_quote_requests")
  .select("*")
  .eq("issue_id", issueId)
  .order("created_at", { ascending: false });

setQuoteRequests(quoteRequestData || []);

      setLoading(false);
    }

    loadIssue();
  }, [issueId]);

async function sendQuoteRequests() {
  if (!issue) return;

  if (selectedQuoteContractorIds.length === 0) {
    alert("Select at least one contractor");
    return;
  }

  const selectedContractors = contractors.filter((contractor) =>
    selectedQuoteContractorIds.includes(contractor.id)
  );

  const rows = selectedContractors.map((contractor) => ({
    issue_id: issue.id,
    contractor_id: contractor.id,
    contractor_name: contractor.name,
    status: "requested",
    notes: quoteMessage || null,
  }));

  const { error } = await supabase
    .from("issue_quote_requests")
    .insert(rows);

  if (error) {
    alert(error.message);
    return;
  }

  await supabase
    .from("issues")
    .update({
      workflow_status: "quote_requested",
      quote_request_message: quoteMessage || null,
    })
    .eq("id", issue.id);

  setShowQuoteBox(false);
  setQuoteMessage("");
  setSelectedQuoteContractorIds([]);

  window.location.reload();
}

async function acceptQuote(quote: QuoteRequest) {
  if (!issue) return;

  const { error: quoteError } = await supabase
    .from("issue_quote_requests")
    .update({ status: "accepted" })
    .eq("id", quote.id);

  if (quoteError) {
    alert(quoteError.message);
    return;
  }

  await supabase
    .from("issue_quote_requests")
    .update({ status: "unsuccessful" })
    .eq("issue_id", issue.id)
    .neq("id", quote.id);

  const { error: issueError } = await supabase
    .from("issues")
    .update({
      workflow_status: "job_awarded",
      contractor_id: quote.contractor_id,
      contractor_name: quote.contractor_name,
      accepted_quote_contractor_id: quote.contractor_id,
    })
    .eq("id", issue.id);

  if (issueError) {
    alert(issueError.message);
    return;
  }

  window.location.reload();
}

async function sendInstruction() {
  if (!issue) return;

  if (!instructionContractorId) {
    alert("Select a contractor");
    return;
  }

  const contractor = contractors.find(
    (c) => c.id === instructionContractorId
  );

  if (!contractor) {
    alert("Contractor not found");
    return;
  }

  const { error } = await supabase
    .from("issues")
    .update({
      workflow_status: "job_awarded",
      contractor_id: contractor.id,
      contractor_name: contractor.name,
      instruction_amount: instructionAmount || null,
      instruction_message: instructionMessage || null,
    })
    .eq("id", issue.id);

  if (error) {
    alert(error.message);
    return;
  }

  window.location.reload();
}

async function resetToReported() {
  if (!issue) return;

  const { error } = await supabase
    .from("issues")
    .update({
      workflow_status: "reported",
      contractor_id: null,
      contractor_name: null,
      instruction_amount: null,
      instruction_message: null,
      quote_request_message: null,
      accepted_quote_contractor_id: null,
      accepted_quote_notes: null,
    })
    .eq("id", issue.id);

  if (error) {
    alert(error.message);
    return;
  }

  window.location.reload();
}
async function closeJob() {
  if (!issue) return;

  if (!closureReason) {
    alert("Select a closure reason");
    return;
  }

  const { error } = await supabase
    .from("issues")
    .update({
      status: "closed",
      workflow_status: "closed",
      closure_reason: closureReason,
    })
    .eq("id", issue.id);

  if (error) {
    alert(error.message);
    return;
  }

  window.location.reload();
}
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
    "detail",
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

          <IssueActionPanel
  issue={issue}
  onRequestQuotes={() => setShowQuoteBox(true)}
onInstructContractor={() => setShowInstructionBox(true)}
onResetToReported={resetToReported}
onCloseJob={() => setShowCloseBox(true)}
onAcceptQuote={() => setActiveTab("quotes")}
/>

{showQuoteBox && (
  <div
    style={{
      border: "1px solid #ddd",
      borderRadius: 12,
      padding: 16,
      background: "#f8f8f8",
      marginBottom: 24,
    }}
    >
  {showInstructionBox && (
  <div
    style={{
      border: "1px solid #ddd",
      borderRadius: 12,
      padding: 16,
      background: "#f8f8f8",
      marginBottom: 24,
    }}
  >

    {showCloseBox && (
  <div
    style={{
      border: "1px solid #ddd",
      borderRadius: 12,
      padding: 16,
      background: "#f8f8f8",
      marginBottom: 24,
    }}
  >
    <h3>Close Job</h3>

    <select
      value={closureReason}
      onChange={(e) => setClosureReason(e.target.value)}
      style={{ width: "100%", padding: 8, marginBottom: 10 }}
    >
      <option value="">Select reason</option>
      <option value="Work complete">Work complete</option>
      <option value="No works required">No works required</option>
      <option value="Duplicate issue">Duplicate issue</option>
      <option value="Tenant refused access">Tenant refused access</option>
      <option value="Other">Other</option>
    </select>

  <button onClick={closeJob}>
  Close Job
</button>

    <button
      onClick={() => setShowCloseBox(false)}
      style={{ marginLeft: 8 }}
    >
      Cancel
    </button>
  </div>
)}
    <h3>Instruct Contractor</h3>

    <select
      value={instructionContractorId}
      onChange={(e) => setInstructionContractorId(e.target.value)}
      style={{ width: "100%", padding: 8, marginBottom: 10 }}
    >
      <option value="">Select contractor</option>
      {contractors.map((contractor) => (
        <option key={contractor.id} value={contractor.id}>
          {contractor.name}
        </option>
      ))}
    </select>

    <input
      placeholder="Instruction amount e.g. 150"
      value={instructionAmount}
      onChange={(e) => setInstructionAmount(e.target.value)}
      style={{ width: "100%", padding: 8, marginBottom: 10 }}
    />

    <textarea
      placeholder="Please attend blocked sink..."
      value={instructionMessage}
      onChange={(e) => setInstructionMessage(e.target.value)}
      style={{
        width: "100%",
        minHeight: 90,
        padding: 8,
        marginBottom: 10,
      }}
    />

<button onClick={sendInstruction}>
      Send Instruction
    </button>

    <button
      onClick={() => setShowInstructionBox(false)}
      style={{ marginLeft: 8 }}
    >
      Cancel
    </button>
  </div>
)}

    <h3>Request Quotes</h3>

    <p>Select contractors:</p>

    {contractors.map((contractor) => (
      <label key={contractor.id} style={{ display: "block", marginBottom: 8 }}>
        <input
          type="checkbox"
          checked={selectedQuoteContractorIds.includes(contractor.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedQuoteContractorIds((prev) => [...prev, contractor.id]);
            } else {
              setSelectedQuoteContractorIds((prev) =>
                prev.filter((id) => id !== contractor.id)
              );
            }
          }}
        />{" "}
        {contractor.name}
      </label>
    ))}

    <textarea
      placeholder="Please quote for roof repair..."
      value={quoteMessage}
      onChange={(e) => setQuoteMessage(e.target.value)}
      style={{
        width: "100%",
        minHeight: 90,
        padding: 8,
        marginTop: 10,
        marginBottom: 10,
      }}
    />

  <button onClick={sendQuoteRequests}>
  Send Quote Requests
</button>

    <button
      onClick={() => setShowQuoteBox(false)}
      style={{ marginLeft: 8 }}
    >
      Cancel
    </button>
  </div>
)}

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

{activeTab === "detail" && (
  <div>
    <h2>Detail</h2>

    <p>
      <strong>Description:</strong>
    </p>

    <p>{issue.description}</p>

    <p style={{ color: "#666" }}>
      Photos remain in the Photos tab for now.
    </p>
  </div>
)}

{activeTab === "quotes" && (
  <div>
    <h2>Quotes</h2>

 <QuoteSection
  title="Awaiting Quotes"
  quotes={quoteRequests.filter((q) => q.status === "requested")}
  onAcceptQuote={acceptQuote}
    />

<QuoteSection
  title="Quotes Received"
  quotes={quoteRequests.filter((q) => q.status === "submitted")}
  onAcceptQuote={acceptQuote}
    />

    <QuoteSection
      title="Accepted"
      quotes={quoteRequests.filter((q) => q.status === "accepted")}
      onAcceptQuote={acceptQuote}
    />

    <QuoteSection
      title="Unsuccessful"
      quotes={quoteRequests.filter((q) => q.status === "unsuccessful")}
      onAcceptQuote={acceptQuote}

    />
  </div>
)}
   {activeTab === "invoices" && (
  <>
    <h2>Invoices</h2>
    <p>No invoices submitted yet.</p>
  </>
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

function QuoteSection({
  title,
  quotes,
  onAcceptQuote,
}: {
  title: string;
  quotes: QuoteRequest[];
  onAcceptQuote: (quote: QuoteRequest) => void;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3>{title}</h3>

      {quotes.length === 0 && <p>None.</p>}

      {quotes.map((quote) => (
        <div
          key={quote.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            background: "white",
          }}
        >
          <strong>{quote.contractor_name}</strong>

          <p>Status: {formatLabel(quote.status)}</p>

          {quote.quote_amount && <p>Amount: £{quote.quote_amount}</p>}

          {quote.notes && <p>{quote.notes}</p>}

          {quote.quote_url && (
            <a href={quote.quote_url} target="_blank">
              View Quote
            </a>
          )}

          {quote.status === "submitted" && (
  <div style={{ marginTop: 10 }}>
<button onClick={() => onAcceptQuote(quote)}>
  Accept Quote
</button>
  </div>
)}
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