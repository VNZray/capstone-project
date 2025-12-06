import { motion } from "framer-motion";
import { TrendingUp, Users, Eye, BarChart3 } from "lucide-react";

// Dashboard Overview Screen
export const DashboardOverviewScreen = () => {
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          marginBottom: "24px",
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
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#0A1B47",
            }}
          >
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
      </motion.div>

      {/* Metrics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        {[
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
        ].map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #E8EBF0",
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
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          marginBottom: "16px",
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
          <select
            style={{
              border: "1px solid #E8EBF0",
              borderRadius: "8px",
              padding: "4px 8px",
              fontSize: "11px",
              color: "#6B7280",
              background: "white",
            }}
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>

        {/* Mini Bar Chart */}
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
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: 0.8 + i * 0.05, type: "spring" }}
              style={{
                flex: 1,
                background:
                  i === 9
                    ? "linear-gradient(180deg, #FF914D, #FF6B6B)"
                    : "linear-gradient(180deg, #0077B6, #0A1B47)",
                borderRadius: "4px 4px 0 0",
                minWidth: "8px",
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
            fontSize: "10px",
            color: "#999",
          }}
        >
          <span>Mon</span>
          <span>Fri</span>
          <span>Sun</span>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#0A1B47",
            marginBottom: "12px",
          }}
        >
          Recent Bookings
        </h3>

        {[
          { name: "Maria Santos", time: "2 min ago", amount: "$125" },
          { name: "John Reyes", time: "15 min ago", amount: "$89" },
          { name: "Lisa Chen", time: "1 hour ago", amount: "$210" },
        ].map((booking, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 + i * 0.1 }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: i < 2 ? "1px solid #F0F4F8" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${
                    ["#FF6B6B", "#FF914D", "#28C76F"][i]
                  }, ${["#FF914D", "#28C76F", "#0077B6"][i]})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {booking.name.charAt(0)}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#0A1B47",
                  }}
                >
                  {booking.name}
                </div>
                <div style={{ fontSize: "11px", color: "#999" }}>
                  {booking.time}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#28C76F",
              }}
            >
              {booking.amount}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Analytics Screen
export const AnalyticsScreen = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
        overflow: "auto",
        color: "white",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>
          Analytics
        </h1>
        <p style={{ opacity: 0.9, fontSize: "14px", marginBottom: "24px" }}>
          Performance insights at a glance
        </p>

        {/* Big Stats */}
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{ fontSize: "48px", fontWeight: 800, marginBottom: "8px" }}
          >
            $12,845
          </div>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>
            Total Revenue This Month
          </div>
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              gap: "12px",
            }}
          >
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.2)",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: 700 }}>2.4K</div>
              <div style={{ fontSize: "11px", opacity: 0.9 }}>Visitors</div>
            </div>
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.2)",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: 700 }}>89%</div>
              <div style={{ fontSize: "11px", opacity: 0.9 }}>Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        {[
          { label: "Profile Views", value: 85, color: "#FF6B6B" },
          { label: "Bookings", value: 65, color: "#FF914D" },
          { label: "Reviews", value: 92, color: "#28C76F" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: "12px",
              padding: "14px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                {stat.label}
              </span>
              <span style={{ fontSize: "13px", fontWeight: 700 }}>
                {stat.value}%
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "6px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.value}%` }}
                transition={{ delay: 0.6 + i * 0.1, duration: 1 }}
                style={{
                  height: "100%",
                  background: stat.color,
                  borderRadius: "3px",
                }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Settings Screen
export const SettingsScreen = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#FFFFFF",
        padding: "20px",
        overflow: "auto",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "#0A1B47",
          marginBottom: "24px",
        }}
      >
        Business Settings
      </h1>

      {/* Settings Groups */}
      {[
        {
          title: "Account",
          items: ["Profile", "Notifications", "Privacy"],
        },
        {
          title: "Business",
          items: ["Hours", "Services", "Pricing"],
        },
        {
          title: "Support",
          items: ["Help Center", "Contact Us", "Feedback"],
        },
      ].map((group, gi) => (
        <div key={gi} style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            {group.title}
          </h3>

          {group.items.map((item, ii) => (
            <motion.div
              key={ii}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: gi * 0.2 + ii * 0.1 }}
              whileHover={{ x: 4 }}
              style={{
                background: "#F8F9FA",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <span
                style={{ fontSize: "14px", fontWeight: 500, color: "#0A1B47" }}
              >
                {item}
              </span>
              <span style={{ color: "#999" }}>›</span>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};
