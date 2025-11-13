import React from 'react';
import { FileText, Image, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileAttachmentProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  onRemove?: () => void;
  isPreview?: boolean;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  fileUrl,
  fileName,
  fileType,
  fileSize,
  onRemove,
  isPreview = false
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .download(fileUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const getFileIcon = () => {
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const isImage = fileType.startsWith('image/');

  return (
    <div className="relative group max-w-xs">
      {isImage && !isPreview ? (
        <div className="relative">
          <img
            src={`${supabase.storage.from('chat-attachments').getPublicUrl(fileUrl).data.publicUrl}`}
            alt={fileName}
            className="rounded-lg max-h-64 object-cover cursor-pointer"
            onClick={handleDownload}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border">
          <div className="flex-shrink-0 text-muted-foreground">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileName}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
          </div>
          {isPreview && onRemove ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileAttachment;
