import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import toast from 'react-hot-toast';
import { CustomDialog } from './CustomDialog';
import { CustomDialogHeader } from './CustomDialogHeader';
import { useLocale } from '../../hooks/useLocale';
import { api } from '../../api/service/apiHelper';
import { BASE_URL } from '../../api/axiosIntance';

export const ClientDocumentModal = ({ open, onClose, client, onRefresh }) => {
  const { t } = useLocale();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileUrl = client?.passport_file_url || client?.passportFileUrl;
  const fullUrl = fileUrl ? (fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`) : null;
  const fileName = fileUrl ? fileUrl.split('/').pop() : '';

  // Dosyayı Bilgisayara İndirme (Download)
  const handleDownload = async () => {
    if (!fullUrl) return;
    try {
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `${client?.fullName || 'Client'}-passport`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(t('clients.fileDownloaded') || 'Faýl üstünlikli ýüklendi');
    } catch (err) {
      console.error(err);
      toast.error(t('clients.fileDownloadError') || 'Faýl ýüklenende ýalňyşlyk çykdy');
    }
  };

  // Yeni Dosya Yükleme (Upload)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('guid', client?.guid);
      formData.append('passport_file', file);

      await api.patchFormDataPrivate('/client/update-client', formData);
      toast.success(t('clients.documentUploaded') || 'Resminama üstünlikli ýüklendi');
      onRefresh?.();
    } catch (err) {
      console.error(err);
      toast.error(t('clients.documentUploadError') || 'Resminama ýüklenende ýalňyşlyk çykdy');
    } finally {
      setUploading(false);
    }
  };

  // Belgeyi Silme (Delete)
  const handleDeleteFile = async () => {
    if (!window.confirm(t('clients.deleteConfirmDocument') || 'Bu resminamany pozmak isleýärsiňizmi?')) return;
    try {
      setDeleting(true);
      const formData = new FormData();
      formData.append('guid', client?.guid);
      formData.append('passport_file', ''); // Dosya yolunu temizle

      await api.patchFormDataPrivate('/client/update-client', formData);
      toast.success(t('clients.documentDeleted') || 'Resminama pozuldy');
      onRefresh?.();
    } catch (err) {
      console.error(err);
      toast.error(t('clients.documentDeleteError') || 'Resminama pozulanda ýalňyşlyk çykdy');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <CustomDialog widthX={600} open={open} close={onClose}>
      <CustomDialogHeader
        variant="h5"
        title={`${client?.fullName || ''} - ${t('clients.documents')}`}
      />

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {fullUrl ? (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f9fafb',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
              <InsertDriveFileIcon color="primary" sx={{ fontSize: 32 }} />
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                  {t('clients.passportDocument')}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {fileName}
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1}>
              {/* Göster / Önizle */}
              <IconButton
                size="small"
                color="primary"
                component="a"
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={t('clients.viewDocument')}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>

              {/* Bilgisayara İndir */}
              <IconButton
                size="small"
                color="success"
                onClick={handleDownload}
                title={t('clients.downloadDocument')}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>

              {/* Sil */}
              <IconButton
                size="small"
                color="error"
                onClick={handleDeleteFile}
                disabled={deleting}
                title={t('clients.deleteDocument')}
              >
                {deleting ? <CircularProgress size={18} /> : <DeleteIcon fontSize="small" />}
              </IconButton>
            </Stack>
          </Paper>
        ) : (
          <Box
            sx={{
              p: 4,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t('clients.noDocument')}
            </Typography>
          </Box>
        )}

        {/* Yeni Belge Yükleme Butonu */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
            disabled={uploading}
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            {fullUrl ? t('clients.changeDocument') : t('clients.uploadDocument')}
            <input
              type="file"
              hidden
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
            />
          </Button>
        </Box>
      </Box>
    </CustomDialog>
  );
};

export default ClientDocumentModal;
