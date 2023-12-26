import { useState } from 'react';
// import axios from "axios";
// import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import '../App.css'

function Document() {
  const [inputPrompt, setInputPrompt] = useState({
    input: '',
  });
  const [generatedCodeList, setGeneratedCodeList] = useState([]);
  const [error, setError] = useState('');

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

  const handleInputChange = (e) => {
    setInputPrompt({ input: e.target.value });
  };

  return (
    <div className='userDocumentBackGround'>

      <div >
        <label>
          <h1>Enter Prompt:</h1>
          {/* <input
          style={{ width: `${inputPrompt.input.length * 8}px` }}

          type="text"
          value={inputPrompt.input}
          onChange={handleInputChange}
        /> */}
          <Box
            sx={{
              width: 500,
              maxWidth: '100%',
            }}
          >
            <h3>What do want the AI to do ?</h3>
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
        )}
      </div>

      <div className='userDocumentSection'>

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


