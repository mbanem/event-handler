<!--
@component
-->

<script lang="ts">
	type User = {
		id: string;
		name: string;
		age: number;
		address: {
			street: string;
			city: string;
			zip: number;
		};
	};
	let user: User = {
		id: 'wavfdfvdfb',
		name: 'bane',
		age: 81,
		address: { street: 'Fruskogorska 27', city: 'Pavlovci', zip: 22400 },
	};
	function createUser(usr: Omit<User, 'id'>) {
		user = { id: '1334', ...usr };
		console.log('createUser', user);
	}
	function updateUser(props: Partial<User>) {
		user = { ...user, ...props };
		// for (const p of Object.entries(props)) {
		// 	console.log('updateUser', p);
		// }
	}
	function updateStreet(props: UStreet) {
		user.address.street = props.address.street;
		// for (const p of Object.entries(props)) {
		// 	console.log('updateStreet', p);
		// }
	}
	let userX: User = {
		id: '1',
		name: 'bane',
		age: 81,
		address: { street: 'Fruskogorska 27', city: 'Pavlovci', zip: 22419 },
	};
	createUser(userX);
	// updateUser({ name: 'milivoje' });
	// updateUser({ age: 82 });

	type NestedPick<T, K extends string> = K extends `${infer K1}.${infer K2}`
		? K1 extends keyof T
			? { [P in K1]: NestedPick<T[K1], K2> }
			: never
		: K extends keyof T
			? Pick<T, K>
			: never;

	// Resulting type: { address: { street: string } }
	type UStreet = NestedPick<User, 'address.street'>;
	console.log('before', user);
	setTimeout(() => {
		let str: UStreet = { address: { street: 'Radnicka 27' } };
		updateStreet(str);
		console.log('after', user);
	}, 500);
</script>

<div class="main"></div>

<style lang="scss">
	.main {
		margin: 3rem 0 0 1rem;
		border: 1px solid gray;
		border-radius: 10px;
	}
</style>
