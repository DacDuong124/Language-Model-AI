// Trash.js
import React, { useState, useEffect } from 'react';
// import axios from "axios";
// import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import { getStorage, ref as storageRef, deleteObject } from "firebase/storage";
import { doc, setDoc, getFirestore, deleteDoc } from "firebase/firestore";
import { collection, query, getDocs, where } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faTrashRestore } from '@fortawesome/free-solid-svg-icons';

import '../App.css'


const Trash = () => {
  // Initialize Firestore
  const firestore = getFirestore();

  //Create var for changing view
  const navigate = useNavigate();


  const handleCardClick = (doc) => {
    navigate('/viewDocument', { state: { document: doc } });
  };

  const [documents, setDocuments] = useState([]);
  // Add state for user
  const [user, setUser] = useState(null);


  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      if (currentUser) {
        setUser(currentUser);
        fetchDocuments(currentUser.uid); // Pass the UID directly to the fetch function
      } else {
        // Handle user not logged in
        setUser(null);
        setDocuments([]);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [firestore]); // Removed 'user' from the dependency array

  const fetchDocuments = async (uid) => {
    const q = query(collection(firestore, `users/${uid}/documents`), where("status", "==", "trashed"));
    try {
      const querySnapshot = await getDocs(q);
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() }); // Store the document ID as well
      });
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const restoreFile = async (e, fileName) => {
    e.stopPropagation();
    if (!user) return;

    try {
      // Update the document status to "active" in Firestore
      const firestoreRef = doc(firestore, `users/${user.uid}/documents`, fileName);
      await setDoc(firestoreRef, { status: 'active' }, { merge: true });

      // Update local state to reflect the change
      setDocuments(documents.map(doc => doc.name === fileName ? { ...doc, status: 'active' } : doc));

      alert('File restored successfully');
    } catch (error) {
      console.error('Error restoring file:', error);
      alert('Error restoring file');
    }
  };

  const deleteFile = async (e, fileName) => {
    e.stopPropagation();
    if (!user) return;

    try {
      // Delete from Firebase Storage
      const fileRef = storageRef(getStorage(), `user_files/${user.uid}/${fileName}`);
      await deleteObject(fileRef);

      // Delete the document from Firestore
      const firestoreRef = doc(firestore, `users/${user.uid}/documents`, fileName);
      await deleteDoc(firestoreRef);

      // Update local state to reflect deletion
      setDocuments(documents.filter(doc => doc.name !== fileName));

      alert('File and its record deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  return (

    <div className='userDocumentBackGround'>
      <div className='userDocumentSection'>
        {documents.length > 0 ? (
          documents.map(doc => (
            <div key={doc.id} className='userDocumentCard' onClick={() => handleCardClick(doc)}>
              <h3>{doc.name}</h3>
              <p>Document description or content preview...</p>
              <button onClick={(e) => restoreFile(e, doc.name)} className="edit-btn">
                <FontAwesomeIcon icon={faTrashRestore} /> Restore
              </button>
              <button onClick={(e) => deleteFile(e, doc.name)} className="delete-btn">
                <FontAwesomeIcon icon={faTrashAlt} /> Delete Permanantly
              </button>
            </div>
          ))
        ) : (
          <p className='empty-trash-message'>Recycle Bin is empty</p>
        )}
      </div>
    </div>
  );
};
export default Trash;