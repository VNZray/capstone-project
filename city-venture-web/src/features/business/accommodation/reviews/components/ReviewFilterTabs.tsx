// (No React import needed if using new JSX transform)
import { Button } from '@mui/joy';
import Container from '@/src/components/Container';
import { Star } from 'lucide-react';

// Filter values for reviews: All ratings or a specific star count
export type ReviewFilterValue = 'All' | 5 | 4 | 3 | 2 | 1;

interface ReviewFilterTabsProps {
  active: ReviewFilterValue | null;
  onChange: (val: ReviewFilterValue | null) => void;
  // Optional counts per star to show next to each filter (if provided)
  counts?: Partial<Record<5 | 4 | 3 | 2 | 1, number>>;
  showCounts?: boolean;
}

const filterOrder: ReviewFilterValue[] = ['All', 5, 4, 3, 2, 1];

export default function ReviewFilterTabs({ active, onChange, counts, showCounts = false }: ReviewFilterTabsProps) {
  return (
  <Container direction="row" justify="flex-start" gap="8px" padding='0' style={{ flexWrap: 'wrap' }}>
      {filterOrder.map(f => {
        const isActive = active === f;
        const count = typeof f === 'number' ? counts?.[f] : counts && Object.values(counts).reduce((a,b)=> a + (b||0), 0);
        return (
          <Button
            key={f}
            size="sm"
            variant={isActive ? 'solid' : 'outlined'}
            color={isActive ? 'primary' : 'neutral'}
            onClick={() => onChange(f)}
            endDecorator={<Star size={14} />}
            aria-pressed={isActive}
            aria-label={f === 'All' ? 'Show all reviews' : `Show ${f} star reviews`}
            sx={{
              borderRadius: 999,
              fontWeight: 600,
              '--Button-gap': '6px',
              px: 1.5,
            }}
          >
            {f}{showCounts && typeof count === 'number' && <span style={{ fontWeight: 500, opacity: 0.75 }}> ({count})</span>}
          </Button>
        );
      })}
    </Container>
  );
}
