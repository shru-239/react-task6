import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { DataGrid } from '@mui/x-data-grid';
import './App.css';

const TasksGrid = () => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const taskListsCollection = collection(db, 'toDoLists');
    const taskListsSnapshot = await getDocs(taskListsCollection);
    const tasksData = [];
    taskListsSnapshot.forEach((doc) => {
      const taskList = doc.data();
      taskList.tasks.forEach((task) => {
        tasksData.push({
          id: task.id,
          title: task.title,
          description: task.description,
          taskListTitle: taskList.name,
          createdBy: taskList.userEmail,
          creationTime: task.creationTime ? task.creationTime.toDate().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A'
        });
      });
    });
    setTasks(tasksData);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const columns = [
    { field: 'title', headerName: 'Task Title', width: 200 },
    { field: 'description', headerName: 'Task Description', width: 200 },
    { field: 'taskListTitle', headerName: 'Task List Title', width: 200 },
    { field: 'createdBy', headerName: 'Created By (email id)', width: 200 },
    { field: 'creationTime', headerName: 'Creation Time', width: 200 }
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={tasks} columns={columns} pageSize={5} />
    </div>
  );
};

export default TasksGrid;
