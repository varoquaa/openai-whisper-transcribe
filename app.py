from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import openai
import tempfile

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm', 'flac', 'ogg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configure OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY', '')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """
    API endpoint to transcribe audio files using OpenAI Whisper API
    
    Accepts: multipart/form-data with 'audio' file
    Returns: JSON with transcription text
    """
    try:
        # Check if audio file is provided
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        file = request.files['audio']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Create temporary file
            filename = secure_filename(file.filename)
            temp_path = os.path.join(tempfile.gettempdir(), filename)
            file.save(temp_path)
            
            try:
                # Transcribe using OpenAI Whisper API
                with open(temp_path, 'rb') as audio_file:
                    response = openai.Audio.transcribe(
                        model="whisper-1",
                        file=audio_file
                    )
                    
                
                # Clean up temporary file
                os.remove(temp_path)
                
                return jsonify({
                    'transcription': response['text'],
                    'language': response.get('language', 'unknown'),
                    'duration': response.get('duration', 0)
                })
                
            except Exception as e:
                # Clean up temporary file on error
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                return jsonify({'error': str(e)}), 500
                
        else:
            return jsonify({'error': 'Invalid file format. Allowed formats: ' + ', '.join(ALLOWED_EXTENSIONS)}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'whisper-transcription'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
