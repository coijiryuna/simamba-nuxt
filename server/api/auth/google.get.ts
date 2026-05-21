export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    const db = getDb();
    const email = user.email;

    try {
      const [rows]: any = await db.query(
        'SELECT ID as id, display_name as name, role FROM tbl_users WHERE user_email = ? AND user_status = 0',
        [email]
      );

      if (rows.length === 0) {
        return sendRedirect(event, '/login?error=unauthorized');
      }

      const dbUser = rows[0];

      await setUserSession(event, {
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: email,
          role: dbUser.role
        },
        loggedInAt: new Date().toISOString()
      });

      return sendRedirect(event, '/admin');
    } catch (error) {
      console.error('Google Auth Error:', error);
      return sendRedirect(event, '/login?error=server_error');
    }
  },
  onError(event, error) {
    console.error('Google OAuth Error:', error);
    const msg = encodeURIComponent((error as any)?.message || String(error));
    return sendRedirect(event, `/login?error=oauth_failed&detail=${msg}`);
  }
});
