<script lang="ts">
	import PlacedCards from '$lib/components/PlayingCardGroup.svelte';
	import Card from '$lib/components/PlayingCard.svelte';

	import CardDeck from '$lib/utils/deck';
	import PlayingSurface from '$lib/components/PlayingSurface.svelte';
	import { onMount } from 'svelte';
	import { username } from '$lib/utils/comm';
	import { goto } from '$app/navigation';

	const deck = new CardDeck({ shuffle: true });
	const PlayerOne = deck.draw(5);
	PlayerOne.x = 0.5;
	PlayerOne.y = 0.4;
	// const playingDeck = deck.draw();
	// playingDeck.x = 0.52;
	// playingDeck.y = 0.7;

	let gameID = '';

	function inputKeyPressHandler(v) {
		if (v.keyCode == 13) {
			if ($username && gameID) {
				window.localStorage.setItem("username", $username)
				goto('/game/' + gameID);
			}
		}
	}
</script>

<div class="relative w-screen h-screen overflow-hidden">
	<div class="absolute top-0 left-0 w-screen h-screen">
		<PlayingSurface hand={false} cardGroups={[PlayerOne]} motion={true} />
	</div>
	<div class="flex flex-col w-3/4 mx-auto mt-24 items-center justify-center z-10">
		<div class="text-5xl font-bold mb-6 text-white text z-10">A Green Table</div>
		<div class="flex flex-row place-content-evenly space-x-4 max-w-sm">
			<div class="flex flex-row">
				<input
					class="rounded-l-full pl-3 py-0.5 text-center z-10"
					placeholder="Your Name"
					id="Name"
					name="username"
					bind:value={$username}
					on:keydown={inputKeyPressHandler}
				/>
				<input
					class="rounded-r-full pr-3 py-0.5 text-center z-10"
					placeholder="GameID"
					bind:value={gameID}
					on:keydown={inputKeyPressHandler}
				/>
			</div>
			<button
				class="bg-gray-50 rounded-full px-3 py-0.5 text-center hover:bg-gray-300 z-10"
				on:click={() => {inputKeyPressHandler({keyCode: 13})}}>Connect</button
			>
		</div>
	</div>
</div>
