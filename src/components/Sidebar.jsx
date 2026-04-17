import React from 'react';
import { Box, Drawer, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

// İkonlar
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import SchoolIcon from '@mui/icons-material/School';
import EventAvailableIcon from '@mui/icons-material/EventAvailable'; 

export default function Sidebar({ mobileOpen, desktopOpen, handleDrawerToggle, setMobileOpen, drawerWidth }) {
  const location = useLocation();

  const menuItems = [
    { text: 'Panel', path: '/', icon: <DashboardIcon /> },
    { text: 'Ders Planla', path: '/ders-planla', icon: <EventAvailableIcon /> }, 
    { text: 'Ders Programı', path: '/schedule', icon: <CalendarMonthIcon /> },
    { text: 'Günlük Rapor', path: '/daily-report', icon: <TimelineOutlinedIcon /> },
  ];

  const aiTools = [
    { text: 'Hedef Netler', path: '/career', icon: <SchoolIcon /> },
    { text: 'Deneme Analizi', path: '/analysis', icon: <AssessmentOutlinedIcon /> },
    { text: 'Quiz Oluşturma', path: '/quiz', icon: <QuizOutlinedIcon /> },
    { text: 'Belge Özeti', path: '/summary', icon: <ArticleOutlinedIcon /> },
    { text: 'Psikolojik Destek', path: '/support', icon: <PsychologyOutlinedIcon /> },
  ];

  const renderList = (items) => (
    <List sx={{ px: 1 }}>
      {items.map((item) => {
        const selected = location.pathname === item.path;
        return (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link} 
              to={item.path}
              selected={selected}
              onClick={() => setMobileOpen(false)}
              sx={{ borderRadius: 2, '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.main' } } }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: selected ? 'inherit' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: selected ? 'bold' : 'medium' }} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar /> {/* Navbar boşluğu */}
      <Box sx={{ overflow: 'auto', flex: 1, py: 2 }}>
        {renderList(menuItems)}
        
        <Divider sx={{ my: 2, mx: 2 }} />
        
        <Typography variant="overline" sx={{ px: 3, color: 'text.secondary', fontWeight: 'bold' }}>
          Yapay Zeka Araçları
        </Typography>
        {renderList(aiTools)}
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: desktopOpen ? drawerWidth : 0 }, flexShrink: { sm: 0 }, transition: 'width 0.2s' }}>
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
        {drawerContent}
      </Drawer>
      <Drawer variant="persistent" open={desktopOpen} sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' } }}>
        {drawerContent}
      </Drawer>
    </Box>
  );
}