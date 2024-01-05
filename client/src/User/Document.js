import React, { useState, useEffect } from 'react';
// import axios from "axios";
// import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject  } from "firebase/storage";
import { doc, setDoc, getFirestore, deleteDoc } from "firebase/firestore";
import { collection, query, getDocs } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

import '../App.css'


function Document() {

  // Initialize Firestore
  const firestore = getFirestore();
  // Get the currently logged-in user from Firebase Authentication
  // const auth = getAuth();
  // const user = auth.currentUser;
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  //Create var for changing view
  const navigate = useNavigate();

  const handleCardClick = (doc) => {
    navigate('/viewDocument', { state: { document: doc } });
  };  


  const handleFileChange = (event) => {
    // Get the file from the input
    const file = event.target.files[0];
    if (file) {
      // Set the state to the selected file
      setSelectedFile(file);
      // You can also perform file upload here or in a separate function
    }
  };

  const handleFileUpload = async () => {
    if (selectedFile && user) {
      const storage = getStorage();
      const fileRef = storageRef(storage, `user_files/${user.uid}/${selectedFile.name}`);

      try {
        const snapshot = await uploadBytes(fileRef, selectedFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const documentData = {
          name: selectedFile.name,
          url: downloadURL,
          createdAt: new Date()
        };

        await setDoc(doc(firestore, `users/${user.uid}/documents`, selectedFile.name), documentData);

        alert('File uploaded successfully!');
        setUploadProgress(100);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed!');
      }
    } else {
      alert('No file selected or user not logged in');
    }
  };

  const [documents, setDocuments] = useState([]);
  // Add state for user
  const [user, setUser] = useState(null);

  
  useEffect(() => {

    // Listen to authentication state changes
    const unsubscribe = getAuth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch documents when user logs in
        fetchDocuments();
      } else {
        // Handle user not logged in
        setDocuments([]);
      }
    });



    // Function to fetch documents
    const fetchDocuments = async () => {
      if (user) {
        const q = query(collection(firestore, `users/${user.uid}/documents`));
        try {
          const querySnapshot = await getDocs(q);
          const docs = [];
          querySnapshot.forEach((doc) => {
            docs.push(doc.data());
          });
          setDocuments(docs);
        } catch (error) {
          console.error('Error fetching documents:', error);
        }
      }
    };

    // Use useEffect to fetch documents when the component mounts or user changes
    fetchDocuments();
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, firestore]);

  const deleteFile = async (fileName) => {
    if (!user) return;
  
    try {
      // Delete from Firebase Storage
      const fileRef = storageRef(getStorage(), `user_files/${user.uid}/${fileName}`);
      await deleteObject(fileRef);
  
      // Delete the document from Firestore
      await deleteDoc(doc(firestore, `users/${user.uid}/documents`, fileName));
  
      // Update local state to reflect deletion
      setDocuments(documents.filter(doc => doc.name !== fileName));
  
      alert('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  return (
    <div className='userDocumentBackGround'>


      <div className='userDocumentSection'>

        <div className='userDocumentCard'>
          <h3>Upload</h3>
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }} // Hide the default input
              id="file-upload" // Refer to this id when triggering click event
            />
            <button
              onClick={() => document.getElementById('file-upload').click()} // Trigger file input click on button click
            >
              Choose File
            </button>
            {selectedFile && (
              <>
                <span>{selectedFile.name}</span>
                <button onClick={handleFileUpload}>Upload File</button>
                <progress value={uploadProgress} max="100"></progress>
              </>
            )}
          </div>
        </div>

        {documents.map((doc, index) => (
          <div key={index} className='userDocumentCard' onClick={() => handleCardClick(doc)}>
            <h3>{doc.name}</h3>
            <p>Document description or content preview...</p>
            <a href={doc.url} target="_blank" rel="noopener noreferrer">Download</a>
            
            <button onClick={() => deleteFile(doc.name)}>Delete</button>

            {/* You can also add a link to download or view the document */}
          </div>
        ))}


      </div>

    </div>

  );
};
export default Document;


