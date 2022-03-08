<script lang="ts">
	// playing cards dims: 2.5 inches x 3.5 inches

	import { createEventDispatcher } from "svelte";
	import { get } from "svelte/store";
	import CorrectSuit from "./correctSuit.svelte";
	import Joker from "./icons/Joker.svelte";
	import Lock from "./icons/Lock.svelte";
	import Multiple from "./icons/Multiple.svelte";

	export let cardValue = 9;
	export let cardSuit = "heart";
	export let cardFlipped = true;
	export let cardRaised = false;
	export let button = false;
	export let locked = false;

	const cardNames = { 1: "A", 11: "J", 12: "Q", 13: "K", 0: "Joker" };
	const dispatch = createEventDispatcher();

	const cardColors = {
		heart: "red",
		diamond: "red",
		spade: "black",
		club: "black",
	};

	$: color = cardColors[cardSuit]
		? cardFlipped
			? cardColors[cardSuit]
			: "black"
		: "black";

	let cardHover = false;
	let lock;
</script>

<div
	class="relative bg-gray-100 {cardRaised
		? 'shadow-2xl'
		: 'shadow-sm'} rounded-sm select-none"
	style="width:7.5rem; height:10.5rem;"
	class:text-red-500={color == "red"}
	class:text-black={color != "red"}
	on:mouseenter={() => (cardHover = true)}
	on:mouseleave={() => (cardHover = false)}
	on:click={() => {dispatch("card");}}
>
	{#if cardFlipped}
		<div
			class="grid grid-cols-2 place-content-between h-full w-full text-center"
		>
			<div
				class="place-self-start px-1.5"
				class:py-1={cardValue != 0}
				class:py-4={cardValue == 0}
				class:-mx-2={cardValue == 0}
				class:rotate-90={cardValue == 0}
			>
				<!-- Top Left -->
				{cardNames[cardValue] ? cardNames[cardValue] : cardValue}

				<CorrectSuit {cardSuit} strokeWidth="2.5" />
			</div>
			<!-- Top Right-->
			{#if !button}
				<div
					class="self-start justify-self-end mx-1.5 px-1 my-1.5 py-1 hover:bg-gray-300 rounded-lg cursor-pointer transition-all"
					class:opacity-0={!cardHover || cardRaised}
					class:opacity-100={cardHover && !cardRaised}
					on:click={cardHover && !cardRaised
						? () => {
								dispatch("lock");
								lock.state.set(+!get(lock.state));
						  }
						: () => {}}
				>
					<Lock closed={locked} bind:this={lock} />
				</div>
			{:else}
				<div />
			{/if}
			<div>
				<!-- Bottom Left -->
			</div>
			<div
				class="place-self-end px-1.5"
				class:py-1={cardValue != 0}
				class:py-4={cardValue == 0}
				class:-mx-2={cardValue == 0}
				class:rotate-90={cardValue == 0}
			>
				<!-- Bottom Right -->
				<div class="rotate">
					<CorrectSuit {cardSuit} strokeWidth="2.5" />
				</div>
				{#if cardValue != 0}
					<div class="rotate">
						{cardNames[cardValue]
							? cardNames[cardValue]
							: cardValue}
					</div>
				{:else}
					<div class="rotate-180">
						{cardNames[cardValue]
							? cardNames[cardValue]
							: cardValue}
					</div>
				{/if}
			</div>
		</div>
		<!-- Decoration -->
		{#if cardValue == 1}
			<div class="absolute top-12 left-7">
				<CorrectSuit {cardSuit} size="4" strokeWidth="2.5" />
			</div>
		{:else if cardValue == 11}
			<div
				class="absolute left-8 -rotate-45 text-xl font-bold"
				style="top: 4.3rem;"
			>
				Jack
			</div>
		{:else if cardValue == 12}
			<div
				class="absolute left-6 -rotate-45 text-xl font-bold"
				style="top: 4.3rem;"
			>
				Queen
			</div>
		{:else if cardValue == 13}
			<div
				class="absolute left-9 -rotate-45 text-xl font-bold"
				style="top: 4.3rem;"
			>
				King
			</div>
		{:else if cardValue == 0}
			<div
				class="absolute left-1.5 text-xl font-bold animate-bounce"
				style="top: 3rem;"
			>
				<Joker size={6.6} />
			</div>
		{:else if cardValue == 10}
			<div
				class="absolute left-5 -rotate-45 text-xl font-bold"
				style="top: 4.2rem;"
			>
				<div class="flex flex-row">
					<div>
						{cardValue} x
					</div>
					<div class="pl-1 -mt-0.5">
						<CorrectSuit {cardSuit} size="2" strokeWidth="2.3" />
					</div>
				</div>
			</div>
		{:else}
			<div
				class="absolute left-7 -rotate-45 text-xl font-bold"
				style="top: 4.2rem;"
			>
				<div class="flex flex-row">
					<div>
						{cardValue} x
					</div>
					<div class="pl-1 -mt-0.5">
						<CorrectSuit {cardSuit} size="2" strokeWidth="2.3" />
					</div>
				</div>
			</div>
		{/if}
		{#if button && !cardRaised}
			<div
				class="absolute w-20 h-24 top-1/2 left-1/2 -mt-12 -ml-10 hover:bg-black rounded-lg cursor-pointer transition-all opacity-10"
				class:opacity-0={!cardHover || cardRaised}
				class:opacity-100={cardHover && !cardRaised}
				class:text-blue-700={locked}
				on:click={cardHover && !cardRaised
					? () => dispatch("group")
					: () => {}}
			/>
		{/if}
	{:else}
		<div
			class="absolute left-3 -rotate-45 text-xl font-bold"
			style="top: 4.3rem;"
		>
			Cardback
		</div>
		{#if button && !cardRaised}
			<div
				class="absolute w-20 h-24 top-1/2 left-1/2 -mt-12 -ml-10 hover:bg-black rounded-lg cursor-pointer transition-all opacity-10"
				class:opacity-0={!cardHover || cardRaised}
				class:opacity-100={cardHover && !cardRaised}
				class:text-blue-700={locked}
				on:click={cardHover && !cardRaised
					? () => dispatch("group")
					: () => {}}
			/>
		{/if}
	{/if}
</div>

<style lang="postcss">
	@keyframes rotate {
		from {
			transform: rotate(0);
			opacity: 1;
		}
		to {
			transform: rotate(180deg);
			opacity: 1;
		}
	}

	.rotate {
		animation: rotate 1s cubic-bezier(0, 0, 0.2, 1) 1;
		transform: rotate(180deg);
	}
</style>
