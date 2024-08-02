import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import UsersGrid from './UsersGrid';
import TaskListsGrid from './TaskListsGrid';
import TasksGrid from './TasksGrid';


const AdminDashboard = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <nav>
        <ul>
          <li><Link to="/admin/users">Users</Link></li>
          <li><Link to="/admin/task-lists">Task Lists</Link></li>
          <li><Link to="/admin/tasks">Tasks</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/users" element={<UsersGrid />} />
        <Route path="/task-lists" element={<TaskListsGrid />} />
        <Route path="/tasks" element={<TasksGrid />} />
      </Routes>
    </div>
  );
};

export default AdminDashboard;
