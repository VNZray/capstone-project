import React from "react";
import { Stack, Typography, Sheet, IconButton, Chip } from "@mui/joy";
import { Edit, Plus, Star, Trash2 } from "lucide-react";
import Button from "@/src/components/Button";
import type { EventImage } from "@/src/types/Event";

interface ImagesInfoSectionProps {
  images: EventImage[];
  onEdit: () => void;
  onSetPrimary?: (imageId: string) => void;
  onDelete?: (imageId: string) => void;
  onAdd?: () => void;
}

const ImagesInfoSection: React.FC<ImagesInfoSectionProps> = ({ 
  images, 
  onEdit,
  onSetPrimary,
  onDelete,
  onAdd
}) => {
  return (
    <Sheet sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography
          fontFamily={"poppins"}
          level="title-lg"
          fontWeight={700}
          sx={{ color: "#1e293b" }}
        >
          Images ({images.length})
        </Typography>
        <Stack direction="row" spacing={1}>
          {onAdd && (
            <Button
              variant="outlined"
              size="sm"
              startDecorator={<Plus size={16} />}
              onClick={onAdd}
              sx={{ borderRadius: '8px' }}
            >
              Add
            </Button>
          )}
          <Button
            variant="outlined"
            size="sm"
            startDecorator={<Edit size={16} />}
            onClick={onEdit}
            sx={{ borderRadius: '8px' }}
          >
            Edit
          </Button>
        </Stack>
      </Stack>

      {images.length === 0 ? (
        <Typography level="body-md" sx={{ color: "text.tertiary", fontStyle: "italic", textAlign: "center", py: 3 }}>
          No images uploaded yet
        </Typography>
      ) : (
        <div className="ed-image-grid">
          {images.map((image) => (
            <div 
              key={image.id} 
              className={`ed-image-item ${image.is_primary ? 'ed-image-item--primary' : ''}`}
            >
              <img 
                src={image.file_url} 
                alt={image.alt_text || 'Event image'} 
              />
              {image.is_primary && (
                <Chip
                  size="sm"
                  color="primary"
                  sx={{ 
                    position: "absolute", 
                    top: 8, 
                    left: 8,
                    zIndex: 2
                  }}
                >
                  Primary
                </Chip>
              )}
              <div className="ed-image-overlay">
                {!image.is_primary && onSetPrimary && (
                  <IconButton
                    size="sm"
                    variant="solid"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetPrimary(image.id);
                    }}
                    sx={{ bgcolor: "white", color: "#f59e0b", "&:hover": { bgcolor: "#fef3c7" } }}
                  >
                    <Star size={14} />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton
                    size="sm"
                    variant="solid"
                    color="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(image.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
};

export default ImagesInfoSection;
