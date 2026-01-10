<script lang="ts">
	import { lowercaseTypes } from './data';
	// import { UI } from './model';
	import { createModel } from './modelx';
	const model = createModel(lowercaseTypes);
	// console.log('model', model);
	// for (const [k, v] of Object.entries(model)) {
	// 	console.log('(k,v)', k, v);
	// }
	// console.log('getModelTypes', model.getModelTypes());
	// console.log('initialized', model.initialized);
	// console.log('fieldTypes(User)\n', model.fieldTypes('User'));
	// console.log('model(User)\n', model.model('User'));
	// console.log('fieldNames(User)\n', model.fieldNames('User', UI.all));
	// console.log('fieldsWithType(User)\n', model.fieldsWithType('User'));
</script>

<pre>{JSON.stringify(model, null, 2)}</pre>

<style lang="scss">
	pre {
		color: navy;
		font-size: 13px;
		tab-size: 16px;
		width: max-content;
		padding: 0;
		margin: 0;
	}
</style>
