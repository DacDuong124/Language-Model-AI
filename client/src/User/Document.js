import React, { useState } from 'react';
// import axios from "axios";
// import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import '../App.css'


function Document() {

  // Initialize Firestore
  const firestore = getFirestore();
  // Get the currently logged-in user from Firebase Authentication
  const auth = getAuth();
  const user = auth.currentUser;
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);


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

  return (
    <div className='userDocumentBackGround'>


      <div className='userDocumentSection'>

        <div className='userDocumentCard'>
          <h3>Upload</h3>
          <p>Document description or content preview...</p>
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

        <div className='userDocumentCard'>
          <h3>Document Title1</h3>
          <p>Document description or content preview...</p>
        </div>
        <div className='userDocumentCard'>
          <h3>Document Title2</h3>
          <p>Document description or content preview...</p>
        </div>
        <div className='userDocumentCard'>
          <h3>Document Title3</h3>
          <p>Document description or content preview...</p>
        </div>

      </div>

    </div>

  );
};
export default Document;


