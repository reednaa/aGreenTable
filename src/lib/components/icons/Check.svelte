<script lang="ts">
	export let size: number | string = 1;
	export let strokeWidth: number | string = 2;
</script>

<div style="height: {size}rem; width: {size}rem;">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="icon icon-tabler icon-tabler-check"
		width="100%"
		height="100%"
		viewBox="0 0 24 24"
		stroke-width="{strokeWidth}"
		stroke="currentColor"
		fill="none"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M5 12l5 5l10 -10" />
	</svg>
</div>
