import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './App.css';

const ToDoList = () => {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: '' });
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    if (currentUser) {
      const q = query(collection(db, 'toDoLists'), where('userId', '==', currentUser.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const listsData = [];
        snapshot.forEach((doc) => listsData.push({ ...doc.data(), id: doc.id }));
        setLists(listsData);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleAddList = async () => {
    if (newListName.trim() === '') return;
    await addDoc(collection(db, 'toDoLists'), {
      name: newListName,
      tasks: [],
      userId: currentUser.uid,
      userEmail: currentUser.email,
      creationTime: Timestamp.now(),
      lastUpdated: Timestamp.now()
    });
    setNewListName('');
  };

  const handleAddTask = async (listId) => {
    if (newTask.title.trim() === '' || newTask.priority.trim() === '') return;
    const listRef = doc(db, 'toDoLists', listId);
    const updatedTasks = [
      ...lists.find(list => list.id === listId).tasks,
      { ...newTask, id: Date.now().toString(), creationTime: Timestamp.now() }
    ];
    await updateDoc(listRef, {
      tasks: updatedTasks,
      lastUpdated: Timestamp.now()
    });
    setNewTask({ title: '', description: '', dueDate: '', priority: '' });
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceListId = source.droppableId.split('-')[0];
    const destListId = destination.droppableId.split('-')[0];
    const destPriority = destination.droppableId.split('-')[1];

    const sourceList = lists.find(list => list.id === sourceListId);
    const destList = lists.find(list => list.id === destListId);

    if (sourceListId === destListId) {
      const updatedTasks = Array.from(sourceList.tasks);
      const [movedTask] = updatedTasks.splice(source.index, 1);
      movedTask.priority = destPriority;
      updatedTasks.splice(destination.index, 0, movedTask);
      await updateDoc(doc(db, 'toDoLists', sourceListId), { tasks: updatedTasks, lastUpdated: Timestamp.now() });
    } else {
      const sourceTasks = Array.from(sourceList.tasks);
      const destTasks = Array.from(destList.tasks);

      const [movedTask] = sourceTasks.splice(source.index, 1);
      movedTask.priority = destPriority;
      destTasks.splice(destination.index, 0, movedTask);

      await updateDoc(doc(db, 'toDoLists', sourceListId), { tasks: sourceTasks, lastUpdated: Timestamp.now() });
      await updateDoc(doc(db, 'toDoLists', destListId), { tasks: destTasks, lastUpdated: Timestamp.now() });
    }
  };

  return (
    <div className="container">
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <Link to="/admin" className="admin-link">Admin Dashboard</Link>
      <h2>To Do Lists</h2>
      <div>
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name"
        />
        <button onClick={handleAddList}>Add List</button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        {lists.map(list => (
          <div key={list.id} className="todo-list">
            <h3>{list.name}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddTask(list.id);
            }}>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
              />
              <input
                type="text"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task description"
              />
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="">Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <button type="submit">Add Task</button>
            </form>
            {['Low', 'Medium', 'High'].map(priority => (
              <Droppable key={`${list.id}-${priority}`} droppableId={`${list.id}-${priority}`} type="TASK">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`priority-block ${priority.toLowerCase()}`}
                  >
                    <h4>{priority}</h4>
                    {list.tasks
                      .filter(task => task.priority === priority)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="task-card"
                            >
                              <h5>Task Title: {task.title}</h5>
                              <p>Description: {task.description}</p>
                              <p>Due Date: {task.dueDate}</p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};

export default ToDoList;
