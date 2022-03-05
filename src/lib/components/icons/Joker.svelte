<script lang="ts">
	export let size: number | string = 1;
	export let strokeWidth: number | string = 2;
</script>

<div style="height: {size}rem; width: {size}rem;">
	<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-mood-crazy-happy" width="100%" height="100%" viewBox="0 0 24 24" stroke-width="{strokeWidth}" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
		<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
		<circle cx="12" cy="12" r="9"></circle>
		<line x1="7" y1="8.5" x2="10" y2="11.5"></line>
		<path d="M7 11.5l3 -3"></path>
		<line x1="14" y1="8.5" x2="17" y2="11.5"></line>
		<path d="M14 11.5l3 -3"></path>
		<path d="M9.5 15a3.5 3.5 0 0 0 5 0"></path>
	 </svg>
</div>
