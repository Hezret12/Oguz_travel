import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
  Grid,
  Alert,
  Dialog,
  Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LockIcon from '@mui/icons-material/Lock';
import toast from 'react-hot-toast';
import { CustomDialog } from './CustomDialog';
import { CustomDialogHeader } from './CustomDialogHeader';
import { useLocale } from '../../hooks/useLocale';
import { useAuth } from '../../context/AuthContext';
import { updatePassportApi } from '../../api/queries/patch';
import { BASE_URL } from '../../api/axiosIntance';
import CustomTextField from '../CustomTextField';
import CustomDatePicker from '../CustomDatePicker';
import { useForm } from 'react-hook-form';

export const ClientDocumentModal = ({ open, onClose, client, onRefresh }) => {
  const { t } = useLocale();
  const { user } = useAuth();
  const isAdmin = Boolean(user?.role === 'admin' || user?.user_is_admin || user?.isAdmin);
  const isVipClient = Boolean(client?.vip === true || client?.vip === 'true' || client?.vip === 1);
  const isRestrictedForUser = isVipClient && !isAdmin;

  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  const fileUrl = client?.passport_file_url || client?.passportFileUrl || client?.images?.[0];
  const fullUrl = fileUrl ? (fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`) : null;
  const fileName = fileUrl ? fileUrl.split('/').pop() : '';
  const isImageFile = Boolean(
    (fileName && /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(fileName)) ||
    (fullUrl && /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(fullUrl))
  );

  const { control, handleSubmit } = useForm({
    defaultValues: {
      passport_number: client?.passport_number || '',
      passportIssueDate: client?.passportIssueDate || client?.passport_issue_date || null,
      passportExpiryDate: client?.passportExpiryDate || null,
      passportCountryOfIssue: client?.passportCountryOfIssue || '',
    },
  });

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const submitPassportHandler = async (data) => {
    if (!client?.guid) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('guid', client.guid);
      if (data.passport_number) formData.append('passport_number', data.passport_number);
      if (data.passportIssueDate) formData.append('passportIssueDate', data.passportIssueDate);
      if (data.passportExpiryDate) formData.append('passportExpiryDate', data.passportExpiryDate);
      if (data.passportCountryOfIssue) formData.append('passportCountryOfIssue', data.passportCountryOfIssue);

      if (selectedFile) {
        formData.append('images', selectedFile);
      }

      await updatePassportApi(formData);
      toast.success(t('clients.documentUploaded') || 'Pasport maglumatlary täzelendi');
      onRefresh?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error(t('clients.documentUploadError') || 'Täzelenende ýalňyşlyk çykdy');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!window.confirm(t('clients.deleteConfirmDocument') || 'Bu resminamany pozmak isleýärsiňizmi?')) return;
    try {
      setDeleting(true);
      const formData = new FormData();
      formData.append('guid', client?.guid);
      formData.append('images', '');

      await updatePassportApi(formData);
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
    <CustomDialog widthX={650} open={open} close={onClose}>
      <CustomDialogHeader
        variant="h5"
        title={`${client?.fullName || ''} - Pasport & Resminama`}
      />

      <Box component="form" onSubmit={handleSubmit(submitPassportHandler)} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {isRestrictedForUser ? (
          <Alert
            severity="warning"
            icon={<LockIcon />}
            sx={{
              borderRadius: '10px',
              my: 1,
              fontWeight: 500,
            }}
          >
            {t('clients.vipFileRestrictedNotice') || 'VIP müşderiniň ýüklenen resminamalary diňe Admin tarapyndan görülip bilner.'}
          </Alert>
        ) : (
          <>
            {/* Existing File View */}
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
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(37, 99, 235, 0.15)'
                          : 'rgba(37, 99, 235, 0.1)',
                      color: 'primary.main',
                      flexShrink: 0,
                    }}
                  >
                    <InsertDriveFileIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                      {t('clients.passportDocument') || 'Pasport Faýly'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {fileName}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.preventDefault();
                      if (isImageFile) {
                        setImagePreviewOpen(true);
                      } else {
                        window.open(fullUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    title={t('clients.viewDocument')}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    color="success"
                    onClick={handleDownload}
                    title={t('clients.downloadDocument')}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>

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
            ) : null}
          </>
        )}

        {/* Passport Form Inputs */}
        <Grid container spacing={2}>
          <Grid size={6}>
            <CustomTextField
              name="passport_number"
              control={control}
              label={t("columns.passportNumber")}
            />
          </Grid>
          <Grid size={6}>
            <CustomTextField
              name="passportCountryOfIssue"
              control={control}
              label={t("columns.passportCountryOfIssue")}
            />
          </Grid>
          <Grid size={6}>
            <CustomDatePicker
              name="passportIssueDate"
              control={control}
              label={t("columns.passportIssueDate")}
            />
          </Grid>
          <Grid size={6}>
            <CustomDatePicker
              name="passportExpiryDate"
              control={control}
              label={t("columns.passportExpiryDate")}
            />
          </Grid>
        </Grid>

        {/* Upload File Zone */}
        {!isRestrictedForUser && (
          <Paper
            variant="outlined"
            component="label"
            sx={{
              py: 2.5,
              px: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              borderRadius: '12px',
              borderStyle: 'dashed',
              borderWidth: 1.5,
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
              cursor: 'pointer',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.015)' : '#FAFBFD',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.06)' : 'rgba(37,99,235,0.03)',
                '& .upload-icon': {
                  transform: 'scale(1.1)',
                  color: 'primary.main',
                },
              },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <input
              type="file"
              hidden
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
            <Box
              className="upload-icon"
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(37, 99, 235, 0.15)'
                    : 'rgba(37, 99, 235, 0.08)',
                color: 'primary.main',
                transition: 'all 0.2s ease',
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {selectedFile
                  ? selectedFile.name
                  : (fullUrl
                    ? t('clients.changeDocument', 'Täze faýl saýlaň')
                    : t('clients.uploadDocument', 'Faýl / Surat saýlamak üçin basyň'))}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.25, display: 'block' }}>
                PNG, JPG, PDF (maks. 10MB)
              </Typography>
            </Box>
          </Paper>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: '10px' }}>
            {t('cancel', 'Yza')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ borderRadius: '10px' }}
          >
            {t('save', 'Ýatda sakla')}
          </Button>
        </Box>
      </Box>

      {/* Image Preview Lightbox Modal */}
      <Dialog
        open={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              bgcolor: "background.paper",
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              maxWidth: { xs: "96vw", sm: "92vw", md: "1150px" },
              width: "100%",
            },
          },
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(6px)",
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            px: 2.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
            {fileName || t('clients.passportDocument', 'Pasport Faýly')}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {fullUrl && (
              <Tooltip title={t("download", "Ýükläp al")}>
                <IconButton size="small" onClick={handleDownload}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={() => setImagePreviewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(0, 0, 0, 0.45)"
                : "rgba(0, 0, 0, 0.03)",
            minHeight: { xs: 350, sm: 500 },
            maxHeight: "86vh",
            overflow: "auto",
          }}
        >
          {fullUrl && (
            <Box
              component="img"
              src={fullUrl}
              alt={fileName}
              sx={{
                maxWidth: "100%",
                maxHeight: "80vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: "10px",
                boxShadow: "0 12px 36px rgba(0,0,0,0.3)",
              }}
            />
          )}
        </Box>
      </Dialog>
    </CustomDialog>
  );
};

export default ClientDocumentModal;
