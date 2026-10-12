# Phase 15: Google Search Console Launch & Indexing Runbook

**Academy**: TechBuilt Open School International Online Academy  
**Production Domain**: `techbuiltos.online`  
**Production URL**: `https://techbuiltos.online/`  
**Authoritative Sitemap**: `https://techbuiltos.online/sitemap.xml`

> [!IMPORTANT]
> Google Search Console ownership requires genuine administrative DNS or server access. Do not inject dummy meta tags, fake HTML verification files, or fabricated tokens. Follow these exact manual verification steps upon DNS access.

---

## Step 1: Create the Domain Property in Google Search Console

1. Navigate to [Google Search Console](https://search.google.com/search-console).
2. Log in with the authoritative academy administrative Google Account (`admissions@techbuiltopenschool.com` or authorized webmaster).
3. In the property selector dropdown, click **Add Property**.
4. Choose **Domain** (Recommended):
   - Enter `techbuiltos.online` (do not enter `https://` or `www`).
   - Click **Continue**.

---

## Step 2: Verify Domain Ownership via DNS TXT Record

1. Search Console will present a unique DNS TXT verification string:
   - Example format: `google-site-verification=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
2. Open your DNS provider dashboard (Cloudflare, Namecheap, GoDaddy, Hostinger, etc.).
3. Add a new DNS record:
   - **Type**: `TXT`
   - **Name / Host**: `@` (or `techbuiltos.online`)
   - **Value / Content**: Paste the exact verification token copied from Search Console.
   - **TTL**: `Auto` or `3600` (1 hour).
4. Save the DNS record. Allow 2–15 minutes for worldwide DNS propagation.
5. In Search Console, click **Verify**.
6. When verified, Search Console will confirm **"Ownership verified"**.

---

## Step 3: (Optional) Add URL-Prefix Property

For granular URL inspection and specific HTTPS tracking:

1. Click **Add Property** again.
2. Choose **URL Prefix**.
3. Enter `https://techbuiltos.online/`.
4. Click **Continue**. Because the Domain property is already verified via DNS, Google will automatically verify the URL-prefix property immediately.

---

## Step 4: Submit the Authoritative XML Sitemap

1. In the left navigation menu of Google Search Console, click **Sitemaps**.
2. Under "Add a new sitemap", enter:
   ```
   sitemap.xml
   ```
3. Click **Submit**.
4. Verify the status:
   - Google will show status: **Success**.
   - Discovered pages count will report **90** (matching all 90 public indexable routes).

---

## Step 5: Test and Validate `robots.txt`

1. Open the [Google robots.txt Tester Tool](https://www.google.com/webmasters/tools/robots-testing-tool).
2. Confirm the active rules loaded from `https://techbuiltos.online/robots.txt`:

   ```
   User-agent: *
   Allow: /
   Disallow: /admin
   Disallow: /api

   Sitemap: https://techbuiltos.online/sitemap.xml
   ```

3. Test crawling for priority public URLs:
   - `/` -> **Allowed**
   - `/courses/python` -> **Allowed**
   - `/specializations/full-stack-developer` -> **Allowed**
   - `/blog/python-learning-roadmap-beginners` -> **Allowed**
4. Test crawling for private paths:
   - `/admin/login` -> **Blocked (Disallow: /admin)**
   - `/api/admissions` -> **Blocked (Disallow: /api)**

---

## Step 6: Inspect and Request Indexing for Priority Routes

Use the **URL Inspection Tool** (search bar at the top of GSC) to inspect and request initial indexing for the 12 priority pages:

1. `https://techbuiltos.online/` (Homepage)
2. `https://techbuiltos.online/courses` (Courses Directory)
3. `https://techbuiltos.online/courses/python` (Python Programming Course)
4. `https://techbuiltos.online/specializations` (Specializations Directory)
5. `https://techbuiltos.online/specializations/full-stack-developer` (Full-Stack Track)
6. `https://techbuiltos.online/specializations/data-analyst` (Data Analyst Track)
7. `https://techbuiltos.online/live-batches` (Live Cohorts Directory)
8. `https://techbuiltos.online/live-batches/100-days-complete-python` (100 Days Cohort)
9. `https://techbuiltos.online/tutoring` (Tutoring Directory)
10. `https://techbuiltos.online/for-parents` (Parent Trust Portal)
11. `https://techbuiltos.online/for-students` (Student Portal)
12. `https://techbuiltos.online/blog/python-learning-roadmap-beginners` (Evergreen Guide)

**Inspection Procedure for Each**:

- Paste the URL into the inspection bar.
- Click **Test Live URL**. Confirm:
  - "URL is available to Google"
  - HTTP 200
  - Canonical matches user-declared canonical.
- Click **Request Indexing**. (Submit once per URL; avoid repeated spamming).

---

## Step 7: Index Coverage & Health Monitoring Categories

Monitor these standard Search Console reports weekly:

| Report Category                               | Expected Healthy Status                 | Remediation if Flagged                                                    |
| :-------------------------------------------- | :-------------------------------------- | :------------------------------------------------------------------------ |
| **Indexed**                                   | Growing toward all 90 public pages      | Healthy state. No action needed.                                          |
| **Crawled — currently not indexed**           | 0 or temporary during initial discovery | Normal for brand new URLs; typically indexes within 7–14 days.            |
| **Discovered — currently not indexed**        | 0 or temporary                          | Indicates Google has queued the URL. Ensure internal links point to it.   |
| **Duplicate without user-selected canonical** | **0 (Zero)**                            | Our canonical tags strictly prevent this.                                 |
| **Alternate page with proper canonical**      | 0                                       | Our canonical tags strictly resolve to clean paths.                       |
| **Soft 404**                                  | **0 (Zero)**                            | Any non-existent route returns a real 404 component.                      |
| **Redirect errors**                           | **0 (Zero)**                            | All sitemap links point to final 200 destinations.                        |
| **Server errors (5xx)**                       | **0 (Zero)**                            | Monitored through cloud runtime logs.                                     |
| **HTTPS Report**                              | 100% HTTPS valid                        | Zero mixed content or unencrypted assets.                                 |
| **Core Web Vitals**                           | 100% "Good" URLs                        | LCP < 2.5s, CLS < 0.10.                                                   |
| **Enhancements (Structured Data)**            | Valid Course, Article, FAQ schemas      | Inspect warnings; resolve any missing recommended schema fields.          |
| **Manual Actions**                            | **No issues detected**                  | Strict adherence to helpful content guidelines guarantees clean standing. |
| **Security Issues**                           | **No issues detected**                  | Zero malware, zero deceptive scripts.                                     |

---

## Step 8: 30-Day Indexing Monitoring Checklist

- [ ] **Day 1**: Verify DNS TXT record and confirm Search Console ownership.
- [ ] **Day 1**: Submit `https://techbuiltos.online/sitemap.xml` in Search Console.
- [ ] **Day 2**: Inspect top 12 priority URLs and submit "Request Indexing".
- [ ] **Day 7**: Review "Sitemaps" report; check discovered count (target: 90 URLs).
- [ ] **Day 14**: Check "Page Indexing" report. Confirm initial pages transitioning from "Discovered" to "Indexed".
- [ ] **Day 21**: Inspect structured data enhancements (Articles, Courses, FAQs, Breadcrumbs) for zero parsing errors.
- [ ] **Day 30**: Review "Performance" report for initial organic search impressions, queries, and click-through rates.
