<script lang="ts">
	// playing cards dims: 2.5 inches x 3.5 inches

	import PlayingCard from "$lib/components/PlayingCard.svelte";
	import { type Card, CardSet } from "$lib/utils/deck";
	import { onMount } from "svelte";
	import Club from "./icons/Club.svelte";

	export let cards: CardSet = new CardSet();
	export let hand = true;
	export let stack = false;
	export let fan = hand;
	export let flipped = null;
	export let lifted = false;
	export let animate = false;
	export let handleButtonClick = (cardIndex) => {};
	export let handleCardClick = () => {};
	export let handleLockClick = () => {};

	let fannedHand = false;
	onMount(() => {
		fannedHand = true;
	});

	$: fanSize = 80 / (cards.cards?.length ? cards.cards.length : 1);

	function yTranslateModifier(i) {
		if (i > 0) {
			return i * 15 - 7;
		} else if (i < 0) {
			return -i * 5 - 2.5;
		}
		return i;
	}

	function getRotation(i, fanned) {
		if (fanned && hand && fan) {
			return "rotate: " + i * fanSize ** 0.8 + "deg;"; //transform: translateY(" + yTranslateModifier(i)+ "px);";
		}
		return "rotate: " + 0 + "deg;";
	}

	const perExtraCardSpace = 2.5;

	$: fanOut = fan && hand && !fannedHand;
</script>

<div class="relative">
	{#if !stack}
		<div
			class="flex flex-row {fanOut || stack
				? '-space-x-[8rem]'
				: '-space-x-24'}"
		>
			{#each cards?.cards as card, i}
				<div
					class="duration-1000 translate-x-0"
					class:transition-all={animate}
					class:transition-none={!animate}
					style={cards?.cards?.length > 1
						? getRotation(
								i - (cards?.cards?.length - 1) / 2,
								fannedHand
						  )
						: ""}
				>
					<PlayingCard
						cardFlipped={flipped == null ? card?.flipped : flipped}
						cardValue={card.value}
						cardSuit={card.suit}
						cardRaised={lifted}
						button={cards?.cards?.length > 1}
						locked={cards.locked}
						on:group={() => {
							handleButtonClick(i);
						}}
						on:lock={handleLockClick}
						on:card={handleCardClick}
					/>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex flex-row -space-x-[7.5rem]">
			{#each cards.cards as card, i}
				<div class="translate-x-0">
					<PlayingCard
						cardFlipped={flipped == null ? card?.flipped : flipped}
						cardValue={card.value}
						cardSuit={card.suit}
						cardRaised={lifted}
						button={cards?.cards?.length > 1}
						locked={cards.locked}
						on:group={() => {handleButtonClick(i)}}
						on:lock={handleLockClick}
					/>
				</div>
			{/each}
		</div>{/if}

	<!-- <div class="absolute bg-blue-500 opacity-50 h-64 -top-10 -left-16" style="width: {15.5 + perExtraCardSpace * (cards.cards.length - 1)}rem;">

	</div> -->
</div>
