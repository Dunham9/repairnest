"use client";

export default function Sidebar({
  currentView,
  setCurrentView,
}: {
  currentView: string;
  setCurrentView: (view: string) => void;
}) {
const items = [
  "dashboard",
  "properties",
  "contractors",
  "create issue",
  "settings",
];

  return (
    <div
      style={{
        width: 220,
        borderRight: "1px solid #ddd",
        padding: 20,
        minHeight: "100vh",
      }}
    >
      <h2>RepairNest</h2>

      {items.map((item) => (
        <div
          key={item}
          onClick={() => setCurrentView(item)}
          style={{
            padding: 12,
            cursor: "pointer",
            borderRadius: 8,
            marginBottom: 8,
            background:
              currentView === item ? "#f2f2f2" : "transparent",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}