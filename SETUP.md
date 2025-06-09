# 🚀 Setup Guide - Multimodal Video Analysis Tool

This guide will help you get the project up and running on your local machine for development and testing purposes.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- A **Google AI API key** (Gemini)

### Checking Your Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

## 🔑 Getting Your Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key (you'll need this for the setup)

## 📥 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/multimodal-video-analysis.git
cd multimodal-video-analysis
```

### 2. Navigate to the Application Directory

```bash
cd video_analysis
```

### 3. Install Dependencies

```bash
npm install
```

This will install all the required packages:

- React 19.1.0
- Vite 6.3.5
- Google Generative AI SDK
- React Bootstrap
- React Markdown

### 4. Environment Variables Setup

Create a `.env` file in the `video_analysis` directory:

```bash
# Create .env file
touch .env
```

Add the following content to your `.env` file:

```env
# Required: Google AI API Key
VITE_GOOGLE_AI_API_KEY=your_actual_api_key_here

# Optional: Application Title
VITE_APP_TITLE=Multimodal Video Analysis Tool

# Optional: Custom API Base URL
# VITE_API_BASE_URL=https://api.example.com
```

**Important**: Replace `your_actual_api_key_here` with your real Google AI API key.

**⚠️ Security Note for Production**: When deploying to production (Vercel, Netlify, etc.), you should use server-side environment variables without the `VITE_` prefix to prevent API key exposure. See the Deployment section below for secure production setup.

### 5. Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`

## 🎯 Verification Steps

### 1. Test the Application

1. Open your browser to `http://localhost:5173`
2. You should see the Multimodal Video Analysis interface
3. Try entering a YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
4. The video should embed and timestamps should generate

### 2. Test Chat Functionality

1. After loading a video, try asking: "What is this video about?"
2. You should receive an AI-generated response
3. Click on any timestamp in the response to test navigation

### 3. Check Console for Errors

- Open browser developer tools (F12)
- Look for any error messages in the console
- Common issues are usually related to API key configuration

## 🐛 Troubleshooting Common Issues

### API Key Issues

**Problem**: "API key not found" or authentication errors
**Solution**:

```bash
# Check if .env file exists
ls -la | grep .env

# Verify .env content (without exposing the key)
head -1 .env | grep "VITE_GOOGLE_AI_API_KEY"
```

### Dependency Issues

**Problem**: npm install fails or packages not found
**Solution**:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use

**Problem**: Port 5173 is already in use
**Solution**:

```bash
# Kill process using port 5173
npx kill-port 5173

# Or start on different port
npm run dev -- --port 5174
```

### Video Loading Issues

**Problem**: YouTube videos not loading
**Possible Causes**:

- Invalid YouTube URL format
- Video is private or restricted
- Network connectivity issues

**Solution**: Try with a known public YouTube video URL

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Check for lint issues without fixing
npm run lint -- --report-unused-disable-directives
```

## 📁 Project Structure Overview

```
video_analysis/
├── src/
│   ├── components/          # React components
│   │   ├── VideoPlayer/     # Video display and controls
│   │   ├── ChatInterface/   # Chat UI components
│   │   ├── TimestampList/   # Timestamp display
│   │   └── URLInput/        # URL input form
│   ├── utils/              # Helper functions
│   │   ├── videoUtils.js   # YouTube URL handling
│   │   ├── timestampUtils.js # Time formatting
│   │   └── aiService.js    # Google AI integration
│   ├── App.jsx            # Main application
│   └── main.jsx           # Entry point
├── public/                # Static files
├── .env                   # Environment variables (you create this)
├── package.json          # Dependencies
└── vite.config.js        # Build configuration
```

## 🌐 Supported YouTube URL Formats

The application supports these YouTube URL formats:

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID&t=123s` (with timestamp)

## 🚀 Next Steps

Once you have the application running:

1. **Explore Features**: Try different types of videos and queries
2. **Read Documentation**: Check `PLANNING.md` and `requirements.md` for detailed specifications
3. **Review Code**: Examine the component structure and AI integration
4. **Test Edge Cases**: Try with different video types and lengths
5. **Contribute**: Check `task.md` for current development priorities

## 📞 Getting Help

If you encounter issues during setup:

1. **Check the troubleshooting section** above
2. **Review error messages** in the browser console
3. **Verify API key setup** is correct
4. **Check Node.js version** compatibility
5. **Look at existing issues** in the repository

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your Google AI API key private
- Use HTTPS in production environments
- Validate all user inputs

---

## 🚀 Deployment Guide

### Vercel Deployment (Recommended)

#### Prerequisites for Production

- GitHub repository with your project
- Vercel account (free tier available)
- Google AI API key

#### Security Configuration for Production

**⚠️ Important**: For production deployment, you must use server-side API calls to protect your API key.

1. **Environment Variables in Vercel**:

   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add: `GOOGLE_AI_API_KEY` (without `VITE_` prefix)
   - Value: Your Google AI API key

2. **Deployment Settings**:
   - **Root Directory**: `video_analysis`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Step-by-Step Deployment

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `video_analysis`
   - Add environment variable `GOOGLE_AI_API_KEY`
   - Deploy!

#### Troubleshooting Deployment

**Build Errors**:

- Check that all dependencies are in `package.json`
- Verify environment variables are set correctly
- Ensure no Tailwind CSS conflicts (should be resolved)

**API Key Exposure Warning**:

- Use `GOOGLE_AI_API_KEY` (server-side) instead of `VITE_GOOGLE_AI_API_KEY`
- Implement serverless functions for secure API calls

### Alternative Deployment Options

#### Netlify

- Similar setup to Vercel
- Use `npm run build` as build command
- Deploy `dist` folder
- Set environment variables in Netlify dashboard

#### GitHub Pages

- Build locally: `npm run build`
- Deploy `dist` folder contents
- Note: GitHub Pages doesn't support server-side environment variables

**🎉 You're all set! Start exploring the power of AI-driven video analysis!**
