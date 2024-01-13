import React, { useState, useEffect } from 'react';
// import axios from "axios";
// import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { collection, query, getDocs, where } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faDownload, faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';

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
  const [correctingDocName, setCorrectingDocName] = useState(null);

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
    if (!selectedFile) {
      alert('No file selected');
      return;
    }

    if (userRole !== 'user_plus' && documents.length >= 3) {
      alert('Upload limit reached. Please Upgrade to user_plus for unlimited uploads.');
      return;
    }

    if (selectedFile && user) {
      const storage = getStorage();
      // Use the user's UID as the userID field
      const userID = user.uid;
      const fileRef = storageRef(storage, `user_files/${user.uid}/${selectedFile.name}`);

      try {
        const snapshot = await uploadBytes(fileRef, selectedFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const documentData = {
          name: selectedFile.name,
          url: downloadURL,
          createdAt: new Date(),
          status: 'active', // Include the status field here
          user_id: userID // Add the userID field

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
  // const [correctedFiles, setCorrectedFiles] = useState([]);


  useEffect(() => {

    // Listen to authentication state changes
    const unsubscribe = getAuth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch documents when user logs in
        fetchDocuments();
        // fetchCorrectedFiles();
      } else {
        // Handle user not logged in
        setDocuments([]);
        // setCorrectedFiles([]);
      }
    });



    // Function to fetch documents
    const fetchDocuments = async () => {
      if (user) {
        // const q = query(collection(firestore, `users/${user.uid}/documents`));
        const q = query(collection(firestore, `users/${user.uid}/documents`), where("status", "==", "active"));

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
    // fetchCorrectedFiles();
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, firestore]);



  const deleteFile = async (e, fileName) => {
    e.stopPropagation();
    if (!user) return;

    try {
      // Update the document status to "trashed" in Firestore
      const firestoreRef = doc(firestore, `users/${user.uid}/documents`, fileName);
      await setDoc(firestoreRef, { status: 'trashed' }, { merge: true });

      // Update local state to reflect the change
      setDocuments(documents.map(doc => doc.name === fileName ? { ...doc, status: 'trashed' } : doc));

      alert('File moved to Recycle Bin successfully');
    } catch (error) {
      console.error('Error moving file to trash:', error);
      alert('Error moving file to trash');
    }
  };


  const correctDocument = async (e, doc) => {
    e.stopPropagation();
    setCorrectingDocName(doc.name); // Start the correction process

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken(); // Retrieve Firebase token

      const response = await fetch('http://localhost:3000/correct_document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        },
        body: JSON.stringify({ documentUrl: doc.url }) // Send the document URL to the server
      });

      const responseData = await response.json();
      if (response.ok) {
        alert('Document corrected successfully!');
        // Update the document list or state here if necessary
      } else {
        alert(`Error: ${responseData.error}`);
      }
    } catch (error) {
      console.error('Correction request failed:', error);
      alert('Correction request failed');
    }

    setCorrectingDocName(null); // End the correction process
  };

  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const jwtToken = localStorage.getItem('jwtToken');
      if (!jwtToken) {
        // Handle the case where there is no token
        console.log('No JWT Token found');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserRole(data.role);  // Set the user email
        console.log("Fetched User Email:", data.role); // Verify the fetched email

      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error, maybe navigate to login
      }
    };

    fetchUserData();
  }, []);





  return (
    <div className='userDocumentBackGround'>


      <div className='userDocumentSection'>

        <div className='userDocumentCard'>
          <h3>Upload</h3>
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <button onClick={() => document.getElementById('file-upload').click()} className="upload-btn">
              <FontAwesomeIcon icon={faUpload} /> Choose File
            </button>
            {selectedFile && (
              <>
                <span>{selectedFile.name}</span>
                <button onClick={handleFileUpload} className="upload-btn">
                  <FontAwesomeIcon icon={faUpload} /> Upload File
                </button>
                <progress value={uploadProgress} max="100"></progress>
              </>
            )}
          </div>
        </div>

        {documents.map((doc, index) => (
          <div key={index} className='userDocumentCard' onClick={() => handleCardClick(doc)}>
            <h3>{doc.name}</h3>
            <p>Document description or content preview...</p>
            <button onClick={(e) => { e.stopPropagation(); window.open(doc.url, '_blank') }} className="download-btn">
              <FontAwesomeIcon icon={faDownload} /> Download
            </button>
            <button onClick={(e) => deleteFile(e, doc.name)} className="delete-btn">
              <FontAwesomeIcon icon={faTrashAlt} /> Move to Recycle Bin
            </button>
            <button onClick={(e) => correctDocument(e, doc)} className="edit-btn">
              <FontAwesomeIcon icon={faEdit} /> Correct Text
            </button>
            {correctingDocName === doc.name && <div>Correcting...</div>}
          </div>
        ))}
        {/* Display corrected files */}



      </div>
    </div>
  );
};

export default Document;