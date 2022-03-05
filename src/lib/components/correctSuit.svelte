<script lang="ts">
	// playing cards dims: 2.5 inches x 3.5 inches

	import Heart from '$lib/components/icons/Heart.svelte';
	import Spade from '$lib/components/icons/Spade.svelte';
	import Club from '$lib/components/icons/Club.svelte';
	import Diamond from '$lib/components/icons/Diamond.svelte';

	export let cardSuit: string;
	export let size: number | string = 1;
	export let strokeWidth: number | string = 2;
</script>

<i>
	{#if cardSuit == 'heart'}
		<Heart {size} {strokeWidth} />
	{:else if cardSuit == 'spade'}
		<Spade {size} {strokeWidth} />
	{:else if cardSuit == 'club'}
		<Club {size} {strokeWidth} />
	{:else if cardSuit == 'diamond'}
		<Diamond {size} {strokeWidth} />
	{/if}
</i>
