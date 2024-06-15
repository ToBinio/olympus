import { defineStore } from 'pinia'
import { useFetch } from '@/helpers/fetch.js'
import { get as getCreds } from '@/helpers/mr_auth.js'
import { handleError } from '@/store/notifications.js'

export async function useUser(force = false) {
  const user = useUserData()

  if (user.lastUpdated === -1 || force || Date.now() - user.lastUpdated > 300000) {
    await user.load()
  }

  return user
}

// export const userFollowProject = async (project) => {}
//
// export const userUnfollowProject = async (project) => {
//   const user = (await useUser()).value
//
//   user.follows = user.follows.filter((x) => x.id !== project.id)
//   project.followers--
//
//   setTimeout(() => {
//     useBaseFetch(`project/${project.id}/follow`, {
//       method: 'DELETE',
//     })
//   })
// }

const useUserData = defineStore('userStore', {
  state: () => ({
    follows: [],
    lastUpdated: -1,
  }),
  actions: {
    async load() {
      const credentials = await getCreds().catch(handleError)

      if (credentials.user.id) {
        try {
          this.follows = await useFetch(
            `https://api.modrinth.com/v3/user/${credentials.user.id}/follows`,
            undefined,
            false,
            true,
          )

          this.lastUpdated = Date.now()
        } catch (err) {
          handleError(err)
          this.lastUpdated = -1
        }
      }
    },
    async followProject(project) {
      this.follows = this.follows.concat(project)
      project.followers++

      setTimeout(() => {
        useFetch(
          `project/${project.id}/follow`,
          {
            method: 'POST',
          },
          undefined,
          false,
          true,
        )
      })
    },
  },
})
