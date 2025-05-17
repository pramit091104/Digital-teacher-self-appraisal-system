
import React from "react";
import { Badge } from "@/components/ui/badge";

type StatusType = "draft" | "pending" | "approved" | "revisable" | "rejected";

interface DocumentStatusProps {
  status: StatusType;
  className?: string;
}

export const DocumentStatus = ({ status, className = "" }: DocumentStatusProps) => {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case "draft":
        return {
          label: "Draft",
          variant: "outline" as const
        };
      case "pending":
        return {
          label: "Pending Review",
          variant: "warning" as const
        };
      case "approved":
        return {
          label: "Approved",
          variant: "success" as const
        };
      case "revisable":
        return {
          label: "Needs Revision",
          variant: "destructive" as const
        };
      case "rejected":
        return {
          label: "Rejected",
          variant: "destructive" as const
        };
      default:
        return {
          label: "Unknown",
          variant: "outline" as const
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};
