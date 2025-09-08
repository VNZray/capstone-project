import PageContainer from "@/src/components/PageContainer";
import Text from "@/src/components/Text";
import React from "react";

const Request = () => {
  return (
    <PageContainer>
      <Text variant="title" style={{ marginBottom: 24 }}>
        Your Business Registration Request
      </Text>

      <div style={{
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        padding: 24,
        maxWidth: 600,
        margin: "0 auto"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
        <tr style={{ background: "#f5f5f5" }}>
          <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600 }}>ID</th>
          <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600 }}>Name</th>
          <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600 }}>Status</th>
        </tr>
          </thead>
          <tbody>
        <tr>
          <td style={{ padding: "12px 8px", borderTop: "1px solid #eee" }}>1</td>
          <td style={{ padding: "12px 8px", borderTop: "1px solid #eee" }}>Business Registration</td>
          <td style={{ padding: "12px 8px", borderTop: "1px solid #eee" }}>
            <span style={{
          background: "#ffe58f",
          color: "#ad8b00",
          padding: "4px 12px",
          borderRadius: 12,
          fontWeight: 500,
          fontSize: 14
            }}>
          Pending
            </span>
          </td>
        </tr>
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
};

export default Request;
