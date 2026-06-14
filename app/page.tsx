"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import InviteUser from "@/components/InviteUser";
import Sidebar from "@/components/Sidebar";
import IssueCard from "@/components/IssueCard";
import DashboardOverview from "@/components/DashboardOverview";
import Image from "next/image";

type Property = {
  id: string;
  address: string;
  organization_id: string;
};

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
  description: string;
  status: string;
  property_id: string | null;
  workflow_status: string;
  category: string;
  requires_attention: boolean;
  attention_date: string | null;
  contractor_name: string | null;
  contractor_id: string | null;
  quote_submitted: boolean;
  invoice_submitted: boolean;
};

type Comment = {
  id: string;
  issue_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type IssuePhoto = {
  id: string;
  issue_id: string;
  photo_url: string;
  created_at: string;
};

export default function HomePage() {
  const router = useRouter();

  const [currentView, setCurrentView] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");

  const [properties, setProperties] = useState<Property[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [photos, setPhotos] = useState<IssuePhoto[]>([]);

  const [address, setAddress] = useState("");

  const [contractorName, setContractorName] = useState("");
  const [contractorEmail, setContractorEmail] = useState("");
  const [contractorPhone, setContractorPhone] = useState("");
  const [contractorTrade, setContractorTrade] = useState("");

  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedContractorId, setSelectedContractorId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("maintenance");
  const [requiresAttention, setRequiresAttention] = useState(false);
  const [attentionDate, setAttentionDate] = useState("");

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        router.push("/login");
        return;
      }

      const user = session.user;
      setUserId(user.id);

      const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1);

    const org = membership?.[0]?.organization_id;

if (!org) {
  setLoading(false);
  return;
}

setOrgId(org);

const { data: orgData } = await supabase
  .from("organizations")
  .select("name")
  .eq("id", org)
  .single();

setCompanyName(orgData?.name || "");

await refreshAll(org);
setLoading(false);

      if (!org) {
        setLoading(false);
        return;
      }

      setOrgId(org);
      await refreshAll(org);
      setLoading(false);
    }

    init();
  }, [router]);

  async function refreshAll(currentOrgId: string) {
    const { data: propertiesData } = await supabase
      .from("properties")
      .select("*")
      .eq("organization_id", currentOrgId)
      .order("created_at", { ascending: false });

    const { data: contractorsData } = await supabase
      .from("contractors")
      .select("*")
      .eq("organization_id", currentOrgId)
      .order("created_at", { ascending: false });

    const { data: issuesData } = await supabase
      .from("issues")
      .select("*")
      .eq("organization_id", currentOrgId)
      .order("created_at", { ascending: false });

    const issueList = issuesData || [];
    const issueIds = issueList.map((issue) => issue.id);

    let commentsData: Comment[] = [];
    let photosData: IssuePhoto[] = [];

    if (issueIds.length > 0) {
      const { data: loadedComments } = await supabase
        .from("comments")
        .select("*")
        .in("issue_id", issueIds)
        .order("created_at", { ascending: true });

      const { data: loadedPhotos } = await supabase
        .from("issue_photos")
        .select("*")
        .in("issue_id", issueIds)
        .order("created_at", { ascending: true });

      commentsData = loadedComments || [];
      photosData = loadedPhotos || [];
    }

    setProperties(propertiesData || []);
    setContractors(contractorsData || []);
    setIssues(issueList);
    setComments(commentsData);
    setPhotos(photosData);
  }

  async function createProperty() {
    if (!orgId || !address.trim()) return;

    const { error } = await supabase.from("properties").insert([
      {
        address: address.trim(),
        organization_id: orgId,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setAddress("");
    await refreshAll(orgId);
  }

  async function createContractor() {
    if (!orgId || !contractorName.trim()) {
      alert("Contractor name required");
      return;
    }

    const { error } = await supabase.from("contractors").insert([
      {
        organization_id: orgId,
        name: contractorName.trim(),
        email: contractorEmail.trim() || null,
        phone: contractorPhone.trim() || null,
        trade: contractorTrade.trim() || null,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setContractorName("");
    setContractorEmail("");
    setContractorPhone("");
    setContractorTrade("");

    await refreshAll(orgId);
  }

  async function createIssue() {
    if (!orgId || !userId || !selectedPropertyId || !title.trim()) {
      alert("Property and title required");
      return;
    }

    const selectedContractor = contractors.find(
      (c) => c.id === selectedContractorId
    );

    const { error } = await supabase.from("issues").insert([
      {
        title: title.trim(),
        description: description.trim(),
        status: "open",
        user_id: userId,
        organization_id: orgId,
        property_id: selectedPropertyId,
        workflow_status: "reported",
        category,
        requires_attention: requiresAttention,
        attention_date: attentionDate || null,
        contractor_id: selectedContractorId || null,
        contractor_name: selectedContractor?.name || null,
        quote_submitted: false,
        invoice_submitted: false,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setTitle("");
    setDescription("");
    setCategory("maintenance");
    setRequiresAttention(false);
    setAttentionDate("");
    setSelectedContractorId("");

    await refreshAll(orgId);
  }

  async function assignContractor(issueId: string, contractorId: string) {
    const selectedContractor = contractors.find((c) => c.id === contractorId);

    const { error } = await supabase
      .from("issues")
      .update({
        contractor_id: contractorId || null,
        contractor_name: selectedContractor?.name || null,
      })
      .eq("id", issueId);

    if (error) {
      alert(error.message);
      return;
    }

    if (orgId) await refreshAll(orgId);
  }

  async function updateIssueWorkflow(issueId: string, newWorkflow: string) {
    const { error } = await supabase
      .from("issues")
      .update({
        workflow_status: newWorkflow,
        status: newWorkflow === "closed" ? "closed" : "open",
        quote_submitted: newWorkflow === "quote_submitted",
        invoice_submitted: newWorkflow === "invoice_submitted",
      })
      .eq("id", issueId);

    if (error) {
      alert(error.message);
      return;
    }

    if (orgId) await refreshAll(orgId);
  }

  async function toggleAttention(issueId: string, current: boolean) {
    const { error } = await supabase
      .from("issues")
      .update({ requires_attention: !current })
      .eq("id", issueId);

    if (error) {
      alert(error.message);
      return;
    }

    if (orgId) await refreshAll(orgId);
  }

  async function deleteIssue(id: string) {
    const { error } = await supabase.from("issues").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    if (orgId) await refreshAll(orgId);
  }

  async function addComment(issueId: string) {
    if (!userId) return;

    const content = commentInputs[issueId]?.trim();

    if (!content) {
      alert("Comment required");
      return;
    }

    const { error } = await supabase.from("comments").insert([
      {
        issue_id: issueId,
        user_id: userId,
        content,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setCommentInputs((prev) => ({
      ...prev,
      [issueId]: "",
    }));

    if (orgId) await refreshAll(orgId);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const reportedCount = issues.filter((i) => i.workflow_status === "reported").length;
  const attentionCount = issues.filter((i) => i.requires_attention).length;
  const openCount = issues.filter((i) => i.status === "open").length;
  const gasSafetyCount = issues.filter((i) => i.category === "gas_safety").length;
  const eicrCount = issues.filter((i) => i.category === "eicr").length;
  const epcCount = issues.filter((i) => i.category === "epc").length;
  const quotesSubmittedCount = issues.filter((i) => i.workflow_status === "quote_submitted").length;
  const invoicesSubmittedCount = issues.filter((i) => i.invoice_submitted).length;

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <main style={{ flex: 1, padding: 24 }}>
       <h1>Dashboard</h1>
       
       <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginBottom: 30,
  }}
>
  <Image
    src="/public/logo.png"
    alt="Logo"
    width={60}
    height={60}
  />

  <div style={{ flex: 1 }}>
    <h2 style={{ margin: 0 }}>
      {companyName || "RepairNest"}
    </h2>

    {orgId && <InviteUser orgId={orgId} />}
  </div>

  <button onClick={logout}>
    Logout
  </button>
</div>

       {currentView === "dashboard" && (
 <>
 {currentView === "dashboard" && (
  <DashboardOverview
    issues={issues}
    properties={properties}
  />
)}

  </>
)}

        {currentView === "properties" && (
          <>
            <h2>Properties</h2>

            <input
              placeholder="Property address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />

            <button onClick={createProperty}>Add Property</button>

            <div style={{ marginTop: 20 }}>
              {properties.map((property) => (
  <a
    key={property.id}
    href={`/properties/${property.id}`}
                  style={{display: "block",
color: "inherit",
textDecoration: "none",
                    border: "1px solid #ddd",
                    padding: 12,
                    marginBottom: 10,
                  }}
                >
                  {property.address}
               </a>
              ))}
            </div>
          </>
        )}

        {currentView === "contractors" && (
          <>
            <h2>Contractors</h2>

            <input
              placeholder="Name"
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />

            <input
              placeholder="Email"
              value={contractorEmail}
              onChange={(e) => setContractorEmail(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />

            <input
              placeholder="Phone"
              value={contractorPhone}
              onChange={(e) => setContractorPhone(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />

            <input
              placeholder="Trade"
              value={contractorTrade}
              onChange={(e) => setContractorTrade(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />

            <button onClick={createContractor}>Add Contractor</button>

            <div style={{ marginTop: 20 }}>
            {contractors.map((contractor) => (
  <a
    key={contractor.id}
    href={`/contractors/${contractor.id}`}
    style={{
      display: "block",
      border: "1px solid #ddd",
      padding: 12,
      marginBottom: 10,
      color: "inherit",
      textDecoration: "none",
    }}
  >
    <strong>{contractor.name}</strong>
    <p>
      {contractor.trade || "No trade"} |{" "}
      {contractor.phone || "No phone"} |{" "}
      {contractor.email || "No email"}
    </p>
  </a>
))}
                </div>
                          </>
        )}
        
        {currentView === "create issue" && (
          <>
            <h2>Create Issue</h2>

            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            >
              <option value="">Select property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}
                </option>
              ))}
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            >
              <option value="maintenance">Maintenance</option>
              <option value="gas_safety">Compliance - Gas Safety</option>
              <option value="eicr">Compliance - EICR</option>
              <option value="epc">Compliance - EPC</option>
            </select>

            <select
              value={selectedContractorId}
              onChange={(e) => setSelectedContractorId(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            >
              <option value="">Assign contractor optional</option>
              {contractors.map((contractor) => (
                <option key={contractor.id} value={contractor.id}>
                  {contractor.name}
                </option>
              ))}
            </select>

            <label style={{ display: "block", marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={requiresAttention}
                onChange={(e) => setRequiresAttention(e.target.checked)}
              />{" "}
              Requires attention
            </label>

            {requiresAttention && (
              <input
                type="date"
                value={attentionDate}
                onChange={(e) => setAttentionDate(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
            )}

            <input
              placeholder="Issue title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />

            <input
              placeholder="Issue description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />

            <button onClick={createIssue}>Create Issue</button>
          </>
        )}

        {currentView === "settings" && (
          <>
            <h2>Settings</h2>
            <p>Organisation settings coming later.</p>
          </>
        )}
      </main>
    </div>
  );
}

function IssueList({
  properties,
  issues,
  comments,
  photos,
  contractors,
  commentInputs,
  setCommentInputs,
  assignContractor,
  updateIssueWorkflow,
  toggleAttention,
  deleteIssue,
  addComment,
  refreshAll,
}: any) {
  return (
    <>
      {properties.map((property: Property) => {
        const propertyIssues = issues.filter(
          (issue: Issue) => issue.property_id === property.id
        );

        return (
          <div
            key={property.id}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              marginBottom: 16,
            }}
          >
            <h3>{property.address}</h3>

            {propertyIssues.length === 0 && <p>No issues for this property.</p>}

            {propertyIssues.map((issue: Issue) => {
              const issueComments = comments.filter(
                (comment: Comment) => comment.issue_id === issue.id
              );

              const issuePhotos = photos.filter(
                (photo: IssuePhoto) => photo.issue_id === issue.id
              );

              return (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  contractors={contractors}
                  comments={issueComments}
                  photos={issuePhotos}
                  commentValue={commentInputs[issue.id] || ""}
                  setCommentValue={(value) =>
                    setCommentInputs((prev: Record<string, string>) => ({
                      ...prev,
                      [issue.id]: value,
                    }))
                  }
                  assignContractor={assignContractor}
                  updateIssueWorkflow={updateIssueWorkflow}
                  toggleAttention={toggleAttention}
                  deleteIssue={deleteIssue}
                  addComment={addComment}
                  refreshPhotos={refreshAll}
                  refreshAll={refreshAll}
                />
              );
            })}
          </div>
        );
      })}
    </>
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