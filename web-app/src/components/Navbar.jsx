import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

// İkonlar
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssessmentIcon from '@mui/icons-material/Assessment'; // Rapor ikonu eklendi
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';

// Çekmece Bileşenini İçe Aktar
import ReportHistoryDrawer from './ReportHistoryDrawer'; 

export default function Navbar({ handleDrawerToggle, toggleColorMode, mode }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const navigate = useNavigate();

  // Çekmece (Drawer) açık/kapalı durumu
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
    handleMenuClose();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'background.paper', color: 'text.primary', backgroundImage: 'none', borderBottom: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" fontSize="large" />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main', letterSpacing: 1 }}>
              E-Teacher
            </Typography>
          </Box>

          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { mt: 1, minWidth: 220, borderRadius: 2 } }}
          >
            <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              Profil
            </MenuItem>
            
            <MenuItem component={Link} to="/saved-schedule" onClick={handleMenuClose}>
              <ListItemIcon><CalendarMonthIcon fontSize="small" /></ListItemIcon>
              Kaydedilen Programlar
            </MenuItem>
            
            {/* GEÇMİŞ RAPORLAR MENÜSÜ EKLENDİ */}
            <MenuItem onClick={() => { handleMenuClose(); setDrawerOpen(true); }}>
              <ListItemIcon><AssessmentIcon fontSize="small" /></ListItemIcon>
              Geçmiş Raporlar
            </MenuItem>
            <Divider />
            
            <MenuItem onClick={() => { toggleColorMode(); handleMenuClose(); }}>
              <ListItemIcon>
                {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              </ListItemIcon>
              {mode === 'dark' ? 'Aydınlık Mod' : 'Karanlık Mod'}
            </MenuItem>
            <Divider />
            
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              Çıkış Yap
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* YAN PANEL BİLEŞENİ (Menüden tetiklenecek) */}
      <ReportHistoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}