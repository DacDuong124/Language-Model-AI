import { useState, useEffect } from 'react';
// import axios from "axios";
// import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useLocation } from 'react-router-dom';

function ViewDocument() {
  const location = useLocation();
  const document = location.state?.document;
  const [inputPrompt, setInputPrompt] = useState({
    input: '',
  });
  const [generatedCodeList, setGeneratedCodeList] = useState([]);
  const [error, setError] = useState('');
  const [fileContent, setFileContent] = useState('');

  const handleGenerateCode = async () => {
    try {
      console.log('Requesting code generation with prompt:', inputPrompt.input);

      const response = await fetch("http://localhost:3000/generate_code", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompts: [inputPrompt.input] }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate code. Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.generated_code && result.generated_code.length > 0) {
        setGeneratedCodeList(result.generated_code);
      } else {
        setError("No generated code received from the server");
      }
    } catch (error) {
      console.error('Error generating code:', error.message);
      setError("An error occurred while generating code");
    }
  };
  useEffect(() => {
    if (document && document.url && document.name.endsWith('.txt')) {
      fetch(document.url)
        .then(response => response.text())
        .then(text => setFileContent(text))
        .catch(error => console.error('Error fetching text file:', error));
    }
  }, [document]);

  const handleInputChange = (e) => {
    setInputPrompt({ input: e.target.value });
  };

  return (
    <div>

      {/* <label>
        <h1>Enter Prompt:</h1>
        <Box
          sx={{
            width: 500,
            maxWidth: '100%',
          }}
        >
          <h3>Enter a sentence you want to correct</h3>
          <textarea style={{ fontSize: '15px' }}
            cols="80"
            rows="10"
            type="text"

            value={inputPrompt.input}
            onChange={handleInputChange}
          />
        </Box>
      </label>
      <button onClick={handleGenerateCode}>Generate Code</button>

      {error && <div>Error: {error}</div>}

      {generatedCodeList.length > 0 && (
        <div>
          <h3>AI's answer:</h3>
          {generatedCodeList.map((code, index) => (

            <pre style={{ fontSize: '18px' }} key={index}>{code}</pre>
          ))}
        </div>
      )} */}
      <div>
        <h2>Document Content</h2>
        <pre>{fileContent}</pre>
      </div>
      <div>
      <div>
      {document && document.name.endsWith('.docx') && (
        <iframe 
          src={`https://docs.google.com/gview?url=${encodeURIComponent(document.url)}&embedded=true`} 
          style={{ width: "100%", height: "1000px", border: "none" }} // CSS styling here
          title="Document Viewer"
        ></iframe>
      )}
    </div>
</div>

    </div>

  );
};
export default ViewDocument;
