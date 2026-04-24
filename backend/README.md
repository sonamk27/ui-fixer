# UI Fixer Backend API

A comprehensive backend API for the UI Fixer application that provides AI-powered UI improvement suggestions. Built with Node.js, Express.js, and MongoDB.

## 🚀 Features

- **Image Upload**: Secure file upload with validation using Multer
- **AI Analysis**: Integration with OpenAI Vision API for intelligent UI analysis
- **Simulation Mode**: Realistic UI improvement suggestions without AI dependency
- **MVC Architecture**: Clean, scalable code structure
- **MongoDB Integration**: Persistent storage for uploads and results
- **Error Handling**: Comprehensive error handling and validation
- **Security**: CORS, rate limiting, and security headers
- **File Management**: Automatic cleanup and organization

## 📋 Requirements

- Node.js 16.0.0 or higher
- MongoDB 4.4 or higher (optional, can run without)
- npm or yarn

## 🛠️ Installation

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# AI API Configuration (Optional)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-vision-preview

# MongoDB Configuration (Optional)
MONGODB_URI=mongodb://localhost:27017/ui-fixer
MONGODB_DB_NAME=ui-fixer

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. MongoDB Setup (Optional)

If you want to use MongoDB for persistent storage:

```bash
# Start MongoDB (if using local installation)
mongod

# Or create a free MongoDB Atlas cluster and update MONGODB_URI in .env
```

## 🚀 Running the Server

### Development Mode

```bash
npm run dev
```

The server will start with hot-reload using nodemon.

### Production Mode

```bash
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── uploadController.js
│   │   ├── analysisController.js
│   │   └── resultsController.js
│   ├── middleware/           # Custom middleware
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   └── validation.js
│   ├── models/              # MongoDB schemas
│   │   ├── ImageUpload.js
│   │   └── AnalysisResult.js
│   ├── routes/              # API routes
│   │   ├── upload.js
│   │   ├── analysis.js
│   │   └── results.js
│   ├── services/            # Business logic
│   │   ├── analysisService.js
│   │   └── databaseService.js
│   ├── utils/               # Utility functions
│   │   └── database.js
│   └── server.js            # Express server setup
├── uploads/                 # Uploaded files
│   ├── metadata/           # Upload metadata
│   └── analysis/           # Analysis results
├── .env.example            # Environment template
├── .gitignore              # Git ignore file
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🔗 API Endpoints

### Upload Image

**POST** `/api/upload`

Upload an image for analysis.

**Request:**
- `multipart/form-data` with an `image` field

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "image.jpg",
    "originalName": "screenshot.png",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "publicUrl": "/uploads/uuid.jpg",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Image uploaded successfully"
}
```

### Analyze Image

**POST** `/api/analyze`

Analyze an uploaded image for UI improvements.

**Request:**
```json
{
  "imageId": "uuid",
  "analysisType": "basic|detailed|comprehensive"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "uuid",
    "imageId": "uuid",
    "analysisType": "basic",
    "status": "completed",
    "analyzedAt": "2024-01-01T00:00:00.000Z",
    "processingTime": 2500,
    "confidence": 85,
    "suggestions": {
      "colorImprovements": [...],
      "spacingIssues": [...],
      "typographyFixes": [...],
      "layoutProblems": [...],
      "uxSuggestions": [...]
    },
    "metadata": {
      "filename": "image.jpg",
      "analysisMethod": "ai|simulation"
    }
  }
}
```

### Get Results

**GET** `/api/results/:id`

Retrieve analysis results by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "uuid",
    "imageId": "uuid",
    "analysisType": "basic",
    "status": "completed",
    "analyzedAt": "2024-01-01T00:00:00.000Z",
    "processingTime": 2500,
    "confidence": 85,
    "suggestions": {...},
    "metadata": {...}
  }
}
```

### Health Check

**GET** `/health`

Check server health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

## 🤖 AI Integration

### OpenAI Vision API

To enable real AI analysis:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
2. Add it to your `.env` file:
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   OPENAI_MODEL=gpt-4-vision-preview
   ```

3. The system will automatically use AI analysis when the API key is configured

### Analysis Types

- **Basic**: 3-5 key improvements (color, spacing, typography)
- **Detailed**: Comprehensive analysis with specific suggestions
- **Comprehensive**: Full UX audit including accessibility and responsive design

## 🛡️ Security Features

- **CORS Protection**: Configured for your frontend domain
- **Rate Limiting**: Prevents API abuse
- **File Validation**: Only allows image files (JPEG, PNG, WebP, GIF)
- **Size Limits**: Configurable file size restrictions
- **Security Headers**: Helmet.js for additional protection
- **Input Validation**: Joi schema validation for all inputs

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `FRONTEND_URL` | Allowed CORS origin | http://localhost:3000 |
| `MAX_FILE_SIZE` | Max file size in bytes | 10485760 (10MB) |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/ui-fixer |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

### File Storage

- **Local Storage**: Files are stored in `/uploads` directory
- **Metadata**: Upload metadata in `/uploads/metadata`
- **Results**: Analysis results in `/uploads/analysis`
- **Cleanup**: Implement automated cleanup for old files

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "stack": "Stack trace (development only)"
  }
}
```

### Common Error Codes

- `NO_FILE`: No file uploaded
- `FILE_TOO_LARGE`: File exceeds size limit
- `INVALID_FILE_TYPE`: Unsupported file type
- `VALIDATION_ERROR`: Input validation failed
- `RESULTS_NOT_FOUND`: Analysis results not found
- `INTERNAL_ERROR`: Server error

## 🔄 Integration with Frontend

Update your frontend to use these API endpoints:

```javascript
// Upload image
const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

// Analyze image
const analysisResponse = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageId: 'uuid',
    analysisType: 'basic'
  })
});

// Get results
const resultsResponse = await fetch(`/api/results/${analysisId}`);
```

## 🚀 Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure all environment variables
3. Ensure MongoDB is accessible
4. Set up proper file storage (consider cloud storage for production)

### PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name "ui-fixer-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**: Ensure MongoDB is running and URI is correct
2. **File Upload Error**: Check file permissions and disk space
3. **CORS Error**: Verify FRONTEND_URL matches your frontend domain
4. **AI Analysis Fails**: Check OpenAI API key and model availability

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and logging.

## 📊 Monitoring

- Use `/health` endpoint for health checks
- Monitor MongoDB connection status
- Track file storage usage
- Monitor API response times and error rates
