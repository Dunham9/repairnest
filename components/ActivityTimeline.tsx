"use client";

type Activity = {
  id: string;
  event_type: string;
  details: string | null;
  created_at: string;
};

export default function ActivityTimeline({
  activity,
}: {
  activity: Activity[];
}) {
  return (
    <div style={{ marginTop: 30 }}>
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
    </div>
  );
}