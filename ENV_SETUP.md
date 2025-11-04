# Frontend Environment Variables Setup

Copy this content to your `.env.local` file in the `frontend/` directory.

```env
# ===========================================
# FRONTEND ENVIRONMENT VARIABLES
# ===========================================

# Backend API URL
# For development: http://localhost:8000
# For production: https://your-backend.onrender.com
NEXT_PUBLIC_URL_BACKEND=http://localhost:8000
```

## Important Notes:

1. **NEXT_PUBLIC_URL_BACKEND**: This must be the full URL of your deployed backend API.

2. **For Vercel**: Add this as an environment variable in your Vercel project settings.

3. **For Netlify**: Add this as an environment variable in your Netlify site settings.

4. **HTTPS**: Always use HTTPS in production (https://).
