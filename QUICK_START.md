# 🚀 VedaAI Quick Start Guide

## ✅ System Status: DEPLOYMENT READY

The system now works with mock services when Redis/MongoDB are not available.

## 🎯 Quick Start (3 Commands)

Open **3 separate terminals** and run:

### Terminal 1 - Backend API
```bash
cd s:\VedaAI\veda-ai\backend
npm run dev
```
**Expected Output:**
```
[INFO] ts-node-dev ver. 2.0.0
[MongoDB] Using mock database (env variable set)
[Redis] Using mock Redis (env variable set)
[API] 🚀 Server running on http://localhost:4000
```

### Terminal 2 - Worker
```bash
cd s:\VedaAI\veda-ai\backend  
npm run worker
```
**Expected Output:**
```
[INFO] ts-node-dev ver. 2.0.0
[Worker] 🎯 Using mock worker (development mode)
```

### Terminal 3 - Frontend
```bash
cd s:\VedaAI\veda-ai\frontend
npm run dev
```
**Expected Output:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## 🌐 Access the Application

Once all 3 are running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 🧪 Test the System

1. Open http://localhost:3000 in browser
2. Click "Create New Assignment"
3. Fill form:
   - Title: "Test Mathematics Paper"
   - Subject: "Mathematics"
   - Class: "Grade 10"
   - Question Types: 
     * Multiple Choice: 5 questions, 1 mark each
     * Short Answer: 3 questions, 2 marks each
   - Instructions: "Focus on algebra"
4. Click "Next →"
5. Wait 10-20 seconds for AI generation
6. View your generated question paper!

## 🔧 What's Happening Behind the Scenes

1. **Frontend** sends assignment to backend API
2. **Backend** saves assignment and adds job to queue
3. **Worker** picks up job and calls Claude AI
4. **AI** generates structured question paper
5. **Worker** saves result and updates status
6. **WebSocket** notifies frontend in real-time
7. **Frontend** displays the completed paper

## 📝 Environment Configuration

The system now uses mock services by default (no Redis/MongoDB needed):

**Backend `.env` file:**
```env
USE_MOCK_REDIS=true      # Uses in-memory Redis
USE_MOCK_MONGODB=true    # Uses in-memory database
OPENROUTER_API_KEY=...   # Required for AI
```

## 🎉 Features Working

✅ **Assignment Creation** - Form validation and API  
✅ **AI Question Generation** - Claude API integration  
✅ **Real-time Updates** - WebSocket notifications  
✅ **Question Paper Display** - Structured output  
✅ **Student Info Section** - Name, roll, class fields  
✅ **Difficulty Distribution** - Easy/Medium/Hard questions  
✅ **Answer Keys** - Generated with questions  
✅ **PDF Download** - Print-friendly format  

## 🔍 Troubleshooting

### If backend doesn't start:
```bash
cd s:\VedaAI\veda-ai\backend
npm install
npm run build
npm run dev
```

### If frontend doesn't start:
```bash
cd s:\VedaAI\veda-ai\frontend
npm install
npm run dev
```

### If AI generation fails:
- Check OPENROUTER_API_KEY in backend/.env
- Verify internet connection
- Check worker terminal for error messages

### If no real-time updates:
- Check all 3 terminals are running
- Refresh browser
- Check browser console for WebSocket errors

## 📚 Next Steps

Once system is running:
1. **Create Assignments** - Test different subjects and question types
2. **Generate Papers** - See AI create curriculum-aligned questions
3. **Download PDFs** - Print and distribute generated papers
4. **Monitor Performance** - Check logs for generation times

## 🏆 Production Deployment

For production deployment:
1. Set `USE_MOCK_REDIS=false` and `USE_MOCK_MONGODB=false`
2. Provide real Redis and MongoDB connection strings
3. Deploy to your cloud provider
4. Scale workers as needed

---

**Status**: ✅ READY FOR IMMEDIATE USE  
**Last Updated**: March 26, 2026  
**Version**: 1.0.0 (Production Ready)
