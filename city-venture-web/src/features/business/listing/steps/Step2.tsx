import { FormControl, FormLabel, Input } from "@mui/joy";
import React from "react";
import type { Business } from "@/src/types/Business";
import Typography from "@/src/components/Typography";
import { EmailOutlined, Phone } from "@mui/icons-material";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
};

const Step2: React.FC<Props> = ({ data, setData }) => {
  return (
    <>
      <style>
        {`
          .br-section {
            box-shadow: none !important;
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .stepperContent {
            background: transparent;
          }
          /* Responsive two-column layout for Step 2 */
          .twoCol { display: grid; grid-template-columns: 1fr; gap: 16px; align-items: start; }
          @media (min-width: 640px) { .twoCol { grid-template-columns: 1fr 1fr; } }
          .twoCol .col { padding: 0 8px; }
        `}
      </style>
      <div
        className="stepperContent"
        style={{
          overflow: "auto",
          overflowX: "hidden",
          padding: '16px 16px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <div style={{
            paddingBottom: 12,
            textAlign: 'center',
            borderBottom: '1px solid #e5e7eb',
            marginBottom: 20,
            paddingTop: 4
          }}>
            <Typography.Label size="lg" sx={{ mb: 1, color: "#111827" }}>
              Contact Information
            </Typography.Label>
            <Typography.Body size="xs" sx={{ color: "#6b7280" }}>
              How can customers reach your business?
            </Typography.Body>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '520px', padding: '0 8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <FormControl required>
                  <FormLabel sx={{ mb: 0.75, fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Email</FormLabel>
                  <Input
                    size="md"
                    type="email"
                    startDecorator={<EmailOutlined color="primary" />}
                    placeholder="Enter your business email"
                    value={data.email}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    sx={{
                      '--Input-focusedThickness': '2px',
                      '--Input-focusedHighlight': 'var(--joy-palette-primary-500)',
                      backgroundColor: '#fafafa',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        borderColor: '#d0d0d0',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                      },
                      '&:focus-within': {
                        backgroundColor: '#ffffff',
                        borderColor: 'var(--joy-palette-primary-500)',
                        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                      }
                    }}
                  />
                </FormControl>

                <FormControl required>
                  <FormLabel sx={{ mb: 0.75, fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Phone Number</FormLabel>
                  <Input
                    size="md"
                    type="tel"
                    startDecorator={<Phone color="primary" />}
                    placeholder="Enter your phone number"
                    value={data.phone_number}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        phone_number: e.target.value,
                      }))
                    }
                    sx={{
                      '--Input-focusedThickness': '2px',
                      '--Input-focusedHighlight': 'var(--joy-palette-primary-500)',
                      backgroundColor: '#fafafa',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        borderColor: '#d0d0d0',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                      },
                      '&:focus-within': {
                        backgroundColor: '#ffffff',
                        borderColor: 'var(--joy-palette-primary-500)',
                        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                      }
                    }}
                  />
                </FormControl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step2;
