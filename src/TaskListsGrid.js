import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { DataGrid } from '@mui/x-data-grid';
import './App.css';

const TaskListsGrid = () => {
  const [taskLists, setTaskLists] = useState([]);

  const fetchTaskLists = async () => {
    const taskListsCollection = collection(db, 'toDoLists');
    const taskListsSnapshot = await getDocs(taskListsCollection);
    const taskListsData = taskListsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.name,
        createdBy: data.userEmail,
        tasks: data.tasks ? data.tasks.length : 0, // Ensure tasks is defined
        creationTime: data.creationTime ? data.creationTime.toDate().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A',
        lastUpdated: data.lastUpdated ? data.lastUpdated.toDate().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A'
      };
    });
    setTaskLists(taskListsData);
  };

  useEffect(() => {
    fetchTaskLists();
  }, []);

  const columns = [
    { field: 'title', headerName: 'Task List Title', width: 200 },
    { field: 'createdBy', headerName: 'Created By (email id)', width: 200 },
    { field: 'tasks', headerName: 'Number of Tasks', type: 'number', width: 150 },
    { field: 'creationTime', headerName: 'Creation Time', width: 200 },
    { field: 'lastUpdated', headerName: 'Last Updated', width: 200 }
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={taskLists} columns={columns} pageSize={5} />
    </div>
  );
};

export default TaskListsGrid;
