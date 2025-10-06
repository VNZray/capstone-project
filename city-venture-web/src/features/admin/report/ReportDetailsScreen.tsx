import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReportDetails from "@/src/components/Admin/report/ReportDetails";

const ReportDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) return null;

  return (
    <ReportDetails
      reportId={id}
      onBack={() => navigate(-1)}
      onStatusUpdated={() => {
      }}
    />
  );
};

export default ReportDetailsScreen;
