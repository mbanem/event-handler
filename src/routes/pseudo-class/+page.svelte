<script>
	let count = $state(0);
	const changeColorPseudoEle = () => {
		// Selecting the "#box::after" CSS
		// rule from rule list.
		let st1 = document.styleSheets[0].cssRules[1];
		let st2 = document.styleSheets[0].cssRules[2];

		// Change the styles of the pseudo element.
		st1.style.backgroundColor = st1.style.backgroundColor === 'blue' ? 'orangered' : 'blue';
		st2.style.backgroundColor = st2.style.backgroundColor == 'crimson' ? 'darkcyan' : 'crimson';
	};
</script>

<h2 style="color: green;">GeeksforGeeks</h2>

<h3>How to update the CSS properties of pseudo element ::after and ::before using javascript</h3>

<div id="box">Hello Geek!</div>

<br />
<button onclick={changeColorPseudoEle} style="display:block;margin-left:2rem;padding:0 1.5rem;">
	change color
</button><br />
<div class="count" style="--before-count: '{count}';margin-left:2rem;">
	Count as ::before element
</div>
<button
	onclick={() => {
		return count > 0 ? count-- : count;
	}}
	style="margin:0.2rem 0 0 2rem;padding:0;"
>
	decreament
</button>
<button onclick={() => count++} style="margin-left:10px;padding:0;"> increment </button>

<style>
	#box {
		width: max-content;
		height: auto;
		background-color: green;
		padding: 40px;
		color: white;
		font-size: 20px;
		font-weight: 200;
		position: relative;
		margin-left: 300px;
	}

	#box::after {
		position: absolute;
		content: '::after pseudo element';
		top: 0;
		left: 100%;
		padding: 40px;
		color: white;
		width: max-content;
		height: auto;
		background-color: orangered;
		font-size: 20px;
		font-weight: 200;
	}

	#box::before {
		position: absolute;
		content: '::before pseudo element';
		top: 0%;
		right: 100%;
		padding: 40px;
		color: white;
		width: max-content;
		height: auto;
		background-color: darkcyan;
		font-size: 20px;
		font-weight: 200;
	}
	.count {
		position: relative;
		margin-top: 2rem;
		&::before {
			position: absolute;
			top: -1.8rem;
			left: 4rem;
			content: var(--before-count);
			font-size: 24px;
			color: navy;
		}
	}
</style>
