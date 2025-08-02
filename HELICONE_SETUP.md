# Helicone Integration Setup

## 1. Create Helicone Account
- Go to https://helicone.ai
- Sign up with GitHub
- Get your free API key from the dashboard

## 2. Add Helicone API Key to Environment

### Local Development (.env.local)
Add this line to your `.env.local` file:
```
HELICONE_API_KEY=your_actual_helicone_api_key_here
```

### Vercel Deployment
1. Go to your Vercel dashboard
2. Select your MediMemo project
3. Go to Settings → Environment Variables
4. Add:
   - **Name**: `HELICONE_API_KEY`
   - **Value**: Your actual Helicone API key
   - **Environment**: Production, Preview, Development (all)

## 3. Verify Integration

After deployment, you should see:
- Console logs: "LLM call sent via Helicone"
- Logs appearing in https://helicone.ai dashboard
- User tracking by Clerk user ID
- Cache status tracking

## 4. What's Been Updated

✅ **API Route Changes** (`src/app/api/upload-pdf/route.ts`):
- Changed URL from `api.together.xyz` → `oai.helicone.ai`
- Added Helicone headers for tracking
- Added console.log for visibility
- Both main AI call and Llama Guard safety check now use Helicone

✅ **Features Added**:
- User ID tracking via Clerk
- Cache hit/miss tracking
- Model-specific tracking (llama-guard vs main model)
- Complete observability of all LLM calls

## 5. Benefits

🔍 **Debugging**: See exactly what prompts are sent and responses received
💰 **Cost Tracking**: Monitor token usage per user
⚡ **Performance**: Identify slow prompts and optimize
🛡️ **Safety**: Track Llama Guard usage and blocked content
📈 **Analytics**: Prove value to future partners/investors

## 6. Next Steps

1. Add your Helicone API key to `.env.local`
2. Deploy to Vercel with the environment variable
3. Test with a PDF upload
4. Check https://helicone.ai for logs
5. Monitor usage and performance

---

**Note**: This integration is minimal and safe - no breaking changes to existing functionality. All existing error handling, caching, and rate limiting remain intact. 