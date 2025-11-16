import * as React from 'react';
import { Box, Typography, Sheet, Avatar, IconButton, Textarea, Button, Chip, Dropdown, Menu, MenuButton, MenuItem, Stack } from '@mui/joy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import ReplyIcon from '@mui/icons-material/Reply';
import Container from '@/src/components/Container';

export interface Review {
  id: string;
  user: { name: string; avatar?: string; verified?: boolean };
  rating: 1|2|3|4|5;
  createdAt: string; // ISO
  text: string;
  images?: string[];
  reply?: { text: string; updatedAt: string };
}

interface ReviewCardProps {
  review: Review;
  onSaveReply?: (text: string) => void;
  onDeleteReply?: () => void;
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onSaveReply, onDeleteReply }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [editingReply, setEditingReply] = React.useState(false);
  const [draftReply, setDraftReply] = React.useState(review.reply?.text || '');

  const truncated = review.text.length > 240 && !expanded;
  const displayText = truncated ? review.text.slice(0,240) + '…' : review.text;

  const handleSave = () => {
    if (draftReply.trim()) {
      onSaveReply?.(draftReply.trim());
      setEditingReply(false);
    }
  };

  return (
    <Container elevation={2} hover style={{ flex: 1}}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Avatar src={review.user.avatar} alt={review.user.name} size="lg" />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography level="title-md" sx={{ fontWeight: 600 }}>{review.user.name}</Typography>
            {review.user.verified && (
              <Chip size="sm" variant="soft" color="success" startDecorator={<VerifiedIcon fontSize="small" />} aria-label="Verified guest">Verified</Chip>
            )}
            <Typography level="body-xs" sx={{ opacity: 0.6 }}>{formatDate(review.createdAt)}</Typography>
          </Box>

          {/* Rating stars */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mt: 0.5 }} aria-label={`Rated ${review.rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} fontSize="small" color={i < review.rating ? 'warning' : 'disabled'} />
            ))}
          </Box>

          <Typography level="body-sm" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
            {displayText}
            {truncated && (
              <Button variant="plain" size="sm" onClick={() => setExpanded(true)} sx={{ ml: 0.5 }}>Read more</Button>
            )}
          </Typography>

          {review.images && review.images.length > 0 && (
            <Box
              sx={{
                mt: 1.5,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              {review.images.map((img, idx) => (
                <Box
                  key={idx}
                  sx={{
                    position: 'relative',
                    width: 96,
                    height: 72,
                    borderRadius: 8,
                    overflow: 'hidden',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    '&:hover img': { transform: 'scale(1.05)' },
                    transition: 'box-shadow 160ms ease',
                    '&:focus-within': {
                      outline: '2px solid var(--joy-palette-primary-outlinedBorder)',
                      outlineOffset: 2,
                    },
                  }}
                >
                  <img
                    src={img}
                    alt={`Attachment ${idx + 1} for review by ${review.user.name}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 180ms ease',
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Owner reply section */}
          <Box sx={{ mt: 2 }}>
            {!review.reply && !editingReply && (
              <Button
                size="sm"
                variant="outlined"
                startDecorator={<ReplyIcon fontSize="small" />}
                onClick={() => setEditingReply(true)}
                aria-label={`Reply to ${review.user.name}`}
              >
                Reply
              </Button>
            )}
            {(editingReply || review.reply) && (
              <Box sx={{ mt: 1.5 }}>
                {editingReply ? (
                  <Stack spacing={1}>
                    <Textarea
                      minRows={3}
                      autoFocus
                      value={draftReply}
                      placeholder="Write a reply to this guest..."
                      onChange={(e) => setDraftReply(e.target.value)}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="sm" variant="solid" onClick={handleSave} disabled={!draftReply.trim()}>
                        Save Reply
                      </Button>
                      <Button size="sm" variant="plain" onClick={() => { setEditingReply(false); setDraftReply(review.reply?.text || ''); }}>
                        Cancel
                      </Button>
                    </Box>
                  </Stack>
                ) : (
                  <Sheet variant="soft" color="neutral" sx={{ p: 1.5, borderRadius: 10 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Typography level="body-sm" sx={{ flex: 1, whiteSpace: 'pre-line' }}>{review.reply?.text}</Typography>
                      <Dropdown>
                        <MenuButton slots={{ root: IconButton }} size="sm" variant="outlined" aria-label="Reply actions">
                          <MoreVertIcon fontSize="small" />
                        </MenuButton>
                        <Menu>
                          <MenuItem onClick={() => { setEditingReply(true); setDraftReply(review.reply?.text || ''); }}>Edit Reply</MenuItem>
                          <MenuItem onClick={() => onDeleteReply?.()}>Delete Reply</MenuItem>
                        </Menu>
                      </Dropdown>
                    </Box>
                    <Typography level="body-xs" sx={{ mt: 0.5, opacity: 0.6 }}>
                      Replied {review.reply?.updatedAt && new Date(review.reply.updatedAt).toLocaleString()}
                    </Typography>
                  </Sheet>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Vertical quick actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Dropdown>
            <MenuButton slots={{ root: IconButton }} size="sm" variant="outlined" aria-label="More actions">
              <MoreVertIcon fontSize="small" />
            </MenuButton>
            <Menu>
              <MenuItem>Report</MenuItem>
              <MenuItem>Flag</MenuItem>
              <MenuItem color="danger">Delete</MenuItem>
            </Menu>
          </Dropdown>
        </Box>
      </Box>
    </Container>
  );
};

export default ReviewCard;
