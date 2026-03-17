import { useState } from 'react'
import LandingPage from './components/LandingPage'
import NewReport from './components/NewReport'
import TrackReport from './components/TrackReport'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import { type User } from './utils/reportsStore'
import './index.css'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const renderPage = () => {
    // Determine where to send a logged-in user if they try to access login
    const handleLoginSuccess = (user: User) => {
      setCurrentUser(user);
      if (user.role === 'admin') {
        setCurrentPage('admin-dashboard');
      } else {
        setCurrentPage('landing');
      }
    };

    switch (currentPage) {
      case 'landing':
        return <LandingPage 
          onNavigate={(page) => {
            // If they want to track and are logged in, send them to their dashboard
            if (page === 'track-report' && currentUser) {
              setCurrentPage('user-dashboard');
            } else {
              setCurrentPage(page);
            }
          }} 
          user={currentUser} 
          onLogout={() => {
            setCurrentUser(null);
            setCurrentPage('landing');
          }}
        />
      
      case 'new-report':
        return <NewReport 
          onBack={() => setCurrentPage('landing')} 
          userId={currentUser?.id} 
        />
      
      case 'track-report':
        return <TrackReport 
          key={currentUser?.id || 'track'}
          onBack={() => setCurrentPage('landing')} 
          user={currentUser}
          onNavigate={setCurrentPage}
          onLogout={() => {
            setCurrentUser(null);
            setCurrentPage('landing');
          }}
        />

      case 'user-dashboard':
        return <TrackReport 
          key={currentUser?.id || 'dashboard'}
          onBack={() => setCurrentPage('landing')} 
          user={currentUser}
          onNavigate={setCurrentPage}
          onLogout={() => {
            setCurrentUser(null);
            setCurrentPage('landing');
          }}
        />
      
      case 'login':
        return <Login 
          onLogin={handleLoginSuccess}
          onBack={() => setCurrentPage('landing')} 
        />
      
      case 'admin-dashboard':
        if (currentUser?.role !== 'admin') {
          setCurrentPage('login');
          return null;
        }
        return <AdminDashboard onLogout={() => {
          setCurrentUser(null);
          setCurrentPage('landing');
        }} />
      
      default:
        return <LandingPage onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen selection:bg-primary selection:text-white">
      {renderPage()}
    </div>
  )
}

export default App
