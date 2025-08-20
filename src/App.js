import React, { useState } from 'react';
import {
  Typography,
  Container,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Paper,
  TextField,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [transcription, setTranscription] = useState(''); // NEW


  const handleFileChange = (event) => {
    window.alert("uploading")
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('');
      setUploadProgress(0);
    }
  };

// ...existing code...
const handleUpload = async () => {
  if (!selectedFile) return;
  setUploadStatus('Uploading...');
  setUploadProgress(30); // Simulate some progress

  const formData = new FormData();
  formData.append('audio', selectedFile);

  try {
    const response = await fetch('http://localhost:6372/transcribe', {
      method: 'POST',
      body: formData,
    });
    
  const  responseText = await response.json();
  setTranscription(responseText.transcription); // Store transcription

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    setUploadProgress(100);
    setUploadStatus('Upload complete! ');
    // Optionally handle response data here
    // const data = await response.json();
    // console.log(data);
  } catch (error) {
    setUploadStatus('Upload failed!');
  }
};

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          File Upload with MUI
        </Typography>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Upload Your File
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="raised-button-file">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mr: 2 }}
                >
                  Choose File
                </Button>
              </label>
              
              {selectedFile && (
                <Button
                  variant="outlined"
                  onClick={handleUpload}
                  disabled={uploadStatus === 'Uploading...'}
                >
                  Upload File
                </Button>
              )}
            </Box>

            {selectedFile && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="body1">
                  <strong>Selected file:</strong> {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Size: {(selectedFile.size / 1024).toFixed(2)} KB
                </Typography>
              </Paper>
            )}

            {uploadStatus && (
              <Box sx={{ mt: 2 }}>

                        {transcription && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transcription Response
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {transcription}
              </Typography>
            </CardContent>
          </Card>
        )}

                {uploadStatus === 'Uploading...' && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      {uploadStatus}
                    </Typography>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </Box>
                )}
                {uploadStatus === 'Upload complete!' && (
                  <Alert severity="success">{uploadStatus}</Alert>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Instructions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              1. Click "Choose File" to select a file from your device
              <br />
              2. Click "Upload File" to start the upload process
              <br />
              3. Watch the progress bar as your file uploads
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default App;
