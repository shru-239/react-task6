import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { DataGrid } from '@mui/x-data-grid';
import './App.css';

const UsersGrid = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  const columns = [
    { field: 'email', headerName: 'Email ID', width: 200 },
    { field: 'password', headerName: 'Password', width: 200 },
    { field: 'signupTime', headerName: 'Signup Time', width: 200 },
    { field: 'ip', headerName: 'IP Address', width: 200 },
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={users} columns={columns} pageSize={5} />
    </div>
  );
};

export default UsersGrid;
