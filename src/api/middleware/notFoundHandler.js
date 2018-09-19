module.exports = async ({ request, notFound }) => {
  const { method, path } = request
  notFound({ message: `No endpoint matched your request: ${method} ${path}` })
}
