import React from 'react';
import type { UnifiedApprovalItem } from '@/src/types/approval';
import Card from '@/src/components/Card';
import { Chip } from '@mui/joy';
import placeholderImage from '@/src/assets/images/placeholder-image.png';

interface UnifiedApprovalCardProps {
  item: UnifiedApprovalItem;
  onView: (item: UnifiedApprovalItem) => void;
  onApprove: (item: UnifiedApprovalItem) => void;
  onReject: (item: UnifiedApprovalItem) => void;
}

const UnifiedApprovalCard: React.FC<UnifiedApprovalCardProps> = ({ item, onView, onApprove, onReject }) => {
  const submittedDate = item.submittedDate
    ? new Date(item.submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <Card
      image={item.image || placeholderImage}
      imageAlt={item.name}
      aspectRatio="16/9"
      title={item.name}
      subtitle={`Submitted: ${submittedDate}`}
      size="default"
      variant="grid"
      elevation={2}
      hover
      actions={[
        {
          label: 'View Details',
          onClick: () => onView(item),
          variant: 'solid',
          colorScheme: 'primary',
          fullWidth: true,
        },
        {
          label: 'Approve',
          onClick: () => onApprove(item),
          variant: 'outlined',
          colorScheme: 'success',
          fullWidth: true,
        },
        {
          label: 'Reject',
          onClick: () => onReject(item),
          variant: 'outlined',
          colorScheme: 'error',
          fullWidth: true,
        },
      ]}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <Chip size="sm" color="primary" variant="soft">
          {item.typeLabel}
        </Chip>
        {item.categoryLabel && item.categoryLabel !== '—' && (
          <Chip size="sm" color="neutral" variant="soft">
            {item.categoryLabel}
          </Chip>
        )}
        <Chip
          size="sm"
          variant="soft"
          color={item.actionType === 'edit' ? 'warning' : 'success'}
        >
          {item.actionType === 'edit' ? 'Edit' : 'New'}
        </Chip>
      </div>
    </Card>
  );
};

export default UnifiedApprovalCard;