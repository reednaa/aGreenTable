<script lang="ts">
	export let size: number | string = 1;
	export let strokeWidth: number | string = 2;
	export let closed: boolean;
	import { tweened } from 'svelte/motion';

	export const state = tweened(closed ? 1 : 0, { duration: 100 });
</script>

<div style="height: {size}rem; width: {size}rem;">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="icon icon-tabler icon-tabler-lock-open"
		width="100%"
		height="100%"
		viewBox="0 0 24 24"
		stroke-width={strokeWidth}
		stroke="currentColor"
		fill="none"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<rect x="5" y="11" width="14" height="10" rx="2" />
		<circle cx="12" cy="16" r="1" />
		<path d="M8 11v-5a4 4 0 0 1 8 0v{$state * 4}" />
	</svg>
</div>
