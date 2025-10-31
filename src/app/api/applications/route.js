// In /api/applications/route.js

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const { data, error } = await supabase.from('applications').insert({
  full_name: fullName,
  discord_username: discordUsername,
  discord_id: discordId,
  email,
  age: parseInt(age),
  timezone,
  desired_role: desiredRole,
  secondary_role: secondaryRole,
  experience_years: experienceYears,
  previous_staff_exp: previousStaffExp,
  previous_servers: previousServers,
  relevant_skills: relevantSkills,
  available_hours_per_week: availableHoursPerWeek,
  available_days: availableDays,
  why_join: whyJoin,
  strengths,
  handle_conflict: handleConflict,
  portfolio_link: portfolioLink,
  referred_by: referredBy,
  pathway,
  status: 'pending',
  submitted_at: timestamp
});

if (error) throw error