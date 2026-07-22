import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AppProvider, useAppContext } from './context/AppContext';

// Pages
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import ConversationsPage from './pages/ConversationsPage';
import LeadsPage from './pages/LeadsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LandingPage from './pages/LandingPage';


// Components
import Sidebar from './components/Common/Sidebar';
import Header from './components/Common/Header';

// Services
import websocketService from './services/websocket';

// Styles
import './styles/global.css';

const AppContent = () => {
  const { user, loading } = useAppContext();

  useEffect(() => {
    if (user) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          websocketService.connect(token);
          
          websocketService.on('notification', (data) => {
            toast.success(data.message || 'New notification!');
          });

          websocketService.on('message-received', (data) => {
            toast.info(`New message received`, { duration: 3000 });
          });

          websocketService.on('new-lead', (data) => {
            toast.success(`🎉 New lead: ${data.name || 'Unknown'}`, { duration: 5000 });
          });

          websocketService.on('conversation-escalated', (data) => {
            toast.warning(`⚠️ Conversation escalated: ${data.reason || 'Complex issue'}`);
          });

          websocketService.on('error', (data) => {
            console.error('WebSocket error:', data);
            toast.error(data.message || 'WebSocket connection error');
          });

          websocketService.on('connected', () => {
            console.log('✅ WebSocket connected');
          });

          websocketService.on('disconnected', () => {
            console.log('🔌 WebSocket disconnected');
            toast.error('WebSocket disconnected. Reconnecting...');
          });

          // Email notification listener
          websocketService.on('email-received', (data) => {
            toast.info(`📧 New email from ${data.sender || 'Unknown'}`, { duration: 3000 });
          });

          websocketService.on('email-replied', (data) => {
            toast.success(`📧 Email reply sent to ${data.recipient || 'customer'}`, { duration: 3000 });
          });
        }
      } catch (error) {
        console.error('WebSocket setup error:', error);
      }
    }

    return () => {
      try {
        websocketService.disconnect();
        websocketService.removeAllListeners();
      } catch (error) {
        console.error('WebSocket cleanup error:', error);
      }
    };
  }, [user]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
          warning: {
            duration: 4000,
            iconTheme: {
              primary: '#F59E0B',
              secondary: '#fff',
            },
          },
        }}
      />
      {user ? (
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <Header />
            <div className="page-content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/conversations" element={<ConversationsPage />} />
                <Route path="/leads" element={<LeadsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/login" element={<Navigate to="/dashboard" />} />
                <Route path="/signup" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;









// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster, toast } from 'react-hot-toast';
// import { AppProvider, useAppContext } from './context/AppContext';

// // Pages
// import DashboardPage from './pages/DashboardPage';
// import DocumentsPage from './pages/DocumentsPage';
// import ConversationsPage from './pages/ConversationsPage';
// import LeadsPage from './pages/LeadsPage';
// import SettingsPage from './pages/SettingsPage';
// import LoginPage from './pages/LoginPage';
// import SignupPage from './pages/SignupPage';  // Add this import

// // Components
// import Sidebar from './components/Common/Sidebar';
// import Header from './components/Common/Header';

// // Services
// import websocketService from './services/websocket';

// // Styles
// import './styles/global.css';

// const AppContent = () => {
//   const { user, loading } = useAppContext();

//   useEffect(() => {
//     if (user) {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           websocketService.connect(token);
          
//           websocketService.on('notification', (data) => {
//             toast.success(data.message || 'New notification!');
//           });

//           websocketService.on('message-received', (data) => {
//             toast.info(`New message received`, { duration: 3000 });
//           });

//           websocketService.on('new-lead', (data) => {
//             toast.success(`🎉 New lead: ${data.name || 'Unknown'}`, { duration: 5000 });
//           });

//           websocketService.on('conversation-escalated', (data) => {
//             toast.warning(`⚠️ Conversation escalated: ${data.reason || 'Complex issue'}`);
//           });

//           websocketService.on('error', (data) => {
//             console.error('WebSocket error:', data);
//             toast.error(data.message || 'WebSocket connection error');
//           });

//           websocketService.on('connected', () => {
//             console.log('✅ WebSocket connected');
//           });

//           websocketService.on('disconnected', () => {
//             console.log('🔌 WebSocket disconnected');
//             toast.error('WebSocket disconnected. Reconnecting...');
//           });
//         }
//       } catch (error) {
//         console.error('WebSocket setup error:', error);
//       }
//     }
    

//     return () => {
//       try {
//         websocketService.disconnect();
//         websocketService.removeAllListeners();
//       } catch (error) {
//         console.error('WebSocket cleanup error:', error);
//       }
//     };
//   }, [user]);

//   if (loading) {
//     return (
//       <div className="loading-screen">
//         <div className="loader">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <Router>
//       <div className="app">
//         <Toaster 
//           position="top-right"
//           toastOptions={{
//             duration: 4000,
//             style: {
//               background: '#363636',
//               color: '#fff',
//             },
//             success: {
//               duration: 3000,
//               iconTheme: {
//                 primary: '#4CAF50',
//                 secondary: '#fff',
//               },
//             },
//             error: {
//               duration: 4000,
//               iconTheme: {
//                 primary: '#EF4444',
//                 secondary: '#fff',
//               },
//             },
//             warning: {
//               duration: 4000,
//               iconTheme: {
//                 primary: '#F59E0B',
//                 secondary: '#fff',
//               },
//             },
//           }}
//         />
//         {user ? (
//           <div className="app-layout">
//             <Sidebar />
//             <div className="main-content">
//               <Header />
//               <div className="page-content">
//                 <Routes>
//                   <Route path="/" element={<Navigate to="/dashboard" />} />
//                   <Route path="/dashboard" element={<DashboardPage />} />
//                   <Route path="/documents" element={<DocumentsPage />} />
//                   <Route path="/conversations" element={<ConversationsPage />} />
//                   <Route path="/leads" element={<LeadsPage />} />
//                   <Route path="/settings" element={<SettingsPage />} />
//                   <Route path="/login" element={<Navigate to="/dashboard" />} />
//                   <Route path="/signup" element={<Navigate to="/dashboard" />} />
//                 </Routes>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <Routes>
//             <Route path="/login" element={<LoginPage />} />
//             <Route path="/signup" element={<SignupPage />} />
//             <Route path="*" element={<Navigate to="/login" />} />
//           </Routes>
//         )}
//       </div>
//     </Router>
//   );
// };

// function App() {
//   return (
//     <AppProvider>
//       <AppContent>
//         <Routes>
//           <Route path="/signup" element={<SignupPage />} />
//         </Routes>
//       </AppContent>
//     </AppProvider>
//   );
// }

// export default App;