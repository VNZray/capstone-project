import React from 'react';
import { Card, CardContent, Stack, Chip, AspectRatio, Typography as JoyTypography } from '@mui/joy';
import Button from '@/src/components/Button';
import Typography from '@/src/components/Typography';
import type { UnifiedApprovalItem } from '@/src/types/approval';

interface UnifiedApprovalCardProps {
  item: UnifiedApprovalItem;
  onView: (item: UnifiedApprovalItem) => void;
  onApprove: (item: UnifiedApprovalItem) => void;
  onReject: (item: UnifiedApprovalItem) => void;
}

const placeholderStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0A1B4710',
  fontSize: '0.65rem',
  color: '#0A1B47',
  fontWeight: 600,
};

const UnifiedApprovalCard: React.FC<UnifiedApprovalCardProps> = ({ item, onView, onApprove, onReject }) => {
  const image = item.image || null;
  const submittedDate = item.submittedDate
    ? new Date(item.submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <Card
      variant="outlined"
      sx={{
        width: 300,
        '--Card-radius': '12px',
        borderColor: 'neutral.outlinedBorder',
        p: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AspectRatio ratio={16/9} sx={{ width: '100%', borderBottom: '1px solid', borderColor: 'neutral.plainHoverBg' }}>
        {image ? (
          <img
            src={image}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div style={placeholderStyle}>No Image</div>
        )}
      </AspectRatio>
      <CardContent sx={{ p: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Stack spacing={0.25}>
          <Typography.CardTitle size="xs" weight="bold" sx={{ lineHeight: 1.2 }}>
            {item.name}
          </Typography.CardTitle>
          <JoyTypography level="body-xs" sx={{ opacity: 0.7 }}>
            Submitted: {submittedDate}
          </JoyTypography>
        </Stack>
        <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
          <Chip size="sm" variant="soft" color="primary">
            {item.typeLabel}
          </Chip>
          {item.categoryLabel && (
            <Chip size="sm" variant="soft" color="neutral">
              {item.categoryLabel}
            </Chip>
          )}
          <Chip size="sm" variant="outlined" color={item.actionType === 'edit' ? 'warning' : 'success'}>
            {item.actionType === 'edit' ? 'Edit' : 'New'}
          </Chip>
        </Stack>
        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
          <Button
            size="sm"
            variant="solid"
            colorScheme="primary"
            onClick={() => onView(item)}
            fullWidth
          >
            View Details
          </Button>
          <Stack direction="row" spacing={0.5}>
            <Button
              size="sm"
              variant="outlined"
              colorScheme="success"
              onClick={() => onApprove(item)}
              fullWidth
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outlined"
              colorScheme="error"
              onClick={() => onReject(item)}
              fullWidth
            >
              Reject
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UnifiedApprovalCard;