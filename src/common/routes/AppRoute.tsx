import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../../pages/login/Login';
import Home from '../../pages/home/Home';
import User from '../../pages/user/User';
import ProtectedRoute from './ProtectedRout';
import MainLayout from '../components/MainLayout';
import Customer from '../../pages/customer/Customer';
import Project from '../../pages/project/Project';
import ProjectRequest from '../../pages/project/ProjectRequest';
import Setting from '../../pages/system/Setting';
import EmailConfig from '../../pages/system/EmailConfig';
import UserProfile from '../../pages/user/UserProfile';

const AppRoute = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={
        <Login />
        } />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout  />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<Home />} />
        <Route path="user" element={<User />} />
        <Route path = "user-profile/:uId" element= {<UserProfile/>}/>
        <Route path= "customers" element = {<Customer/>}></Route>
        <Route path='customers-projects' element= {<Project/>}/>
        <Route path='customers-projects-request' element= {<ProjectRequest/>}/>
        <Route path='system-email' element= {<EmailConfig/>}/>
        <Route path='system-setting' element= {<Setting/>}/>
        {/* Thêm các route con khác tại đây */}
        <Route index element={<Home />} />
      </Route>
      {/* Redirect không tìm thấy */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoute;