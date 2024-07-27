import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from './AuthContext';
import './App.css';

const Task = ({ listId }) => {
  const [tasks, setTasks] = useState({ Low: [], Medium: [], High: [] });
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, 'lists', listId, 'tasks'), where('uid', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const fetchedTasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const organizedTasks = { Low: [], Medium: [], High: [] };
      fetchedTasks.forEach((task) => {
        organizedTasks[task.priority].push(task);
      });
      setTasks(organizedTasks);
    };
    fetchData();
  }, [listId, currentUser]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const newTask = {
        title: taskTitle,
        description: taskDescription,
        dueDate: taskDueDate,
        priority: taskPriority,
        uid: currentUser.uid,
      };
      const docRef = await addDoc(collection(db, 'lists', listId, 'tasks'), newTask);
      setTasks({ ...tasks, [taskPriority]: [...tasks[taskPriority], { id: docRef.id, ...newTask }] });
      setTaskTitle('');
      setTaskDescription('');
      setTaskDueDate('');
      setTaskPriority('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleOnDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceListId = source.droppableId.split('-')[0];
    const sourcePriority = source.droppableId.split('-')[1];
    const destListId = destination.droppableId.split('-')[0];
    const destPriority = destination.droppableId.split('-')[1];

    const sourceListTasks = tasks[sourcePriority];
    const destListTasks = tasks[destPriority];

    if (sourceListId === destListId) {
      const updatedTasks = Array.from(sourceListTasks);
      const [movedTask] = updatedTasks.splice(source.index, 1);
      movedTask.priority = destPriority; // Update priority if changed
      updatedTasks.splice(destination.index, 0, movedTask);
      await updateDoc(doc(db, 'lists', listId, 'tasks', movedTask.id), { priority: destPriority });
      setTasks({ ...tasks, [sourcePriority]: updatedTasks });
    } else {
      const sourceTasks = sourceListTasks.filter(task => task.priority === sourcePriority);
      const destTasks = destListTasks.filter(task => task.priority === destPriority);

      const [movedTask] = sourceTasks.splice(source.index, 1);
      movedTask.priority = destPriority; // Update priority in new list

      destTasks.splice(destination.index, 0, movedTask);

      const sourceUpdatedTasks = sourceListTasks.map(task => {
        if (task.priority === sourcePriority) {
          return sourceTasks.shift() || task;
        }
        return task;
      });

      const destUpdatedTasks = destListTasks.map(task => {
        if (task.priority === destPriority) {
          return destTasks.shift() || task;
        }
        return task;
      });

      await updateDoc(doc(db, 'lists', listId, 'tasks', movedTask.id), { priority: destPriority });
      setTasks({ ...tasks, [sourcePriority]: sourceUpdatedTasks, [destPriority]: destUpdatedTasks });
    }
  };

  return (
    <div className="task-container">
      <form onSubmit={handleCreateTask}>
        <input
          type="text"
          placeholder="Task Title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Task Description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        />
        <input
          type="date"
          placeholder="Due Date"
          value={taskDueDate}
          onChange={(e) => setTaskDueDate(e.target.value)}
        />
        <select
          value={taskPriority}
          onChange={(e) => setTaskPriority(e.target.value)}
        >
          <option value="">Select Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit">Create Task</button>
      </form>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        {Object.keys(tasks).map((priority) => (
          <Droppable key={`${listId}-${priority}`} droppableId={`${listId}-${priority}`}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`priority-block ${priority.toLowerCase()}`}
              >
                <h4>{priority}</h4>
                {tasks[priority].map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="task-card"
                      >
                        <h5>{task.title}</h5>
                        <p>{task.description}</p>
                        <p>{task.dueDate}</p>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
};

export default Task;
