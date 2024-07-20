import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import Task from './Task';
import './App.css';

const ToDoList = () => {
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'lists'));
      setLists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'lists'), { name: listName });
      setListName('');
      const snapshot = await getDocs(collection(db, 'lists'));
      setLists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="todo-container">
      <h2>To-Do Lists</h2>
      <form onSubmit={handleCreateList} className="list-form">
        <input
          type="text"
          placeholder="List Name"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
        />
        <button type="submit">Create List</button>
      </form>
      <ul className="lists">
        {lists.map(list => (
          <li key={list.id}>
            <h3>{list.name}</h3>
            <Task listId={list.id} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ToDoList;
