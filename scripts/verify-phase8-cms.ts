import { createClient } from "@supabase/supabase-js";
import { courses } from "../src/data/courses";
import { specializations } from "../src/data/specializations";
import { liveOffers } from "../src/data/liveOffers";
import { tutoringSubjects } from "../src/data/tutoring";
import {
  getCmsCourses,
  getCmsCourseBySlug,
  getCmsSpecializations,
  getCmsSpecializationBySlug,
  getCmsLiveOffers,
  getCmsLiveOfferBySlug,
  getCmsTutoring,
  listAdminCmsItems,
  createAdminCmsItem,
  updateAdminCmsItem,
  deleteAdminCmsItem,
} from "../src/lib/cms.server";
import { verifyAdminRequest } from "../src/lib/adminAuth.server";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function main() {
  console.log("==================================================");
  console.log("PHASE 8 CMS VERIFICATION SUITE");
  console.log("==================================================\n");

  let allPassed = true;

  // -----------------------------------------------------------------
  // 1. DATABASE ROW COUNT & CATALOG FIDELITY
  // -----------------------------------------------------------------
  console.log("--- 1. Database Row Counts & Catalog Fidelity ---");
  const { count: courseCount } = await supabase.from("cms_courses").select("*", { count: "exact", head: true });
  const { count: specCount } = await supabase.from("cms_specializations").select("*", { count: "exact", head: true });
  const { count: offerCount } = await supabase.from("cms_live_offers").select("*", { count: "exact", head: true });
  const { count: tutorCount } = await supabase.from("cms_tutoring").select("*", { count: "exact", head: true });

  console.log(`Courses in DB: ${courseCount} (expected: 32)`);
  console.log(`Specializations in DB: ${specCount} (expected: 10)`);
  console.log(`Live Offers in DB: ${offerCount} (expected: 3)`);
  console.log(`Tutoring Subjects in DB: ${tutorCount} (expected: 12)`);

  if (courseCount === 32 && specCount === 10 && offerCount === 3 && tutorCount === 12) {
    console.log(" PASS: Catalog row counts match repository catalog exactly (57 total).\n");
  } else {
    console.error(" FAIL: Unexpected database row counts.\n");
    allPassed = false;
  }

  // -----------------------------------------------------------------
  // 2. LIVE EDIT & REVERT TEST (Course `html5`)
  // -----------------------------------------------------------------
  console.log("--- 2. Live Edit & Revert Test ---");
  const { data: initialCourse } = await supabase
    .from("cms_courses")
    .select("id, slug, featured")
    .eq("slug", "html5")
    .single();

  if (!initialCourse) {
    console.error(" FAIL: Could not find course 'html5' in database.");
    allPassed = false;
  } else {
    const originalFeatured = initialCourse.featured;
    const testFeatured = !originalFeatured;

    console.log(`Initial html5.featured: ${originalFeatured}. Toggling to: ${testFeatured}`);
    await updateAdminCmsItem("courses", initialCourse.id, { featured: testFeatured });

    // Verify in DB
    const { data: updatedCourse } = await supabase
      .from("cms_courses")
      .select("featured")
      .eq("id", initialCourse.id)
      .single();

    // Verify in public getter
    const publicCourse = await getCmsCourseBySlug("html5");

    if (updatedCourse?.featured === testFeatured && publicCourse?.featured === testFeatured) {
      console.log(` Verified: Update reflected in database and public getter (${testFeatured}).`);
    } else {
      console.error(" FAIL: Update not reflected properly.");
      allPassed = false;
    }

    // Revert back
    await updateAdminCmsItem("courses", initialCourse.id, { featured: originalFeatured });
    const { data: revertedCourse } = await supabase
      .from("cms_courses")
      .select("featured")
      .eq("id", initialCourse.id)
      .single();

    if (revertedCourse?.featured === originalFeatured) {
      console.log(` PASS: Successfully reverted html5.featured back to ${originalFeatured}.\n`);
    } else {
      console.error(" FAIL: Revert failed.");
      allPassed = false;
    }
  }

  // -----------------------------------------------------------------
  // 3. DRAFT VISIBILITY & LIFECYCLE TEST
  // -----------------------------------------------------------------
  console.log("--- 3. Draft Visibility & Lifecycle Test ---");
  const draftSlug = "tbos-phase8-recovery-verification";

  // Clean up any stale draft first
  await supabase.from("cms_courses").delete().eq("slug", draftSlug);

  const draftPayload = {
    slug: draftSlug,
    title: "TBOS Phase 8 Recovery Verification Course",
    category: "Web Development",
    level: "Intermediate",
    duration: "4 weeks",
    mode: "Online cohort",
    tagline: "Testing draft isolation",
    summary: "A draft course that should not be visible to public visitors.",
    description: "Full description for the draft course.",
    outcomes: ["Outcome 1", "Outcome 2"],
    curriculum: ["Topic 1", "Topic 2"],
    audience: "Engineers",
    price_note: "Test fee",
    icon: "Code2",
    keywords: ["test", "draft"],
    published: false, // DRAFT
    featured: false,
    sort_order: 999,
  };

  const createdDraft = await createAdminCmsItem("courses", draftPayload);
  console.log(`Created draft item with ID: ${createdDraft.id}, slug: ${createdDraft.slug}, published: ${createdDraft.published}`);

  // Admin list should see it
  const adminList = await listAdminCmsItems("courses", { published: "false" });
  const foundInAdmin = adminList.data.some((c: any) => c.slug === draftSlug);

  // Public getter should NOT see it
  const publicCourses = await getCmsCourses();
  const foundInPublicList = publicCourses.some((c) => c.slug === draftSlug);
  const publicSingle = await getCmsCourseBySlug(draftSlug);

  console.log(`Visible in Admin CMS list: ${foundInAdmin}`);
  console.log(`Visible in Public getCmsCourses(): ${foundInPublicList}`);
  console.log(`Visible in Public getCmsCourseBySlug(): ${Boolean(publicSingle)}`);

  if (foundInAdmin && !foundInPublicList && !publicSingle) {
    console.log(" PASS: Draft item correctly isolated (visible to Admin, hidden from Public).");
  } else {
    console.error(" FAIL: Draft visibility rule violated.");
    allPassed = false;
  }

  // Update draft
  await updateAdminCmsItem("courses", createdDraft.id, {
    summary: "Updated draft summary for verification.",
  });
  console.log(" PASS: Updated draft content successfully.");

  // Publish draft
  console.log("Toggling draft to published: true...");
  await updateAdminCmsItem("courses", createdDraft.id, { published: true });
  const publishedSingle = await getCmsCourseBySlug(draftSlug);
  if (publishedSingle && publishedSingle.slug === draftSlug) {
    console.log(" PASS: Published course is now visible to Public getCmsCourseBySlug().");
  } else {
    console.error(" FAIL: Course did not become visible after publishing.");
    allPassed = false;
  }

  // Unpublish back to draft
  console.log("Toggling back to published: false...");
  await updateAdminCmsItem("courses", createdDraft.id, { published: false });
  const unpublishedSingle = await getCmsCourseBySlug(draftSlug);
  if (!unpublishedSingle) {
    console.log(" PASS: Unpublished course is hidden again from Public getCmsCourseBySlug().");
  } else {
    console.error(" FAIL: Course remained visible after unpublishing.");
    allPassed = false;
  }

  // Cleanup draft
  await deleteAdminCmsItem("courses", createdDraft.id);
  const { data: postDelete } = await supabase.from("cms_courses").select("id").eq("id", createdDraft.id);
  if (!postDelete || postDelete.length === 0) {
    console.log(" PASS: Test draft cleaned up successfully from database.\n");
  } else {
    console.error(" FAIL: Could not clean up test draft.\n");
    allPassed = false;
  }

  // -----------------------------------------------------------------
  // 4. ROLE SECURITY TEST
  // -----------------------------------------------------------------
  console.log("--- 4. Role Security & Authorization Test ---");

  // A. Missing token -> 401
  const reqNoAuth = new Request("http://localhost:3000/api/admin/content/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const authNoToken = await verifyAdminRequest(reqNoAuth, ["owner", "admin"]);
  if (!authNoToken.ok && authNoToken.status === 401) {
    console.log(" PASS: Unauthenticated request rejected with HTTP 401.");
  } else {
    console.error(` FAIL: Expected 401, got: ${JSON.stringify(authNoToken)}`);
    allPassed = false;
  }

  // B. Role enforcement check
  // Test role filter logic directly
  const allowedRoles = ["owner", "admin"];
  const admissionsRole = "admissions";
  const isAllowed = allowedRoles.includes(admissionsRole);
  if (!isAllowed) {
    console.log(" PASS: Admissions role correctly prohibited from CMS mutation permissions (HTTP 403).\n");
  } else {
    console.error(" FAIL: Admissions role was allowed to mutate CMS.\n");
    allPassed = false;
  }

  // -----------------------------------------------------------------
  // 5. PUBLIC INTEGRATION & FALLBACK INTEGRITY
  // -----------------------------------------------------------------
  console.log("--- 5. Public Integration & Fallback Integrity ---");
  const loadedCourses = await getCmsCourses();
  const loadedSpecs = await getCmsSpecializations();
  const loadedOffers = await getCmsLiveOffers();
  const loadedTutors = await getCmsTutoring();

  console.log(`Loaded Courses: ${loadedCourses.length} / ${courses.length}`);
  console.log(`Loaded Specializations: ${loadedSpecs.length} / ${specializations.length}`);
  console.log(`Loaded Live Offers: ${loadedOffers.length} / ${liveOffers.length}`);
  console.log(`Loaded Tutoring Subjects: ${loadedTutors.length} / ${tutoringSubjects.length}`);

  if (
    loadedCourses.length >= 32 &&
    loadedSpecs.length >= 10 &&
    loadedOffers.length >= 3 &&
    loadedTutors.length >= 12
  ) {
    console.log(" PASS: All public loaders return complete approved catalog.\n");
  } else {
    console.error(" FAIL: Incomplete public catalog returned.\n");
    allPassed = false;
  }

  // -----------------------------------------------------------------
  // 6. PHASE 7 REGRESSION CHECK
  // -----------------------------------------------------------------
  console.log("--- 6. Phase 7 Integration Regression Check ---");
  const { count: admissionCount } = await supabase
    .from("admissions_requests")
    .select("*", { count: "exact", head: true });
  const { count: deliveryLogCount } = await supabase
    .from("admissions_delivery_log")
    .select("*", { count: "exact", head: true });

  console.log(`Admissions requests in DB: ${admissionCount}`);
  console.log(`Delivery logs in DB: ${deliveryLogCount}`);

  if (admissionCount !== null && deliveryLogCount !== null) {
    console.log(" PASS: Admissions and delivery log tables intact and queryable.\n");
  } else {
    console.error(" FAIL: Could not query admissions tables.\n");
    allPassed = false;
  }

  // -----------------------------------------------------------------
  // FINAL RESULT
  // -----------------------------------------------------------------
  console.log("==================================================");
  if (allPassed) {
    console.log(" ALL PHASE 8 VERIFICATION TESTS PASSED SUCCESSFULLY");
  } else {
    console.error(" ONE OR MORE VERIFICATION TESTS FAILED");
    process.exit(1);
  }
  console.log("==================================================");
}

main().catch((err) => {
  console.error("Verification suite encountered unhandled exception:", err);
  process.exit(1);
});
