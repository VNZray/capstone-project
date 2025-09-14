import React from "react";
import "./Card.css";
import Text from "@/src/components/Text";
import Container from "@/src/components/Container";

import { Star } from "@mui/icons-material";
import { Grid, Chip } from "@mui/joy";

interface CardProps {
  image?: string;
  title?: string;
  rating?: number;
  status?: string;
  subtitle?: string;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "success";
    case "Active":
      return "success";
    case "Pending":
      return "neutral";
    case "Rejected":
      return "danger";
    default:
      return "neutral"; // fallback
  }
};

const Card: React.FC<CardProps> = ({
  image,
  title,
  subtitle,
  elevation,
  children,
  status,
  rating,
}) => {
  return (
    <Container 
      style={{ 
        maxWidth: "100%",
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(0,0,0,0.06)',
      }} 
      elevation={elevation}
      className="business-card"
    >
      <div style={{ display: "flex", flexDirection: "row", gap: 20, padding: 16 }}>
        <div 
          className="image-container card-image-wrapper" 
          style={{ 
            width: 200, 
            height: 150, 
            flexShrink: 0,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease',
          }}
        >
          <img
            src={image}
            alt={title}
            width={"100%"}
            height={"100%"}
            className="card-image"
          />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 150 }}>
          <Container elevation={0} padding="0">
            <Grid container spacing={2} columns={12}>
              <Grid xs={8}>
                <Text 
                  variant="card-title" 
                  style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: 700, 
                    color: '#1f2937',
                    marginBottom: 8,
                    lineHeight: 1.3
                  }}
                >
                  {title}
                </Text>
                <Text 
                  variant="card-sub-title" 
                  style={{ 
                    fontSize: '0.95rem', 
                    color: '#6b7280',
                    marginBottom: 12,
                    fontWeight: 500
                  }}
                >
                  {subtitle}
                </Text>
                {/* Status Chip */}
                {status && (
                  <Chip
                    size="sm"
                    color={getStatusColor(status)}
                    variant="soft"
                    sx={{ 
                      mt: 1,
                      fontWeight: 600,
                      borderRadius: 20,
                      px: 2,
                      py: 0.5,
                      fontSize: '0.75rem'
                    }}
                  >
                    {status}
                  </Chip>
                )}
              </Grid>
              <Grid xs={4}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-end',
                  gap: 4
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 4,
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    padding: '6px 10px',
                    borderRadius: 20,
                    border: '1px solid rgba(251, 191, 36, 0.2)'
                  }}>
                    <Star style={{ color: '#f59e0b', fontSize: '1rem' }} />
                    <span style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: 600, 
                      color: '#92400e' 
                    }}>
                      {rating}.0
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: '#9ca3af',
                    fontWeight: 500
                  }}>
                    (100 reviews)
                  </span>
                </div>
              </Grid>
            </Grid>
          </Container>

          <Container elevation={0} padding="0" style={{ marginTop: 16 }}>
            <div style={{ width: "100%" }}>{children}</div>
          </Container>
        </div>
      </div>
    </Container>
  );
};

export default Card;
