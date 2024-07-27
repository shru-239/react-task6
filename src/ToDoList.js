import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import Task from './Task';
import './App.css';

const ToDoList = () => {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: '' });
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    if (currentUser) {
      const q = query(collection(db, 'lists'), where('userId', '==', currentUser.uid));
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
    await addDoc(collection(db, 'lists'), { name: newListName, tasks: [], userId: currentUser.uid });
    setNewListName('');
  };

  const handleAddTask = async (listId) => {
    if (newTask.title.trim() === '') return;
    const listRef = doc(db, 'lists', listId);
    const updatedTasks = [...lists.find(list => list.id === listId).tasks, { ...newTask, id: Date.now() }];
    await updateDoc(listRef, { tasks: updatedTasks });
    setNewTask({ title: '', description: '', dueDate: '', priority: '' });
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceListId = source.droppableId.split('-')[0];
    const sourcePriority = source.droppableId.split('-')[1];
    const destListId = destination.droppableId.split('-')[0];
    const destPriority = destination.droppableId.split('-')[1];

    const sourceList = lists.find(list => list.id === sourceListId);
    const destList = lists.find(list => list.id === destListId);

    // Moving within the same list
    if (sourceListId === destListId) {
      const updatedTasks = Array.from(sourceList.tasks);
      const [movedTask] = updatedTasks.splice(source.index, 1);
      movedTask.priority = destPriority; // Update priority if changed
      updatedTasks.splice(destination.index, 0, movedTask);
      await updateDoc(doc(db, 'lists', sourceListId), { tasks: updatedTasks });
    } else {
      // Moving between different lists
      const sourceTasks = sourceList.tasks.filter(task => task.priority === sourcePriority);
      const destTasks = destList.tasks.filter(task => task.priority === destPriority);

      const [movedTask] = sourceTasks.splice(source.index, 1);
      movedTask.priority = destPriority; // Update priority in new list

      destTasks.splice(destination.index, 0, movedTask);

      const newSourceTasks = sourceList.tasks.map(task => {
        if (task.priority === sourcePriority) {
          return sourceTasks.shift() || task;
        }
        return task;
      });

      const newDestTasks = destList.tasks.map(task => {
        if (task.priority === destPriority) {
          return destTasks.shift() || task;
        }
        return task;
      });

      await updateDoc(doc(db, 'lists', sourceListId), { tasks: newSourceTasks });
      await updateDoc(doc(db, 'lists', destListId), { tasks: newDestTasks });
    }
  };

  return (
    <div className="container">
      <button className="logout-button" onClick={handleLogout}>Logout</button>
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
          <Droppable key={list.id} droppableId={`${list.id}-Low`} type="TASK">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="todo-list"
              >
                <h3>{list.name}</h3>
                <Task listId={list.id} />
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
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
};

export default ToDoList;
