export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return await $fetch('/api/v1/posts', {
    query
  });
});
