import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Avatar, Box, Typography, Paper, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Visitor {
  id: string;
  name?: string;
  email?: string;
  points?: number;
  avatar?: string;
  createdAt?: any;
}

const VisitorManagementPage: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get('/api/visitors');
        setVisitors(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setError('Failed to fetch visitors');
      } finally {
        setLoading(false);
      }
    };
    fetchVisitors();
  }, []);

  const filteredVisitors = visitors.filter((v) => {
    const keyword = search.toLowerCase();
    return (
      (v.name && v.name.toLowerCase().includes(keyword)) ||
      (v.email && v.email.toLowerCase().includes(keyword))
    );
  });

  const columns: GridColDef[] = [
    {
      field: 'avatar',
      headerName: 'Avatar',
      width: 90,
      sortable: false,
      renderCell: (params: any) => {
        if (!params.row) return null;
        return (
          <Avatar src={params.value} alt={params.row.name || params.row.email || 'User'}>
            {(!params.value && (params.row.name || params.row.email)) ? (params.row.name || params.row.email)[0].toUpperCase() : ''}
          </Avatar>
        );
      },
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 180,
      valueGetter: (params: any) => {
        if (!params.row) return '-';
        return params.row.name?.trim() ? params.row.name : params.row.email;
      },
      flex: 1,
    },
    { field: 'email', headerName: 'Email', width: 220, flex: 1 },
    { field: 'points', headerName: 'Points', width: 100, type: 'number' },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      valueGetter: (params: any) => {
        if (!params.row) return '-';
        const createdAt = params.row.createdAt;
        if (createdAt?.seconds) return new Date(createdAt.seconds * 1000).toLocaleString();
        if (createdAt?._seconds) return new Date(createdAt._seconds * 1000).toLocaleString();
        return '-';
      },
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: any) => (
        <button
          style={{
            background: '#e57373',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '4px 12px',
            cursor: 'pointer',
          }}
          onClick={() => alert(`Delete user ${params.row.email}?`)}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} mb={3} color="primary.main">
        Visitor Management
      </Typography>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        {loading ? (
          <Typography variant="body1">Loading...</Typography>
        ) : error ? (
          <Typography color="error.main">{error}</Typography>
        ) : (
          <div style={{ width: '100%', height: 520 }}>
            <DataGrid
              rows={filteredVisitors.map((v) => ({ ...v, id: v.id }))}
              columns={columns}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                background: '#fff',
                borderRadius: 2,
                boxShadow: 1,
                '& .MuiDataGrid-columnHeaders': {
                  background: 'linear-gradient(90deg, #e0f7fa 0%, #e8f5e9 100%)',
                  fontWeight: 700,
                  fontSize: 16,
                },
                '& .MuiDataGrid-row': {
                  fontSize: 15,
                },
              }}
            />
          </div>
        )}
      </Paper>
    </Box>
  );
};

export default VisitorManagementPage;
 