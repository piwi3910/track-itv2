import { api } from './api';
import { Attachment } from '@track-it/shared';

export interface UploadAttachmentDto {
  file: File;
  taskId: string;
}

class AttachmentService {
  async upload(data: UploadAttachmentDto): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('taskId', data.taskId);

    const response = await api.post<Attachment>('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async listByTask(taskId: string): Promise<Attachment[]> {
    const response = await api.get<Attachment[]>(`/attachments/task/${taskId}`);
    return response.data;
  }

  async download(id: string): Promise<void> {
    const response = await api.get(`/attachments/${id}/download`, {
      responseType: 'blob',
    });
    
    // Extract filename from content-disposition header
    const contentDisposition = response.headers['content-disposition'];
    const fileNameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = fileNameMatch ? fileNameMatch[1] : 'download';

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/attachments/${id}`);
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📑';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '🗜️';
    if (mimeType.startsWith('text/')) return '📃';
    return '📎';
  }

  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

export const attachmentService = new AttachmentService();