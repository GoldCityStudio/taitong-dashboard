import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PassManagementPage from './pages/PassManagementPage';
import SouvenirManagementPage from './pages/SouvenirManagementPage';
import EcoForumManagementPage from './pages/EcoForumManagementPage';
import BannerManagementPage from './pages/BannerManagementPage';
import DiscoveryPage from './pages/DiscoveryPage';
import QRCodePage from './pages/QRCodePage';
import TicketsPage from './pages/TicketsPage';
import LostFoundPage from './pages/LostFoundPage';
import MapPage from './pages/MapPage';
import GalleryPage from './pages/GalleryPage';
import NewsPage from './pages/NewsPage';
import EventsPage from './pages/EventsPage';
import AttractionsPage from './pages/AttractionsPage';
import VisitorManagementPage from './pages/VisitorManagementPage';
import NotificationManagementPage from './pages/NotificationManagementPage';
import ParkHighlightsManagementPage from './pages/ParkHighlightsManagementPage';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50',
    },
    secondary: {
      main: '#ff9800',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="app">
          <Sidebar />
          <main className="main-content">
            <div className="page-container">
              <Routes>
                <Route path="/pass-management" element={<PassManagementPage />} />
                <Route path="/souvenir-management" element={<SouvenirManagementPage />} />
                <Route path="/ecoforum-management" element={<EcoForumManagementPage />} />
                <Route path="/banner-management" element={<BannerManagementPage />} />
                <Route path="/park-highlights" element={<ParkHighlightsManagementPage />} />
                <Route path="/discovery" element={<DiscoveryPage />} />
                <Route path="/qrcode" element={<QRCodePage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/lostfound" element={<LostFoundPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/attractions" element={<AttractionsPage />} />
                <Route path="/visitor-management" element={<VisitorManagementPage />} />
                <Route path="/notification-management" element={<NotificationManagementPage />} />
                <Route path="*" element={<Navigate to="/pass-management" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 