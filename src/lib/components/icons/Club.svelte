<script lang="ts">
	export let size: number | string = 1;
	export let strokeWidth: number | string = 2;
</script>

<div style="height: {size}rem; width: {size}rem;">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="icon icon-tabler icon-tabler-club"
		width="100%"
		height="100%"
		viewBox="0 0 24 24"
		stroke="currentColor"
		stroke-width={strokeWidth}
		fill="none"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path
			d="M12 3a4 4 0 0 1 3.164 6.447a4 4 0 1 1 -1.164 6.198v1.355l1 4h-6l1 -4l.001 -1.355a4 4 0 1 1 -1.164 -6.199a4 4 0 0 1 3.163 -6.446z"
		/>
	</svg>
</div>
