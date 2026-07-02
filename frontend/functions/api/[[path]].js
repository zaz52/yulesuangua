const NETLIFY_API_BASE = 'https://suanguan.netlify.app/api'

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const path = Array.isArray(context.params.path) ? context.params.path.join('/') : context.params.path || ''
  const target = new URL(`${NETLIFY_API_BASE}/${path}`)
  target.search = url.search

  const headers = new Headers()
  const contentType = context.request.headers.get('content-type')
  const authorization = context.request.headers.get('authorization')
  if (contentType) headers.set('content-type', contentType)
  if (authorization) headers.set('authorization', authorization)
  const body = ['GET', 'HEAD'].includes(context.request.method) ? undefined : await context.request.arrayBuffer()

  return fetch(target.toString(), {
    method: context.request.method,
    headers,
    body,
    redirect: 'follow',
  })
}
