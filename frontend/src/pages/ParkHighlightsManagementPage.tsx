import React, { useEffect, useState, lazy, Suspense } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Snackbar,
  Alert,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, GridView as GridViewIcon, List as ListIcon } from '@mui/icons-material';
import QRCode from 'react-qr-code';

interface Highlight {
  id: number;
  title: string;
  imageUrl: string;
  description?: string;
  linkUrl: string;
  order: number;
}

const API_URL = '/api/highlights';

const ParkHighlightsManagementPage: React.FC = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editHighlight, setEditHighlight] = useState<Highlight | null>(null);
  const [form, setForm] = useState<Omit<Highlight, 'id'>>({
    title: '',
    imageUrl: '',
    description: '',
    linkUrl: '',
    order: 1,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [missions, setMissions] = useState<any[]>([]);
  const [previewView, setPreviewView] = useState<'grid' | 'list'>('grid');

  const fetchHighlights = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setHighlights(data.data || []);
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to load highlights', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  useEffect(() => {
    if (open && form.order === 1) {
      fetch('/api/missions')
        .then(res => res.json())
        .then(data => setMissions(data.data || []));
    }
  }, [open, form.order]);

  const handleOpen = (highlight?: Highlight) => {
    if (highlight) {
      setEditHighlight(highlight);
      setForm({
        title: highlight.title,
        imageUrl: highlight.imageUrl,
        description: highlight.description || '',
        linkUrl: highlight.linkUrl,
        order: highlight.order,
      });
    } else {
      setEditHighlight(null);
      setForm({ title: '', imageUrl: '', description: '', linkUrl: '', order: 1 });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'order' ? Number(value) : value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.imageUrl || !form.linkUrl || !form.order) {
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
      return;
    }
    try {
      const res = await fetch(editHighlight ? `${API_URL}/${editHighlight.id}` : API_URL, {
        method: editHighlight ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save');
      await fetchHighlights();
      setSnackbar({ open: true, message: editHighlight ? 'Highlight updated' : 'Highlight added', severity: 'success' });
      setOpen(false);
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to save highlight', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this highlight?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchHighlights();
      setSnackbar({ open: true, message: 'Highlight deleted', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to delete highlight', severity: 'error' });
    }
  };

  return (
    <Box className="page-container">
      <Typography variant="h4" gutterBottom>Park Highlights Management</Typography>
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Add Highlight
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Link</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {highlights.sort((a, b) => a.order - b.order).map((h) => (
              <TableRow key={h.id}>
                <TableCell>{h.order}</TableCell>
                <TableCell>{h.title}</TableCell>
                <TableCell>
                  <img src={h.imageUrl} alt={h.title} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                </TableCell>
                <TableCell>{h.description}</TableCell>
                <TableCell>{h.linkUrl}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(h)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(h.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editHighlight ? 'Edit Highlight' : 'Add Highlight'}</DialogTitle>
        <DialogContent sx={{ height: 420 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, height: '100%' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Highlight Details</Typography>
              <TextField
                margin="normal"
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                margin="normal"
                label="Image URL"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                margin="normal"
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
              />
              <TextField
                margin="normal"
                label="Link URL"
                name="linkUrl"
                value={form.linkUrl}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                margin="normal"
                label="Order"
                name="order"
                type="number"
                value={form.order}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 1, max: 6 }}
              />
            </Box>
            {form.order === 1 && (
              <Box sx={{ flex: 1, bgcolor: '#f5f7fa', borderRadius: 2, p: 2, minWidth: 320, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Preview: Activities shown to users</Typography>
                  <Box>
                    <IconButton size="small" color={previewView === 'grid' ? 'primary' : 'default'} onClick={() => setPreviewView('grid')}><GridViewIcon /></IconButton>
                    <IconButton size="small" color={previewView === 'list' ? 'primary' : 'default'} onClick={() => setPreviewView('list')}><ListIcon /></IconButton>
                  </Box>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  {previewView === 'grid' ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
                      {missions.map((m) => (
                        <Box key={m.type} sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
                          <Chip label={m.icon} size="small" sx={{ mb: 1 }} />
                          <QRCode value={m.type} style={{ width: 48, height: 48, marginBottom: 8 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>{m.name}</Typography>
                          <Typography variant="caption" sx={{ color: '#888', textAlign: 'center' }}>({m.type})</Typography>
                          <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', mt: 0.5 }}>地點: {m.location}</Typography>
                          <Typography variant="body2" sx={{ color: '#333', fontWeight: 'bold', textAlign: 'center' }}>需要格數: {m.passCost}</Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <List dense sx={{ bgcolor: 'transparent', borderRadius: 1 }}>
                      {missions.map((m) => (
                        <ListItem key={m.type} alignItems="flex-start" sx={{ mb: 1, borderRadius: 1, bgcolor: '#fff', boxShadow: 1 }}>
                          <ListItemIcon>
                            <Chip label={m.icon} size="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <>
                                <strong>{m.name}</strong> <span style={{ color: '#888', fontSize: 12 }}>({m.type})</span>
                              </>
                            }
                            secondary={<span style={{ color: '#666' }}>地點: {m.location} | 需要格數: <b>{m.passCost}</b></span>}
                          />
                          <Box sx={{ ml: 2, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f0f0', borderRadius: 1 }}>
                            <QRCode value={m.type} style={{ width: '100%', height: '100%' }} />
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">{editHighlight ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ParkHighlightsManagementPage; 