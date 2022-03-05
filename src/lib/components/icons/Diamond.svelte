<script lang="ts">
	export let size: number | string = 1;
	export let strokeWidth: number | string = 2;
</script>

<div class="rotat" style="height: {size}rem; width: {size}rem;">
	<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-diamond" width="100%" height="100%" viewBox="0 0 24 24" stroke-width="{strokeWidth}" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
		<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
		<path d="M6 5h12l3 5l-8.5 9.5a0.7 .7 0 0 1 -1 0l-8.5 -9.5l3 -5"></path>
		<path d="M10 12l-2 -2.2l.6 -1"></path>
	 </svg>
</div>
