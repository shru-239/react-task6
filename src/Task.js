import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import { Draggable } from 'react-beautiful-dnd';
import './App.css';

const Task = ({ listId, priority }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const q = query(collection(db, 'lists', listId, 'tasks'), where('priority', '==', priority));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(fetchedTasks);
      });
      return () => unsubscribe();
    };
    fetchTasks();
  }, [listId, priority]);

  return (
    <>
      {tasks.map((task, index) => (
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
    </>
  );
};

export default Task;
