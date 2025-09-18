import React, { useState } from "react";
import {
  Stack,
  Typography,
  Sheet,
  Button,
  Modal,
  ModalDialog,
  ModalClose,
  Grid,
  Card,
  CardContent,
} from "@mui/joy";
import { Paperclip, Download, Eye, FileText, Image } from "lucide-react";
import type { Report } from "../../../../types/Report";

interface AttachmentsSectionProps {
  report: Report;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({ report }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isImageFile = (fileName: string, fileType?: string) => {
    if (fileType) {
      return fileType.startsWith('image/');
    }
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const downloadAttachment = (attachment: { file_url: string; file_name: string }) => {
    const link = document.createElement('a');
    link.href = attachment.file_url;
    link.download = attachment.file_name;
    link.target = '_blank';
    link.click();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!report.attachments || report.attachments.length === 0) {
    return (
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: 8 }}>
        <Typography level="h4" sx={{ mb: 2 }} startDecorator={<Paperclip size={18} />}>
          Attachments
        </Typography>
        <Typography level="body-sm" sx={{ opacity: 0.7, textAlign: 'center' }}>
          No attachments found
        </Typography>
      </Sheet>
    );
  }

  return (
    <>
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: 8 }}>
        <Typography level="h4" sx={{ mb: 2 }} startDecorator={<Paperclip size={18} />}>
          Attachments ({report.attachments.length})
        </Typography>

        <Grid container spacing={2}>
          {report.attachments.map((attachment) => {
            const isImage = isImageFile(attachment.file_name, attachment.file_type);
            
            return (
              <Grid xs={12} sm={6} key={attachment.id}>
                <Card variant="outlined" size="sm">
                  <CardContent sx={{ p: 1.5 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {isImage ? (
                          <Image size={16} color="#059669" />
                        ) : (
                          <FileText size={16} color="#6366f1" />
                        )}
                        <Typography 
                          level="body-sm" 
                          sx={{ 
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                          }}
                          title={attachment.file_name}
                        >
                          {attachment.file_name}
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                          {formatFileSize(attachment.file_size)}
                        </Typography>
                        
                        <Stack direction="row" spacing={0.5}>
                          {isImage && (
                            <Button
                              size="sm"
                              variant="outlined"
                              color="success"
                              startDecorator={<Eye size={12} />}
                              onClick={() => setSelectedImage(attachment.file_url)}
                            >
                              View
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outlined"
                            color="primary"
                            startDecorator={<Download size={12} />}
                            onClick={() => downloadAttachment(attachment)}
                          >
                            Download
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Sheet>

      {/* Image Preview Modal */}
      <Modal open={!!selectedImage} onClose={() => setSelectedImage(null)}>
        <ModalDialog size="lg" sx={{ maxWidth: '90vw', maxHeight: '90vh', p: 1 }}>
          <ModalClose />
          <img
            src={selectedImage || ''}
            alt="Attachment preview"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
        </ModalDialog>
      </Modal>
    </>
  );
};

export default AttachmentsSection;
