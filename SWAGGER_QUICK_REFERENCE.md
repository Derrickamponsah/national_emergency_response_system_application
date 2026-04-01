# 🔗 Swagger UI - Quick Access Links

## 📚 Documentation Links

### 🏠 Local Development (http://localhost:PORT/api-docs)
```
Auth Service:      http://localhost:3001/api-docs
Incident Service:  http://localhost:3002/api-docs
Dispatch Service:  http://localhost:3003/api-docs
Analytics Service: http://localhost:3004/api-docs
```

### 🌐 Production (After Render Deployment)
```
Auth Service:      https://national-emergency-platform-auth.onrender.com/api-docs
Incident Service:  https://national-emergency-platform-incident.onrender.com/api-docs
Dispatch Service:  https://national-emergency-platform-dispatch.onrender.com/api-docs
Analytics Service: https://national-emergency-platform-analytics.onrender.com/api-docs
```

---

## ✨ Features

✅ **Live API Documentation**  
✅ **Try It Out** - Test endpoints directly  
✅ **JWT Authentication** - Built-in token management  
✅ **Request/Response Examples** - Learn by doing  
✅ **Error Documentation** - All codes explained  
✅ **Multiple Environments** - Local + Production URLs  
✅ **OpenAPI 3.0 Compliant** - Industry standard  

---

## 🚀 Quick Start

### 1. Start a Service
```bash
cd BACKEND/auth-service
npm run dev
```

### 2. Open Swagger UI
```
http://localhost:3001/api-docs
```

### 3. Test an Endpoint
1. Click an endpoint
2. Click "Try it out"
3. Fill in parameters
4. Click "Execute"
5. See response

---

## 📦 What Was Changed

**Added to each service:**
- `src/swagger.js` - Configuration
- Updated `src/server.js` - Mount Swagger UI
- Updated `package.json` - Added swagger packages

**GitHub Commit:**
- ✅ Pushed to main branch
- ✅ Render will auto-deploy

---

## 🎯 Production Timeline

| Task | Status | Time |
|------|--------|------|
| Code pushed | ✅ Complete | Now |
| Render detects | ⏳ Automatic | ~1 min |
| Deploy starts | ⏳ Automatic | ~2 min |
| Services rebuild | ⏳ Automatic | ~5 min |
| Live on Render | ⏳ Automatic | ~10 min |

---

## 📞 Support

- **Setup Help**: See `SWAGGER_UI_SETUP.md`
- **Deployment Info**: See `SWAGGER_DEPLOYMENT_GUIDE.md`
- **Issues**: Check service health at `/health` endpoint

---

**Your API is documented! 🎉**  
Access Swagger UI now at your service's `/api-docs` route.
