import React from "react";
import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import { Typography } from "@mui/joy";

export default function Discount(): React.ReactElement {
  return (
    <PageContainer>
      <Container elevation={2}>
        <Typography level="h3" fontWeight={700}>
          Discount
        </Typography>
        <Typography level="body-md">
          This is a placeholder page for managing discounts.
        </Typography>
      </Container>
    </PageContainer>
  );
}
