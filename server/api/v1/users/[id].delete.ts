export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');

  if (id === '1') {
    throw createError({ statusCode: 403, statusMessage: 'Cannot delete the main administrator' });
  }

  try {
    await db.query('DELETE FROM tbl_users WHERE ID = ?', [id]);
    return { status: 'success', message: 'User deleted successfully' };
  } catch (error: any) {
    console.error('Delete User Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
