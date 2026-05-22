import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  head: () => ({ meta: [{ title: "Edit Profile — Chettiar Connect" }] }),
  component: ProfileEditor,
});

interface FormState {
  full_name: string;
  gender: "" | "male" | "female";
  dob: string;
  height_cm: string;
  community: string;
  education: string;
  profession: string;
  salary_range: string;
  city: string;
  district: string;
  state: string;
  phone: string;
  about: string;
  expectations: string;
  family_details: string;
  horoscope_url: string;
}

const empty: FormState = {
  full_name: "", gender: "", dob: "", height_cm: "", community: "Nagarathar Chettiar",
  education: "", profession: "", salary_range: "", city: "", district: "", state: "Tamil Nadu",
  phone: "", about: "", expectations: "", family_details: "", horoscope_url: "",
};

function ProfileEditor() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const getProfile = useServerFn(getMyProfile);
  const updateProfile = useServerFn(updateMyProfile);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const profileQ = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getProfile(),
    enabled: !!user,
  });

  useEffect(() => {
    const p = profileQ.data?.profile;
    if (!p) return;
    const pending = typeof window !== "undefined" ? sessionStorage.getItem("cc:pending_name") : null;
    setForm({
      full_name: p.full_name ?? pending ?? "",
      gender: (p.gender as "male" | "female") ?? "",
      dob: p.dob ?? "",
      height_cm: p.height_cm?.toString() ?? "",
      community: p.community ?? "Nagarathar Chettiar",
      education: p.education ?? "",
      profession: p.profession ?? "",
      salary_range: p.salary_range ?? "",
      city: p.city ?? "",
      district: p.district ?? "",
      state: p.state ?? "Tamil Nadu",
      phone: p.phone ?? "",
      about: p.about ?? "",
      expectations: p.expectations ?? "",
      family_details: p.family_details ?? "",
      horoscope_url: p.horoscope_url ?? "",
    });
    if (pending) sessionStorage.removeItem("cc:pending_name");
  }, [profileQ.data]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const payload = {
        ...form,
        gender: form.gender || null,
        dob: form.dob || null,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
      };
      const res = await updateProfile({ data: payload });
      toast.success(`Profile saved (${res.completion}% complete)`);
      qc.invalidateQueries({ queryKey: ["my-profile"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
      const { error } = await supabase.storage.from("profile-photos").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
      const isPrimary = (profileQ.data?.photos.length ?? 0) === 0;
      await supabase.from("profile_photos").insert({
        user_id: user.id, url: data.publicUrl, is_primary: isPrimary,
      });
      toast.success("Photo uploaded");
      qc.invalidateQueries({ queryKey: ["my-profile"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (id: string, url: string) => {
    try {
      const path = url.split("/profile-photos/")[1];
      if (path) await supabase.storage.from("profile-photos").remove([path]);
      await supabase.from("profile_photos").delete().eq("id", id);
      qc.invalidateQueries({ queryKey: ["my-profile"] });
    } catch (e) {
      toast.error("Could not remove photo");
    }
  };

  const uploadHoroscope = async (file: File) => {
    if (!user) return;
    try {
      const path = `${user.id}/horoscope-${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
      const { error } = await supabase.storage.from("horoscopes").upload(path, file, { upsert: true });
      if (error) throw error;
      set("horoscope_url", path);
      toast.success("Horoscope uploaded — remember to save");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Horoscope upload failed");
    }
  };

  const photos = profileQ.data?.photos ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-cream">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-maroon hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="rounded-3xl bg-cream border border-gold/40 shadow-card p-6 sm:p-8">
            <h1 className="font-display text-3xl text-maroon-deep">Your matrimonial profile</h1>
            <p className="text-sm text-maroon-deep/70 mt-1">All fields help families find a great match.</p>

            {/* Photos */}
            <section className="mt-6">
              <h2 className="font-display text-xl text-maroon-deep mb-3">Photos</h2>
              <div className="flex flex-wrap gap-3">
                {photos.map((p) => (
                  <div key={p.id} className="relative h-24 w-24 rounded-xl overflow-hidden border-2 border-gold/40">
                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => removePhoto(p.id, p.url)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-maroon-deep/80 text-cream flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {p.is_primary && (
                      <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-saffron text-maroon-deep font-semibold">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
                <label className="h-24 w-24 rounded-xl border-2 border-dashed border-gold/50 flex flex-col items-center justify-center cursor-pointer hover:bg-gold/10 text-maroon">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  <span className="text-[10px] mt-1">Add photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadPhoto(f);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </section>

            <form onSubmit={onSave} className="mt-8 space-y-6">
              <Section title="Basic details">
                <Field label="Full name" required>
                  <Input value={form.full_name} onChange={(v) => set("full_name", v)} />
                </Field>
                <Field label="Gender">
                  <select
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value as FormState["gender"])}
                    className={inputCls}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </Field>
                <Field label="Date of birth">
                  <input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Height (cm)">
                  <Input type="number" value={form.height_cm} onChange={(v) => set("height_cm", v)} />
                </Field>
                <Field label="Community">
                  <Input value={form.community} onChange={(v) => set("community", v)} />
                </Field>
                <Field label="Phone">
                  <Input value={form.phone} onChange={(v) => set("phone", v)} />
                </Field>
              </Section>

              <Section title="Education & profession">
                <Field label="Education"><Input value={form.education} onChange={(v) => set("education", v)} /></Field>
                <Field label="Profession"><Input value={form.profession} onChange={(v) => set("profession", v)} /></Field>
                <Field label="Salary range"><Input value={form.salary_range} onChange={(v) => set("salary_range", v)} placeholder="e.g. 10–15 LPA" /></Field>
              </Section>

              <Section title="Location">
                <Field label="City"><Input value={form.city} onChange={(v) => set("city", v)} /></Field>
                <Field label="District"><Input value={form.district} onChange={(v) => set("district", v)} /></Field>
                <Field label="State"><Input value={form.state} onChange={(v) => set("state", v)} /></Field>
              </Section>

              <Section title="About & expectations" cols={1}>
                <Field label="About yourself">
                  <textarea rows={3} value={form.about} onChange={(e) => set("about", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Partner expectations">
                  <textarea rows={3} value={form.expectations} onChange={(e) => set("expectations", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Family details">
                  <textarea rows={3} value={form.family_details} onChange={(e) => set("family_details", e.target.value)} className={inputCls} />
                </Field>
              </Section>

              <Section title="Horoscope" cols={1}>
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gold/15 border border-gold/40 text-maroon font-medium cursor-pointer hover:bg-gold/25">
                    <Upload className="h-4 w-4" /> Upload horoscope (PDF/Image)
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadHoroscope(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {form.horoscope_url && (
                    <p className="mt-2 text-xs text-maroon-deep/70 truncate">✓ {form.horoscope_url.split("/").pop()}</p>
                  )}
                </div>
              </Section>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-full bg-gradient-royal text-cream font-semibold shadow-maroon disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border-2 border-gold/30 bg-white text-maroon-deep placeholder:text-maroon/40 focus:border-saffron focus:ring-2 focus:ring-saffron/30 outline-none";

function Input({
  value, onChange, type = "text", placeholder,
}: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input
      type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)} className={inputCls}
    />
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-maroon mb-1.5">
        {label}{required && <span className="text-saffron"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Section({ title, children, cols = 2 }: { title: string; children: React.ReactNode; cols?: 1 | 2 }) {
  return (
    <div>
      <h2 className="font-display text-xl text-maroon-deep mb-3 pb-2 border-b border-gold/30">{title}</h2>
      <div className={`grid gap-4 ${cols === 2 ? "sm:grid-cols-2" : ""}`}>{children}</div>
    </div>
  );
}
