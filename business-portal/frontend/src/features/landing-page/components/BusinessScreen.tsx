import { TrendingUp, Users, Eye, BarChart3 } from "lucide-react";

// Simple Dashboard Screen
export const DashboardScreen = () => {
  const metrics = [
    {
      icon: <TrendingUp size={18} />,
      label: "Revenue",
      value: "$8,421",
      change: "+12.5%",
      color: "#FF6B6B",
    },
    {
      icon: <Users size={18} />,
      label: "Visitors",
      value: "2,845",
      change: "+8.2%",
      color: "#FF914D",
    },
    {
      icon: <Eye size={18} />,
      label: "Views",
      value: "12.4K",
      change: "+15.3%",
      color: "#28C76F",
    },
    {
      icon: <BarChart3 size={18} />,
      label: "Bookings",
      value: "156",
      change: "+23.1%",
      color: "#0077B6",
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#F8F9FA",
        padding: "20px",
        overflow: "auto",
      }}
    >
      <div
        style={{
          marginBottom: "24px",
          opacity: 0,
          animation: "fadeIn 0.6s ease-out 0.2s forwards",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0A1B47" }}>
            Business Dashboard
          </h1>
          <span
            style={{
              background: "#28C76F",
              color: "white",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            LIVE
          </span>
        </div>
        <p style={{ color: "#6B7280", fontSize: "13px" }}>
          Welcome back! Here's your overview
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        {metrics.map((metric, i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #E8EBF0",
              opacity: 0,
              animation: `fadeIn 0.6s ease-out ${0.3 + i * 0.1}s forwards`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: `${metric.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: metric.color,
                }}
              >
                {metric.icon}
              </div>
              <span
                style={{
                  background: "#28C76F15",
                  color: "#28C76F",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  fontSize: "10px",
                  fontWeight: 700,
                  height: "fit-content",
                }}
              >
                {metric.change}
              </span>
            </div>
            <div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#0A1B47",
                  marginBottom: "4px",
                }}
              >
                {metric.value}
              </div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>
                {metric.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          marginBottom: "16px",
          opacity: 0,
          animation: "fadeIn 0.6s ease-out 0.7s forwards",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#0A1B47" }}>
            Revenue Trend
          </h3>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "6px",
            height: "100px",
            padding: "10px 0",
          }}
        >
          {[45, 68, 52, 85, 65, 92, 78, 88, 95, 87, 93, 89].map((height, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${height}%`,
                background:
                  i === 9
                    ? "linear-gradient(180deg, #FF914D, #FF6B6B)"
                    : "linear-gradient(180deg, #0077B6, #0A1B47)",
                borderRadius: "4px 4px 0 0",
                minWidth: "8px",
                opacity: 0,
                animation: `fadeIn 0.3s ease-out ${0.8 + i * 0.05}s forwards`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
