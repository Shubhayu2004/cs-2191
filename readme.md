API Documentation
Authentication Endpoints
POST /users/register
Description: Register a new user
Auth Required: No
Request Body:
Success Response: 201 Created
POST /users/login
Description: Login user
Auth Required: No
Request Body:
Success Response: 200 OK
POST /users/logout
Description: Logout user
Auth Required: Yes
Headers: Authorization: Bearer {token}
Success Response: 200 OK
User Management Endpoints
PUT /users/update-role/:id
Description: Update user role (Admin only)
Auth Required: Yes
Headers: Authorization: Bearer {token}
Request Body:
Success Response: 200 OK
GET /users/users
Description: Get all users (Admin only)
Auth Required: Yes
Headers: Authorization: Bearer {token}
Success Response: 200 OK
Committee Endpoints
POST /api/committees/create
Description: Create a new committee
Auth Required: Yes
Headers: Authorization: Bearer {token}
Request Body:
Success Response: 201 Created
GET /api/committees
Description: Get all committees
Auth Required: Yes
Headers: Authorization: Bearer {token}
Success Response: 200 OK
Error Responses
All endpoints may return these errors:

400 Bad Request: Invalid input data
401 Unauthorized: Missing or invalid token
403 Forbidden: Insufficient permissions
500 Internal Server Error: Server error