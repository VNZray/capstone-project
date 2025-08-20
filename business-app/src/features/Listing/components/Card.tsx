import React from "react";
import "./Card.css";
import Text from "@/src/components/Text";
import Container from "@/src/components/Container";
import Column from "@/src/components/Column";

import { Star } from "@mui/icons-material";
import { colors } from "@/src/utils/Colors";
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
    <Container style={{ maxWidth: "100%" }} elevation={elevation}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="image-container">
          <img
            src={image}
            alt={title}
            width={"100%"}
            height={"100%"}
            className="card-image"
          />
        </div>
        <Container elevation={0} padding="0">
          <Grid container spacing={2} columns={12}>
            <Grid xs={8}>
              <Text variant="card-title">{title}</Text>
              <Text variant="card-sub-title">{subtitle}</Text>
              {/* Status Chip */}
              {status && (
                <Chip
                  size="lg"
                  color={getStatusColor(status)}
                  variant="soft"
                  sx={{ mt: 1}}
                >
                  {status}
                </Chip>
              )}{" "}
            </Grid>
            <Grid xs={4}>
              <Text justify="right" variant="normal">
                <Star style={{ color: colors.yellow }} />
                {rating}.0 (100)
              </Text>
            </Grid>
          </Grid>
        </Container>

        <Container elevation={0} padding="0">
          <Column size={3}>
            <div style={{ width: "100%" }}>{children}</div>
          </Column>
        </Container>
      </div>
    </Container>
  );
};

export default Card;
