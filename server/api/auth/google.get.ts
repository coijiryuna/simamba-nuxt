export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    // Get origin dengan force HTTPS di production
    const proto = getHeader(event, 'x-forwarded-proto') || 'https'
    const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
    // Force https di production
    const finalProto = process.env.NODE_ENV === 'production' ? 'https' : proto
    const origin = `${finalProto}://${host}`
    
    console.log('[OAuth Origin]', { proto, finalProto, host, origin })
    const db = getDb();
    const email = user.email;

    try {
      const [rows]: any = await db.query(
        "SELECT ID as id, display_name as name, role FROM tbl_users WHERE user_email = ? AND user_status = 0",
        [email],
      );

      if (rows.length === 0) {
        return sendRedirect(event, "/login?error=unauthorized");
      }

      const dbUser = rows[0];

      await setUserSession(event, {
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: email,
          role: dbUser.role,
        },
        loggedInAt: new Date().toISOString(),
      });

      return sendRedirect(event, "/admin");
    } catch (error) {
      console.error("Google Auth Error:", error);
      return sendRedirect(event, "/login?error=server_error");
    }
  },
  onError(event, error) {
    console.error("Google OAuth Error:", error);
    // Log dengan debug info
    const proto = getHeader(event, 'x-forwarded-proto') || 'https'
    const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
    const finalProto = process.env.NODE_ENV === 'production' ? 'https' : proto
    console.log("[OAuth Error Debug]", {
      expectedCallback: `${finalProto}://${host}/api/auth/google/callback`,
      proto,
      finalProto,
      host,
      errorMessage: (error as any)?.message,
    });
    const msg = encodeURIComponent((error as any)?.message || String(error));
    return sendRedirect(event, `/login?error=oauth_failed&detail=${msg}`);
  },
});
