import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemIcon, 
  ListItemText, 
  Typography,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ConfirmationNumber as PassIcon,
  Park as DiscoveryIcon,
  ShoppingBag as SouvenirIcon,
  Spa as EcoForumIcon,
  ViewCarousel as BannerIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Group as GroupIcon,
  Notifications as NotificationsIcon,
  Star as StarIcon
} from '@mui/icons-material';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  const drawerWidth = expanded ? 240 : 64;

  const toggleDrawer = () => {
    setExpanded(!expanded);
  };

  const menuItems = [
    { name: 'Pass Management', path: '/pass-management', icon: <PassIcon /> },
    { name: 'Discovery Management', path: '/discovery', icon: <DiscoveryIcon /> },
    { name: 'Souvenir Management', path: '/souvenir-management', icon: <SouvenirIcon /> },
    { name: 'Eco Forum Management', path: '/ecoforum-management', icon: <EcoForumIcon /> },
    { name: 'Banner Management', path: '/banner-management', icon: <BannerIcon /> },
    { name: 'Park Highlights', path: '/park-highlights', icon: <StarIcon /> },
    { name: 'Visitor Management', path: '/visitor-management', icon: <GroupIcon /> },
    { name: 'Notification Management', path: '/notification-management', icon: <NotificationsIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#222e3c',
          color: 'white',
          borderRight: 'none',
          overflowX: 'hidden',
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
        '& .MuiPaper-root': {
          borderRadius: 0,
        }
      }}
      className={expanded ? 'sidebar-expanded' : 'sidebar-collapsed'}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: expanded ? 2 : 1, 
        justifyContent: expanded ? 'center' : 'center'
      }}>
        {expanded && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <DashboardIcon sx={{ mr: 1 }} />
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Theme Park
            </Typography>
          </Box>
        )}
        {!expanded && (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', my: 1 }}>
            <DashboardIcon fontSize="large" />
          </Box>
        )}
      </Box>
      
      {expanded && (
        <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 2 }}>
          Admin Dashboard
        </Typography>
      )}
      
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: expanded ? 'flex-end' : 'center',
          px: 1,
          mb: 1
        }}
      >
        <Tooltip title={expanded ? "Collapse menu" : "Expand menu"} placement="right">
          <IconButton 
            onClick={toggleDrawer}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            {expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
      
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                borderRadius: '8px',
                mx: 1,
                mb: 0.5,
                justifyContent: expanded ? 'initial' : 'center',
                minHeight: 48,
                '&.active': {
                  backgroundColor: 'rgba(79, 209, 197, 0.15)',
                  '& .MuiListItemIcon-root': {
                    color: '#4fd1c5',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#4fd1c5',
                    fontWeight: 'bold',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              <Tooltip title={!expanded ? item.name : ""} placement="right">
                <ListItemIcon 
                  sx={{ 
                    color: 'white', 
                    minWidth: expanded ? '40px' : 0,
                    mr: expanded ? 2 : 'auto',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              </Tooltip>
              {expanded && <ListItemText primary={item.name} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      {expanded && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            © 2023 Theme Park Admin
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar; 