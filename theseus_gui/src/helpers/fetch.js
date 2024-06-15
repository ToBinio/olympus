import { ofetch } from 'ofetch'
import { handleError } from '@/store/state.js'
import { getVersion } from '@tauri-apps/api/app'
import { get as getCreds } from '@/helpers/mr_auth.js'

export const useFetch = async (url, item, isSilent, useAuth = false) => {
  try {
    const version = await getVersion()

    let options = {
      headers: { 'User-Agent': `modrinth/theseus/${version} (support@modrinth.com)` },
    }

    if (useAuth) {
      const credentials = await getCreds().catch(handleError)
      options.headers.Authorization = credentials.session
    }

    return await ofetch(url, options)
  } catch (err) {
    if (!isSilent) {
      handleError({ message: `Error fetching ${item}` })
    }
    console.error(err)
  }
}
