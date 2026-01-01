// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import * as Types from '$lib/types/types'
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: Types.UserPartial
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { }
