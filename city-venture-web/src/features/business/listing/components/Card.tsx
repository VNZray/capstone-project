import React from "react";
import "./Card.css";
import Typography from "@/src/components/Typography";
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
  compact?: boolean;
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
  compact = false,
}) => {
  return (
    <Container 
      style={{ 
        maxWidth: "100%",
        borderRadius: compact ? 10 : 16,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }} 
      elevation={elevation}
    >
      <div style={{ display: "flex", flexDirection: "row", gap: compact ? 12 : 20, padding: compact ? 12 : 16 }}>
        <div 
          className="image-container card-image-wrapper" 
          style={{ 
            width: compact ? 140 : 200, 
            height: compact ? 120 : 150, 
            flexShrink: 0,
            borderRadius: compact ? 8 : 12,
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
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: compact ? 100 : 150 }}>
          <Container elevation={0} padding="0">
            <Grid container spacing={2} columns={12}>
              <Grid xs={8}>
                <Typography.CardTitle 
                  size="lg"
                  sx={{
                    color: "#1f2937",
                    mb: compact ? 0.5 : 1
                  }}
                >
                  {title}
                </Typography.CardTitle>
                <Typography.Body 
                  size="xs"
                  weight="semibold"
                  sx={{
                    color: "#6b7280",
                    mb: compact ? 0 : 1.5
                  }}
                >
                  {subtitle}
                </Typography.Body>
                {/* Status Chip */}
                {status && (
                  <Chip
                    size={compact ? 'sm' : 'md'}
                    color={getStatusColor(status)}
                    variant="soft"
                    sx={{ 
                      mt: compact ? 0.5 : 1,
                      fontWeight: 600,
                      borderRadius: 20,
                      px: compact ? 1.25 : 2,
                      py: compact ? 0.25 : 0.5,
                      fontSize: compact ? '0.7rem' : '0.75rem'
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
                  gap: compact ? 2 : 4
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: compact ? 3 : 4,
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    padding: compact ? '4px 8px' : '6px 10px',
                    borderRadius: 20,
                    border: '1px solid rgba(251, 191, 36, 0.2)'
                  }}>
                    <Star style={{ color: '#f59e0b', fontSize: compact ? '0.9rem' : '1rem' }} />
                    <span style={{ 
                      fontSize: compact ? '0.8rem' : '0.9rem', 
                      fontWeight: 600, 
                      color: '#92400e' 
                    }}>
                      {rating}.0
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: compact ? '0.7rem' : '0.75rem', 
                    color: '#9ca3af',
                    fontWeight: 500
                  }}>
                    (100 reviews)
                  </span>
                </div>
              </Grid>
            </Grid>
          </Container>

          <Container elevation={0} padding="0" style={{ marginTop: compact ? 10 : 16 }}>
            <div style={{ width: "100%" }}>{children}</div>
          </Container>
        </div>
      </div>
    </Container>
  );
};

export default Card;
