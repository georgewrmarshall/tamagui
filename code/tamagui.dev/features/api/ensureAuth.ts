import { setupCors } from './cors'
import { getSupabaseServerClient } from './getSupabaseServerClient'
import { redirect } from './redirect'

/**
 * makes a supabase instance for the current user and returns a 401 if there's no user
 */
export const ensureAuth = async ({
  req,
  shouldRedirect = false,
}: {
  req: Request
  shouldRedirect?: boolean
}) => {
  setupCors(req)

  const supabase = getSupabaseServerClient(req)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user

  if (!session || !user) {
    if (shouldRedirect) {
      throw redirect(
        `/login?${new URLSearchParams({
          redirect_to: req.url ?? '',
        }).toString()}`,
        303
      )
    }

    throw Response.json(
      {
        error: 'The user is not authenticated',
      },
      {
        status: 401,
        statusText: `Not authed: ${!session ? 'no session' : ''} ${
          !user ? 'no user' : ''
        }`,
      }
    )
  }

  return { supabase, session, user }
}
