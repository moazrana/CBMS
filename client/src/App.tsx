import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/loginForm/LoginForm';
import RolesList from './views/roleManagement/list/RolesList';
import UserList from './views/users/list/userList';
import RoleManagement from './views/roleManagement/add/RoleManagement';
import { ThemeProvider } from './context/ThemeContext';
import './styles/themes.css';
import Dashboard from './views/dashboard/dashboard';
import AdminPageList from './views/compliance/adminPage/list';
import TeacherUploadFile from './views/compliance/teacherPage/uploadFile';
import Safeguarding from './views/safeguarding/index';
import NewSafeguarding from './views/safeguarding/new/new'
import Incidents from './views/incidents/index';
import NewIncident from './views/incidents/new/new'
import RouteGuard from './components/RouteGuard';
import { useSelector } from 'react-redux';
import { selectUser } from './store/slices/authSlice';
import Attendance from './views/attendance/index';
import TimeTable from './views/timeTable/index';
import StaffList from './views/staff/list';
import EditStaff from './views/staff/edit';
import StudentList from './views/students/list';
import NewStudent from './views/students/new';
import EditStudent from './views/students/edit';
import TestPage from './views/test';

function App() {
  const user = useSelector(selectUser);
  const role = user?.role;
  const complianceComponent = role === 'admin' ? <AdminPageList /> : <TeacherUploadFile/>;
  
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <RouteGuard>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/dashboard" element={<Dashboard/>}/>
              <Route path="/roles" element={<RolesList />} />
              <Route path="/roles/add" element={<RoleManagement />} />
              <Route path="/roles/edit/:id" element={<RoleManagement />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/compliance" element={complianceComponent} />
              <Route path="/safeguarding" element={<Safeguarding/>} />
              <Route path="/safeguarding/add" element={<NewSafeguarding/>} />
              <Route path="/safeguarding/safeguard/:id" element={<NewSafeguarding/>} />
              <Route path="/incidents" element={<Incidents/>} />
              <Route path="/incidents/add" element={<NewIncident/>} />
              <Route path="/incidents/incident/:id" element={<NewIncident/>} />
              <Route path="/attendance" element={<Attendance/>}/>
              <Route path="/time-table" element={<TimeTable/>}/>
              <Route path="/staff" element={<StaffList/>}/>
              <Route path="/staff/add" element={<EditStaff/>}/>
              <Route path="/staff/edit/:id" element={<EditStaff/>}/>
              <Route path="/students" element={<StudentList/>}/>
              <Route path="/students/add" element={<NewStudent/>}/>
              <Route path="/students/edit/:id" element={<EditStudent/>}/>
              <Route path="/test" element={<TestPage/>}/>
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </RouteGuard>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
