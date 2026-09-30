import { createClient } from "@supabase/supabase-js";
import { courses } from "../src/data/courses";
import { specializations } from "../src/data/specializations";
import { liveOffers } from "../src/data/liveOffers";
import { tutoringSubjects } from "../src/data/tutoring";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function seed() {
  console.log("Starting idempotent CMS content seed...");

  // 1. Seed Technical Courses (32 items)
  console.log(`\nSeeding ${courses.length} courses...`);
  let courseCount = 0;
  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    const { error } = await supabase.from("cms_courses").upsert(
      {
        slug: c.slug,
        title: c.title,
        category: c.category,
        level: c.level,
        duration: c.duration,
        mode: c.mode,
        tagline: c.tagline,
        summary: c.summary,
        description: c.description,
        outcomes: c.outcomes,
        curriculum: c.curriculum,
        audience: c.audience,
        prerequisites: c.prerequisites || null,
        price_note: c.priceNote,
        icon: c.icon,
        keywords: c.keywords,
        published: true,
        featured: Boolean(c.featured),
        sort_order: i + 1,
      },
      { onConflict: "slug" },
    );

    if (error) {
      console.error(`Failed to upsert course ${c.slug}:`, error.message);
    } else {
      courseCount++;
    }
  }
  console.log(`Successfully seeded/upserted ${courseCount} courses.`);

  // 2. Seed Specializations (10 items)
  console.log(`\nSeeding ${specializations.length} specializations...`);
  let specCount = 0;
  for (let i = 0; i < specializations.length; i++) {
    const s = specializations[i];
    const { error } = await supabase.from("cms_specializations").upsert(
      {
        slug: s.slug,
        title: s.title,
        category: "Specialization",
        tagline: s.tagline,
        summary: s.summary,
        description: s.description,
        duration: s.duration,
        level: s.level,
        modules: s.modules,
        outcomes: s.outcomes,
        careers: s.careers,
        icon: s.icon,
        keywords: s.keywords,
        monthly_price: s.monthlyPrice || null,
        full_price: s.fullPrice || null,
        upfront_discount_enabled: Boolean(s.upfrontDiscount),
        upfront_discount_percent: s.upfrontDiscount?.percentage ?? 20,
        published: true,
        featured: Boolean(s.featured),
        sort_order: i + 1,
      },
      { onConflict: "slug" },
    );

    if (error) {
      console.error(`Failed to upsert specialization ${s.slug}:`, error.message);
    } else {
      specCount++;
    }
  }
  console.log(`Successfully seeded/upserted ${specCount} specializations.`);

  // 3. Seed Live Offers (3 items)
  console.log(`\nSeeding ${liveOffers.length} live offers...`);
  let offerCount = 0;
  for (let i = 0; i < liveOffers.length; i++) {
    const o = liveOffers[i];
    const { error } = await supabase.from("cms_live_offers").upsert(
      {
        slug: o.slug,
        title: o.title,
        short_title: o.shortTitle,
        status: o.status,
        audience: o.audience,
        age_or_education_level: o.ageOrEducationLevel,
        duration: o.duration,
        classes_per_week: o.classesPerWeek || null,
        session_duration: o.sessionDuration || null,
        format: o.format,
        regular_fee: o.pricing.regularFee,
        offer_fee: o.pricing.offerFee,
        currency: o.pricing.currency,
        billing_period: o.pricing.billingPeriod,
        free_demo: o.pricing.freeDemo,
        free_demo_note: o.pricing.freeDemoNote,
        paid_note: o.pricing.paidNote,
        schedule_note: o.pricing.scheduleNote,
        tagline: o.tagline,
        summary: o.summary,
        description: o.description,
        highlights: o.highlights,
        roadmap: o.roadmap,
        prerequisites: o.prerequisites,
        ideal_for: o.idealFor,
        icon: o.icon,
        keywords: o.keywords,
        published: true,
        featured: Boolean(o.featured),
        sort_order: i + 1,
      },
      { onConflict: "slug" },
    );

    if (error) {
      console.error(`Failed to upsert live offer ${o.slug}:`, error.message);
    } else {
      offerCount++;
    }
  }
  console.log(`Successfully seeded/upserted ${offerCount} live offers.`);

  // 4. Seed Tutoring Subjects (12 items)
  console.log(`\nSeeding ${tutoringSubjects.length} tutoring subjects...`);
  let tutorCount = 0;
  for (let i = 0; i < tutoringSubjects.length; i++) {
    const t = tutoringSubjects[i];
    const { error } = await supabase.from("cms_tutoring").upsert(
      {
        slug: t.slug,
        title: t.title,
        category: t.category,
        level: t.level,
        summary: t.summary,
        audience: t.audience,
        topics: t.topics,
        icon: t.icon,
        keywords: t.keywords,
        delivery_options: "One-to-One Private Tuition & Small Custom Batches",
        pricing_notes: "Customized hourly or monthly packages available",
        published: true,
        featured: Boolean(t.featured),
        sort_order: i + 1,
      },
      { onConflict: "slug" },
    );

    if (error) {
      console.error(`Failed to upsert tutoring subject ${t.slug}:`, error.message);
    } else {
      tutorCount++;
    }
  }
  console.log(`Successfully seeded/upserted ${tutorCount} tutoring subjects.`);

  console.log("\n==================================================");
  console.log("CMS SEED COMPLETE");
  console.log(`Courses: ${courseCount}/32`);
  console.log(`Specializations: ${specCount}/10`);
  console.log(`Live Offers: ${offerCount}/3`);
  console.log(`Tutoring Subjects: ${tutorCount}/12`);
  console.log("==================================================");
}

seed().catch((err) => {
  console.error("Seed encountered unhandled error:", err);
  process.exit(1);
});
