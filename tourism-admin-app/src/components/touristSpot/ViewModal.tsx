/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from "react";
import Text from "../Text";
import "../styles/ViewModal.css";

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Record<string, any> | null;
}

const ViewModal: React.FC<ViewModalProps> = ({ isOpen, onClose, item }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    setTimeout(() => modalRef.current?.focus(), 0);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;
  const existingSpot = item.existingSpot as Record<string, any> | undefined;

  const getCurrent = (field: string) => {
    if (existingSpot && existingSpot[field] != null) return existingSpot[field];
    const origKey = `original_${field}`;
    return item[origKey] != null ? item[origKey] : null;
  };

  const normalize = (field: string, v: any) => {
    if (v == null) return "";
    if (field === "entry_fee") {
      const n = Number(v);
      return isNaN(n) ? "" : String(n);
    }
    if (field.toLowerCase().includes("phone")) return String(v).replace(/\D/g, "");
    return String(v).trim().toLowerCase();
  };

  const hasChanged = (field: string) => {
    const cur = getCurrent(field);
    const next = item[field];
    if (cur == null && next == null) return false;
    if (cur == null) return true;
    return normalize(field, cur) !== normalize(field, next);
  };

  const hasLocationChanged = () => {
    const curProv = String(getCurrent("province") ?? "").trim();
    const curMun = String(getCurrent("municipality") ?? "").trim();
    const curBar = String(getCurrent("barangay") ?? "").trim();
    const nextProv = String(item["province"] ?? "").trim();
    const nextMun = String(item["municipality"] ?? "").trim();
    const nextBar = String(item["barangay"] ?? "").trim();
    return curProv !== nextProv || curMun !== nextMun || curBar !== nextBar;
  };

  const isEdit = item.action_type === "edit";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? `Edit Request: ${String(item.name ?? "")}` : String(item.name ?? "")}
        ref={modalRef}
        tabIndex={-1}
      >
        <div className="modal-header">
          <Text variant="sub-title" color="text-color" className="title">
            {isEdit ? `Edit Request: ${String(item.name ?? "")}` : String(item.name ?? "")}
          </Text>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {isEdit ? (
            <div className="comparison-grid">
              <div className="comparison-column">
                <Text variant="card-title" color="text-color" className="comparison-title">Current Version</Text>

                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Name: </Text>
                  <Text variant="normal" color="text-color">{String(getCurrent("name") ?? "-")}</Text>
                </div>

                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Description: </Text>
                  <Text variant="normal" color="text-color">{String(getCurrent("description") ?? "-")}</Text>
                </div>

                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Type: </Text>
                  <Text variant="normal" color="text-color">{String(getCurrent("type") ?? "-")}</Text>
                </div>

                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Location: </Text>
                  <Text variant="normal" color="text-color">{`${String(getCurrent("province") ?? "-")}, ${String(getCurrent("municipality") ?? "-")}, ${String(getCurrent("barangay") ?? "-")}`}</Text>
                </div>

                {getCurrent("contact_phone") != null && (
                  <div className="detail-section">
                    <Text variant="card-title" color="text-color">Contact Phone: </Text>
                    <Text variant="normal" color="text-color">{String(getCurrent("contact_phone"))}</Text>
                  </div>
                )}

                {getCurrent("website") != null && (
                  <div className="detail-section">
                    <Text variant="card-title" color="text-color">Website: </Text>
                    <Text variant="normal" color="text-color">{String(getCurrent("website"))}</Text>
                  </div>
                )}

                {getCurrent("entry_fee") != null && (
                  <div className="detail-section">
                    <Text variant="card-title" color="text-color">Entry Fee: </Text>
                    <Text variant="normal" color="text-color">₱{String(getCurrent("entry_fee"))}</Text>
                  </div>
                )}
              </div>

              <div className="comparison-column">
                <Text variant="card-title" color="text-color" className="comparison-title">Proposed Changes</Text>

                <div className={`detail-section${hasChanged("name") ? " changed" : ""}`}>
                  <Text variant="card-title" color="text-color">Name: </Text>
                  <Text variant="normal" color="text-color">{String(item.name ?? "-")}</Text>
                </div>

                <div className={`detail-section${hasChanged("description") ? " changed" : ""}`}>
                  <Text variant="card-title" color="text-color">Description: </Text>
                  <Text variant="normal" color="text-color">{String(item.description ?? "-")}</Text>
                </div>

                <div className={`detail-section${hasChanged("type") ? " changed" : ""}`}>
                  <Text variant="card-title" color="text-color">Type: </Text>
                  <Text variant="normal" color="text-color">{String(item.type ?? "-")}</Text>
                </div>

                <div className={`detail-section${hasLocationChanged() ? " changed" : ""}`}>
                  <Text variant="card-title" color="text-color">Location: </Text>
                  <Text variant="normal" color="text-color">{`${String(item.province ?? "-")}, ${String(item.municipality ?? "-")}, ${String(item.barangay ?? "-")}`}</Text>
                </div>

                {item.contact_phone != null && (
                  <div className={`detail-section${hasChanged("contact_phone") ? " changed" : ""}`}>
                    <Text variant="card-title" color="text-color">Contact Phone: </Text>
                    <Text variant="normal" color="text-color">{String(item.contact_phone)}</Text>
                  </div>
                )}

                {item.website != null && (
                  <div className={`detail-section${hasChanged("website") ? " changed" : ""}`}>
                    <Text variant="card-title" color="text-color">Website: </Text>
                    <Text variant="normal" color="text-color">{String(item.website)}</Text>
                  </div>
                )}

                {item.entry_fee != null && (
                  <div className={`detail-section${hasChanged("entry_fee") ? " changed" : ""}`}>
                    <Text variant="card-title" color="text-color">Entry Fee: </Text>
                    <Text variant="normal" color="text-color">₱{String(item.entry_fee)}</Text>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="details-view">
              <div className="detail-section">
                <Text variant="card-title" color="text-color">Description</Text>
                <Text variant="normal" color="text-color">{String(item.description ?? "")}</Text>
              </div>
              <div className="detail-section">
                <Text variant="card-title" color="text-color">Type</Text>
                <Text variant="normal" color="text-color">{String(item.type ?? "")}</Text>
              </div>
              <div className="detail-section">
                <Text variant="card-title" color="text-color">Location</Text>
                <Text variant="normal" color="text-color">{`${String(item.province ?? "")}, ${String(item.municipality ?? "")}, ${String(item.barangay ?? "")}`}</Text>
              </div>
              {item.contact_phone != null && (
                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Contact Phone</Text>
                  <Text variant="normal" color="text-color">{String(item.contact_phone)}</Text>
                </div>
              )}
              {item.website != null && (
                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Website</Text>
                  <Text variant="normal" color="text-color">{String(item.website)}</Text>
                </div>
              )}
              {item.entry_fee != null && (
                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Entry Fee</Text>
                  <Text variant="normal" color="text-color">₱{String(item.entry_fee)}</Text>
                </div>
              )}
              <div className="detail-section">
                <Text variant="card-title" color="text-color">Submitted</Text>
                <Text variant="normal" color="text-color">
                  {new Date(String(item.created_at ?? item.submitted_at ?? "")).toLocaleDateString()}
                </Text>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
