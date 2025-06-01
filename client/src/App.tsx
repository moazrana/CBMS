import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/loginForm/LoginForm';
import RolesList from './views/roleManagement/list/RolesList';
import UserList from './views/users/list/userList';
import RoleManagement from './views/roleManagement/add/RoleManagement';
import { ThemeProvider } from './context/ThemeContext';
import './styles/themes.css';
import Dashboard from './views/dashboard/dashboard';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/roles" element={<RolesList />} />
            <Route path="/roles/add" element={<RoleManagement />} />
            <Route path="/roles/edit/:id" element={<RoleManagement />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
