import React from "react";
import { Grid, Sheet, Skeleton } from "@mui/joy";

type Props = { variant?: 'table' | 'cards' };
const StaffSkeleton: React.FC<Props> = ({ variant = 'table' }) => {
  if (variant === 'cards') {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid key={i} xs={12} sm={6} md={4} lg={3}>
            <Sheet variant="outlined" sx={{ p: 2, borderRadius: 8 }}>
              <Skeleton variant="text" level="title-md" width="60%" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="rectangular" height={24} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="30%" />
              <Skeleton variant="rectangular" height={32} sx={{ mt: 1 }} />
            </Sheet>
          </Grid>
        ))}
      </Grid>
    );
  }
  // table skeleton rows
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <Sheet key={i} variant="outlined" sx={{ p: 2, borderRadius: 8, mb: 1 }}>
          <Skeleton variant="text" width="100%" />
        </Sheet>
      ))}
    </>
  );
};

export default StaffSkeleton;
