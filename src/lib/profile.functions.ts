import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const profileSchema = z.object({
  full_name: z.string().trim().min(1).max(120).optional().nullable(),
  gender: z.enum(["male", "female"]).optional().nullable(),
  dob: z.string().max(20).optional().nullable(),
  height_cm: z.number().int().min(120).max(230).optional().nullable(),
  community: z.string().max(120).optional().nullable(),
  education: z.string().max(160).optional().nullable(),
  profession: z.string().max(160).optional().nullable(),
  salary_range: z.string().max(80).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  district: z.string().max(80).optional().nullable(),
  state: z.string().max(80).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  about: z.string().max(2000).optional().nullable(),
  expectations: z.string().max(2000).optional().nullable(),
  family_details: z.string().max(2000).optional().nullable(),
  horoscope_url: z.string().max(500).optional().nullable(),
});

const FIELDS = [
  "full_name","gender","dob","height_cm","community","education",
  "profession","city","state","phone","about","expectations","family_details",
] as const;

function calcCompletion(p: Record<string, unknown>) {
  const filled = FIELDS.filter((k) => {
    const v = p[k];
    return v !== null && v !== undefined && String(v).trim() !== "";
  }).length;
  return Math.round((filled / FIELDS.length) * 100);
}

export const getMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: photos } = await supabase
      .from("profile_photos")
      .select("*")
      .eq("user_id", userId)
      .order("order_index", { ascending: true });

    return { profile: data, photos: photos ?? [] };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const completion = calcCompletion(data);
    const { error } = await supabase
      .from("profiles")
      .update({ ...data, profile_completion: completion })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true, completion };
  });

export const listMatches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: me } = await supabase
      .from("profiles")
      .select("gender")
      .eq("user_id", userId)
      .maybeSingle();
    const oppositeGender = me?.gender === "male" ? "female" : me?.gender === "female" ? "male" : null;
    let q = supabase
      .from("profiles")
      .select("user_id, full_name, gender, dob, city, profession, education")
      .neq("user_id", userId)
      .not("full_name", "is", null)
      .limit(30);
    if (oppositeGender) q = q.eq("gender", oppositeGender);
    const { data } = await q;
    return { matches: data ?? [] };
  });
