export function buildOtpEmail(otp: string) {
  const html = `<!doctype html><html><body style="margin:0;background:#fbf6ec;font-family:Georgia,serif;padding:32px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8d9b0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#6b1414,#a51d1d);padding:28px;text-align:center;color:#f5d77a">
        <div style="font-size:13px;letter-spacing:4px;text-transform:uppercase;opacity:.85">Chettiar Connect</div>
        <div style="font-size:26px;margin-top:6px;font-weight:600">Verification Code</div>
      </div>
      <div style="padding:32px;text-align:center;color:#3d0f0f">
        <p style="margin:0 0 18px;font-size:15px;color:#5a2a2a">Use this code to sign in. It expires in 5 minutes.</p>
        <div style="display:inline-block;font-size:38px;letter-spacing:14px;font-weight:700;color:#6b1414;background:#fbf3df;border:1px dashed #d4af37;border-radius:12px;padding:18px 24px">${otp}</div>
        <p style="margin:24px 0 0;font-size:12px;color:#8a6a3a">If you didn't request this, you can safely ignore the email.</p>
      </div>
      <div style="background:#fbf3df;padding:16px;text-align:center;font-size:12px;color:#8a6a3a">Sacred bonds, woven in gold.</div>
    </div></body></html>`;
  return { html, subject: "Your Chettiar Connect verification code" };
}
