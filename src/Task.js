import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css';

const Task = ({ listId }) => {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, `lists/${listId}/tasks`));
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, [listId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, `lists/${listId}/tasks`), {
        title: taskTitle,
        description: taskDescription,
        dueDate: taskDueDate,
        priority: taskPriority,
      });
      setTaskTitle('');
      setTaskDescription('');
      setTaskDueDate('');
      setTaskPriority('');
      const snapshot = await getDocs(collection(db, `lists/${listId}/tasks`));
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTasks(items);

    const batch = db.batch();
    items.forEach((task, index) => {
      const taskRef = doc(db, `lists/${listId}/tasks`, task.id);
      batch.update(taskRef, { order: index });
    });
    await batch.commit();
  };

  return (
    <div className="task-container">
      <h2>Tasks</h2>
      <form onSubmit={handleCreateTask} className="task-form">
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
        <Droppable droppableId="tasks">
        {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef} className="task-list">
              {tasks.map(({ id, title, description, dueDate, priority }, index) => (
                <Draggable key={id} draggableId={id} index={index}>
                  {(provided) => (
                    <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="task-item">
                      <h4>{title}</h4>
                      <p>{description}</p>
                      <p>Due Date: {dueDate}</p>
                      <p>Priority: {priority}</p>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Task;
