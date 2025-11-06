import React from "react";
import { FormControl, FormLabel, Input, Typography } from "@mui/joy";
import { Switch } from "@mui/material";
import ResponsiveText from "@/src/components/ResponsiveText";
import type { Business, BusinessHours } from "@/src/types/Business";

type Props = {
  data: Business;
  businessHours: BusinessHours[];
  setBusinessHours: React.Dispatch<React.SetStateAction<BusinessHours[]>>;
};

const Step3BusinessHours: React.FC<Props> = ({ businessHours, setBusinessHours }) => {
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
          .hoursGrid { display: grid; grid-template-columns: 1fr; gap: 8px; }
          @media (min-width: 640px) { .hoursGrid { grid-template-columns: 1fr 1fr; } }
          .hoursItem { display: grid; grid-template-columns: 1fr; row-gap: 8px; align-items: center; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; background: #fff; }
          @media (min-width: 640px) { .hoursItem { grid-template-columns: 110px 1fr auto 1fr auto; column-gap: 8px; row-gap: 0; } }
          .hoursDay { font-weight: 700; color: #374151; letter-spacing: .2px; }
          .hoursSep { color: #6b7280; text-align: center; }
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
            <ResponsiveText type="label-large" weight="bold" color="#111827" mb={1}>
              Business Hours
            </ResponsiveText>
            <ResponsiveText type="body-extra-small" color="#6b7280">
              When is your business open for customers?
            </ResponsiveText>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: '0 8px' }}>
            <FormControl>
              <FormLabel sx={{ mb: 0.75, fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Set your operating hours</FormLabel>
              <div className="hoursGrid">
                {businessHours.map((hour, index) => (
                  <div key={`${hour.day_of_week}-${index}`} className="hoursItem">
                    <Typography level="body-sm" className="hoursDay">{hour.day_of_week}</Typography>
                    <Input
                      size="sm"
                      type="time"
                      value={hour.open_time}
                      readOnly={!hour.is_open}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setBusinessHours((prev) => prev.map((h, i) => (i === index ? { ...h, open_time: newTime } : h)));
                      }}
                      sx={{
                        '--Input-focusedThickness': '2px',
                        '--Input-focusedHighlight': 'var(--joy-palette-primary-500)',
                        backgroundColor: hour.is_open ? '#ffffff' : '#f3f4f6',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': hour.is_open ? { backgroundColor: '#ffffff', borderColor: '#d0d0d0', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)' } : {},
                        '&:focus-within': hour.is_open ? { backgroundColor: '#ffffff', borderColor: 'var(--joy-palette-primary-500)', boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)' } : {},
                      }}
                    />
                    <Typography level="body-sm" className="hoursSep">to</Typography>
                    <Input
                      size="sm"
                      type="time"
                      value={hour.close_time}
                      readOnly={!hour.is_open}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setBusinessHours((prev) => prev.map((h, i) => (i === index ? { ...h, close_time: newTime } : h)));
                      }}
                      sx={{
                        '--Input-focusedThickness': '2px',
                        '--Input-focusedHighlight': 'var(--joy-palette-primary-500)',
                        backgroundColor: hour.is_open ? '#ffffff' : '#f3f4f6',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': hour.is_open ? { backgroundColor: '#ffffff', borderColor: '#d0d0d0', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)' } : {},
                        '&:focus-within': hour.is_open ? { backgroundColor: '#ffffff', borderColor: 'var(--joy-palette-primary-500)', boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)' } : {},
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                      <Typography level="body-sm" sx={{ fontSize: 12, color: hour.is_open ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {hour.is_open ? 'Open' : 'Closed'}
                      </Typography>
                      <Switch
                        size="small"
                        checked={hour.is_open}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setBusinessHours((prev) => prev.map((h, i) => (i === index ? { ...h, is_open: checked } : h)));
                        }}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#22c55e' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#22c55e' },
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </FormControl>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step3BusinessHours;
