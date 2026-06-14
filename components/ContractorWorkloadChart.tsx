"use client";

import { useState } from "react";

type Issue = {
  id: string;
  status: string;
  contractor_name: string | null;
};

export default function ContractorWorkloadChart({
  issues,
}: {
  issues: Issue[];
}) {
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  const openIssues = issues.filter((issue) => issue.status === "open");

  const workload = openIssues.reduce<Record<string, number>>((acc, issue) => {
    const name = issue.contractor_name || "Unassigned";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(workload)
    .map(([name, count]) => ({
      name,
      count,
      initials: getInitials(name),
    }))
    .sort((a, b) => b.count - a.count);

  const max = Math.max(...data.map((item) => item.count), 1);

  const hoveredItem = data.find((item) => item.name === hoveredName);

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
      <h2>Contractor Workload</h2>

     <div
  style={{
    marginBottom: 12,
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "#f8f8f8",
    minHeight: 45,
  }}
>
  {hoveredItem ? (
    <>
      <strong>{hoveredItem.name}</strong>
      <div>{hoveredItem.count} open job(s)</div>
    </>
  ) : (
    <span style={{ color: "#666" }}>Hover over a bar to see contractor details</span>
  )}
</div>

      {data.length === 0 ? (
        <p>No open jobs assigned.</p>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "end",
            gap: 18,
            height: 220,
            paddingTop: 20,
          }}
        >
          {data.map((item) => {
            const isHovered = hoveredName === item.name;

            return (
              <div
                key={item.name}
                onMouseEnter={() => setHoveredName(item.name)}
                onMouseLeave={() => setHoveredName(null)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "end",
                  height: "100%",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 13, marginBottom: 6 }}>
                  {item.count}
                </div>

                <div
                  style={{
                    width: 34,
                    height: `${(item.count / max) * 150}px`,
                    minHeight: 8,
                    borderRadius: "8px 8px 0 0",
                    background: isHovered ? "#1d4ed8" : "#2563eb",
                    transform: isHovered ? "scaleX(1.15)" : "scaleX(1)",
                    transition: "all 0.15s ease",
                  }}
                />

                <div style={{ marginTop: 8, fontWeight: "bold" }}>
                  {item.initials}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getInitials(name: string) {
  if (name === "Unassigned") return "UA";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}