# Railway Deployment Fix Guide

## 🔥 **URGENT FIX NEEDED**

The admin panel deployed on Railway is still trying to connect to the old backend URL. Follow these steps to fix it immediately:

## Step 1: Set Environment Variable on Railway

1. **Go to Railway Dashboard**: [railway.app](https://railway.app)
2. **Select your admin panel project**: `easyearn-adminpanel-production`
3. **Go to Variables tab**
4. **Add Environment Variable**:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://easyearn-backend-production-01ac.up.railway.app`

## Step 2: Redeploy

After setting the environment variable, Railway should automatically redeploy. If not:

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment

## Step 3: Verify Fix

Once deployed, check the admin panel:
- Dashboard should load statistics
- User list should show users
- No more 404 errors in browser console

## Alternative: Manual Deployment

If the automatic deployment doesn't work:

1. **Push latest code** (already done):
   ```bash
   git add .
   git commit -m "Fix backend URL with centralized config"
   git push origin main
   ```

2. **Trigger new deployment** in Railway dashboard

## Expected Result

After the fix:
- ✅ Dashboard loads successfully
- ✅ All admin endpoints work
- ✅ No more `nexusbackend-production` errors
- ✅ Connects to `easyearn-backend-production-01ac.up.railway.app`

## Verification Commands

Test the backend is working:
```bash
curl https://easyearn-backend-production-01ac.up.railway.app/api/admin/dashboard-stats
```

Should return status 200 with JSON data.

---

**⚠️ IMPORTANT**: The environment variable must be set on Railway dashboard for the deployed version to work correctly!
