import * as React from 'react';
import { Table, Sheet, Switch, Input, Typography, Stack } from '@mui/joy';
import type { BusinessHourInput } from '@/src/types/Business';

interface BusinessHoursEditorProps {
  rows: BusinessHourInput[];
  onChange: (rows: BusinessHourInput[]) => void;
  onValidationChange?: (valid: boolean) => void;
}

type RowState = BusinessHourInput & { day_of_week: string };
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const rowError = (r: RowState): string | null => {
  if (!r.is_open) return null;
  if (!r.open_time || !r.close_time) return 'Set both times';
  const o = r.open_time.slice(0,5);
  const c = r.close_time.slice(0,5);
  if (!timeRegex.test(o) || !timeRegex.test(c)) return 'Invalid';
  if (o >= c) return 'Close after open';
  return null;
};

const BusinessHoursEditor: React.FC<BusinessHoursEditorProps> = ({ rows, onChange, onValidationChange }) => {
  // Propagate validity on every render change
  React.useEffect(() => {
    const anyInvalid = rows.some(r => rowError(r) !== null);
    onValidationChange?.(!anyInvalid);
  }, [rows, onValidationChange]);

  const updateRow = (i: number, patch: Partial<RowState>) => {
    onChange(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  };

  // could expose invalid state upward if needed later

  return (
    <Stack gap={1.5}>
      <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
        Set each day's operating hours. Toggle a day off if closed.
      </Typography>
      <Sheet variant="outlined" sx={{ borderRadius: 10, p: 0, overflow: 'hidden' }}>
        <Table size="sm" hoverRow sx={{ '--TableCell-paddingY': '8px', '--TableCell-paddingX': '12px' }}>
          <thead>
            <tr>
              <th style={{ width: 120 }}>Day</th>
              <th style={{ width: 120 }}>Open</th>
              <th style={{ width: 120 }}>Close</th>
              <th style={{ width: 80 }}>Open?</th>
              <th style={{ width: 140 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const error = rowError(r);
              return (
                <tr key={r.day_of_week} style={error ? { background: 'var(--joy-palette-danger-softBg)' } : undefined}>
                  <td><Typography level="body-sm" sx={{ fontWeight: 600 }}>{r.day_of_week}</Typography></td>
                  <td>
                    <Input type="time" value={r.open_time ? r.open_time.slice(0,5) : ''} disabled={!r.is_open}
                      onChange={e => updateRow(idx, { open_time: e.target.value ? e.target.value+':00' : null })}
                      slotProps={{ input: { step: 300 } }} sx={{ '--Input-radius': '6px', fontSize: '0.8rem', minWidth: 110 }} />
                  </td>
                  <td>
                    <Input type="time" value={r.close_time ? r.close_time.slice(0,5) : ''} disabled={!r.is_open}
                      onChange={e => updateRow(idx, { close_time: e.target.value ? e.target.value+':00' : null })}
                      slotProps={{ input: { step: 300 } }} sx={{ '--Input-radius': '6px', fontSize: '0.8rem', minWidth: 110 }} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Switch checked={r.is_open} onChange={e => updateRow(idx, { is_open: e.target.checked })} size="sm" />
                  </td>
                  <td>{error && <Typography level="body-xs" color="danger">{error}</Typography>}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Sheet>
  <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>Hours are saved when you click the main Save.</Typography>
    </Stack>
  );
};

export default BusinessHoursEditor;
