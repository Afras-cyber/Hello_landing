# Deployment Instructions for Vercel

## Vercel Dashboard Settings

- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables

Make sure to add any required environment variables in the Vercel dashboard:

1. Go to Project → Settings → Environment Variables
2. Add all necessary environment variables used in your application

## Pre-Deployment Checklist

1. Ensure `vite.config.ts` is properly configured with:
   - Development-only plugins filtered out
   - Base path set to "/"

2. Verify `vercel.json` includes correct:
   - Rewrites for client-side routing
   - Headers for security and caching
   - Image optimization settings

## Post-Deployment Testing

After deployment, verify the following:

1. The main page loads correctly at `https://[your-project].vercel.app/`
2. Client-side routing works (e.g.,
   `https://[your-project].vercel.app/admin/login`)
3. Check browser DevTools for any errors, especially:
   - Network errors
   - JavaScript console errors like "React refresh preamble was not loaded"
   - Missing assets

4. Test responsive layouts on different devices
5. Verify all API calls are working correctly

## Troubleshooting

If you encounter issues:

1. **Routing problems**: Verify `vercel.json` rewrites are correctly configured
2. **Missing assets**: Check the build output directory in the Vercel logs
3. **API errors**: Ensure CORS is properly configured and environment variables
   are set
