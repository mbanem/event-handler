<script lang="ts">
	type TPrismaColumns = Record<string, { type: string; prismaAttrs: string }>;
	function sortRecordByKey<T>(rec: T) {
		const sortedKeys = (
			Object.keys(rec as Record<string, object>) as Array<keyof typeof rec>
		).sort();
		// console.log(sortedKeys);
		const sortedRec = sortedKeys.reduce(
			(acc, key) => {
				acc[key] = rec[key];
				return acc;
			},
			{} as typeof rec
		);

		return sortedRec;
	}
	const unsortedRecord: TPrismaColumns = {
		bravo: { type: 'one', prismaAttrs: 'ONE' },
		alpha: { type: 'two', prismaAttrs: 'TWO' },
		charlie: { type: 'three', prismaAttrs: 'THREE' }
	};
	console.log(sortRecordByKey(unsortedRecord));
</script>
