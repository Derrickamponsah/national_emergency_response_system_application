# 📚 Swagger UI Setup - Implementation Complete

## ✅ What Was Done

Integrated **Swagger UI** directly into each backend microservice for live API documentation.

### Services Updated:
- ✅ **Auth Service** (Port 3001)
- ✅ **Incident Service** (Port 3002)
- ✅ **Dispatch Service** (Port 3003)
- ✅ **Analytics Service** (Port 3004)

---

## 🚀 How to Access Swagger UI Documentation

### Local Development (Running Services Locally)

After starting each service, access the Swagger UI at:

1. **Auth Service**
   - URL: `http://localhost:3001/api-docs`
   - Port: 3001

2. **Incident Service**
   - URL: `http://localhost:3002/api-docs`
   - Port: 3002

3. **Dispatch Service**
   - URL: `http://localhost:3003/api-docs`
   - Port: 3003

4. **Analytics Service**
   - URL: `http://localhost:3004/api-docs`
   - Port: 3004

### Production (After Deploying to Render)

Once you deploy to Render, your Swagger UI will be available at:

1. **Auth Service**
   - URL: `https://national-emergency-platform-auth.onrender.com/api-docs`

2. **Incident Service**
   - URL: `https://national-emergency-platform-incident.onrender.com/api-docs`

3. **Dispatch Service**
   - URL: `https://national-emergency-platform-dispatch.onrender.com/api-docs`

4. **Analytics Service**
   - URL: `https://national-emergency-platform-analytics.onrender.com/api-docs`

---

## 📦 What Was Added to Each Service

### 1. **New Dependencies** (installed in all 4 services)
```bash
npm install swagger-ui-express swagger-jsdoc
```

### 2. **New Config File** (`src/swagger.js`)
Each service now has a `swagger.js` file that:
- Defines OpenAPI 3.0.0 specification
- Configures service metadata
- Sets up API servers (local + production)
- Defines schemas and error responses
- Points to route files for endpoint documentation

### 3. **Updated Server.js**
Each `src/server.js` now:
- Imports `swagger-ui-express` and `swagger-jsdoc`
- Imports the swagger config
- Mounts Swagger UI at `/api-docs` route

---

## 🧪 How to Test Locally

### Step 1: Start a Service
```bash
cd BACKEND/auth-service
npm run dev
```

### Step 2: Open Swagger UI
Go to: `http://localhost:3001/api-docs`

You should see the Swagger UI interface with:
- ✅ Service name and description
- ✅ Available API endpoints
- ✅ Request/response schemas
- ✅ Try it out functionality

### Step 3: Test an Endpoint
1. Click on an endpoint to expand it
2. Click "Try it out"
3. Fill in parameters (if required)
4. Click "Execute"
5. See the response in real-time

---

## 📋 What's Included in Each Swagger Config

### Auth Service
- **Endpoints**: User registration, login, profile, logout, users list
- **Schemas**: User, AuthTokenResponse, Error
- **Tags**: Authentication, Users, Health

### Incident Service
- **Endpoints**: Create incident, list open, get details, update status, assign responders
- **Schemas**: Incident, Responder, Error
- **Tags**: Incidents, Responders, Health
- **Features**: WebSocket support, real-time updates

### Dispatch Service
- **Endpoints**: Vehicle registration, listing, location updates, history
- **Schemas**: Vehicle, LocationHistory, Error
- **Tags**: Vehicles, Location, Health
- **Features**: Real-time GPS tracking

### Analytics Service
- **Endpoints**: Response times, incidents by region, resource utilization, daily summary
- **Schemas**: ResponseTimes, IncidentsByRegion, ResourceUtilization, DailySummary, Error
- **Tags**: Analytics, Reports, Health

---

## 🔐 Authentication in Swagger UI

All protected endpoints require JWT authentication:

1. **Get Bearer Token**
   - Call `/auth/login` endpoint
   - Copy the `access_token` from response

2. **Add Token to Swagger UI**
   - Click "Authorize" button (top right)
   - Enter: `Bearer <your_token_here>`
   - Click "Authorize"
   - Now all authenticated requests will include the token

3. **Test Protected Endpoints**
   - All subsequent requests will automatically include your JWT

---

## 📝 Key Features

✅ **Live API Documentation** - Always in sync with code  
✅ **Try It Out** - Test endpoints directly from browser  
✅ **Request/Response Examples** - See realistic data structures  
✅ **Authentication Support** - JWT bearer token integration  
✅ **Multiple Servers** - Local development + production URLs  
✅ **Schema Definitions** - Complete request/response validation  
✅ **Error Codes** - All error scenarios documented  
✅ **Responsive UI** - Works on desktop, tablet, mobile  

---

## 🛠️ How to Extend Documentation

### Document Endpoints with JSDoc Comments

Add JSDoc comments to your route handlers:

```javascript
/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login User
 *     description: Authenticate user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenResponse'
 */
router.post('/login', loginController);
```

Then update `swagger.js` to include the route file in the `apis` array.

---

## 📤 Deployment to Render

1. **Push changes to GitHub** (done next)
2. **Render automatically detects changes**
3. **Services rebuild and deploy**
4. **Swagger UI available at** `service-name.onrender.com/api-docs`

No additional configuration needed! Render will automatically:
- Install the swagger packages
- Start the service with Swagger UI enabled
- Make it available at `/api-docs`

---

## ✨ Next Steps

1. ✅ Start a service locally and test at `http://localhost:PORT/api-docs`
2. ✅ Verify all endpoints appear correctly
3. ✅ Test authentication flow
4. ✅ Push to GitHub
5. ✅ Monitor Render deployment
6. ✅ Access production Swagger UI at `.onrender.com/api-docs`

---

## 📞 Support

### Troubleshooting

**Issue**: Swagger UI not loading at `/api-docs`
- **Solution**: Verify `swagger.js` is correctly imported in `server.js`

**Issue**: Endpoints not showing up
- **Solution**: Ensure route files are listed in `swagger.js` `apis` array

**Issue**: Authentication not working
- **Solution**: Use `/auth/login` first to get token, then click "Authorize"

---

## 🎉 You Now Have

✅ Live, interactive API documentation  
✅ Same Swagger UI on local + production  
✅ Professional-grade API explorer  
✅ No separate docs to maintain  
✅ Always in sync with your code  

**Access your API docs now at: `http://localhost:PORT/api-docs`** 🚀
