<script lang="ts">
	// import Decimal from 'decimal.js';
	import PlayingCardGroup from '$lib/components/PlayingCardGroup.svelte';
	import Rules from '$lib/utils/rules';
	import { page } from '$app/stores';

	import { get, writable, type Writable } from 'svelte/store';
	import { CardGroup } from '$lib/utils/deck';
	import { onMount } from 'svelte';
	import Check from './icons/Check.svelte';
	import Connection, { username } from '$lib/utils/comm';
	import { goto } from '$app/navigation';

	export let cardGroups: CardGroup[] = [];
	export const store_CardGroup: Writable<CardGroup[]> = writable(cardGroups);
	export let hand = true;
	let liftedCard = -1;
	let highestZ = 1;
	let mouseTime = 0;
	let x = 0;
	let y = 0;
	export let motion = false;
	let turnButtonHover = false;
	let drawButton = true;
	let drawValue = '';
	const gameID = $page.params["gameID"];

	const startTime = Date.now();
	let ButtonTime = Date.now();

	function handleCardClick(i, stop = null) {
		if (stop == null) {
			function internalCardClick(m) {
				if (liftedCard == i) {
					if (Date.now() - mouseTime < 200 * 1) {
						store_CardGroup.update((cc) => {
							cc[i].flipped = !cc[i]?.flipped;
							return cc;
						});
					}
					liftedCard = -1;
				} else {
					highestZ += 1;
					store_CardGroup.update((cc) => {
						cc[i].z = highestZ;
						return cc;
					});
					liftedCard = i;
					mouseTime = Date.now();
				}
			}
			return internalCardClick;
		} else {
			setTimeout(() => {
				highestZ -= 1;
				store_CardGroup.update((cc) => {
					cc[i].z = highestZ;
					return cc;
				});
				liftedCard = -1;
				mouseTime = Date.now();
			}, 1);
			return () => {};
		}
	}

	function handleCardButtonClick(i) {
		function internalHandleCardButtonClick() {
			if (Rules.splitCards($store_CardGroup[i])) {
				store_CardGroup.update((cc) => {
					const clickedCardGroup = cc[i];
					const popCard = clickedCardGroup.cards.pop();
					cc[i] = clickedCardGroup;
					const nextLiftedCard = cc.push(
						new CardGroup(
							popCard,
							clickedCardGroup.x,
							clickedCardGroup.y,
							highestZ,
							clickedCardGroup.flipped
						)
					);
					setTimeout(() => {
						handleCardClick(nextLiftedCard - 1)(null);
					}, 1);
					return cc;
				});
				return true;
			}
			return false;
		}
		return internalHandleCardButtonClick;
	}

	function handleCardLockClick(i) {
		function innerHandleCardLockClick() {
			setTimeout(() => {
				handleCardClick(i, true);
			}, 1);
			let newState: boolean;
			store_CardGroup.update((cc) => {
				newState = !cc[i].locked;
				cc[i].locked = newState;
				return cc;
			});
			console.log(newState);
			return newState;
		}
		return innerHandleCardLockClick;
	}

	function euclidean(
		element: { x?: number; y?: number },
		comparisons: { x?: number; y?: number }[]
	) {
		let distances = [];
		let its = 0;
		for (let em of comparisons) {
			if (em?.x) {
				const calc = Math.sqrt((+element?.x - +em?.x) ** 2 + (+element?.y - +em?.y) ** 2);
				if (calc != 0) {
					distances.push({ distance: calc, i: its, dir: +element?.x - +em?.x });
				}
			}
			its += 1;
		}
		return distances;
	}

	function drawCards(n) {
		store_CardGroup.update(cc => {
			const draws = cc[0].draw(n);
			console.log(draws);
			const newIndex = cc.push(draws);
			cc[newIndex - 1].y = 0.55
			cc[newIndex - 1].flipped = true;

			return cc;
		})
	}
	onMount(function () {
		document.onmousemove = (m) => {
			if (liftedCard != -1) {
				const ofhe =
					(m.y - document.getElementById('playingSurface').offsetTop) /
					document.getElementById('playingSurface').offsetHeight;
				store_CardGroup.update((cc) => {
					cc[liftedCard].x = m.x / document.getElementById('playingSurface').offsetWidth;
					cc[liftedCard].y = ofhe;
					return cc;
				});
				if (ofhe < 0.845) {
					let euc = euclidean($store_CardGroup[liftedCard], $store_CardGroup);
					euc = euc.sort((a, b) => a.distance - b.distance);
					const closest = euc[0];
					if (
						closest?.distance < 0.06 &&
						Rules.combineCards($store_CardGroup[liftedCard], $store_CardGroup[closest.i])
					) {
						console.log(closest);
						store_CardGroup.update((cc) => {
							let to;
							let from;
							const dir = closest.dir > 0 || cc[closest.i].locked;
							if (dir) {
								to = closest.i;
								from = liftedCard;
							} else {
								from = closest.i;
								to = liftedCard;
							}
							console.log(from + ' to ' + to);
							cc[to].add(cc.splice(from, 1)[0]);
							return cc;
						});
						liftedCard = -1;
					}
				}
			}
			// $username = "Hello"
		};

		setInterval(() => {
			ButtonTime = Date.now();
		});

		if ($username == null || $username == "") {
			$username = localStorage.getItem('username');
			if ($username == null || $username == "") {
				goto('/');
			}
		}

		const conn = new Connection(gameID, $username);
		console.log(conn);
		// conn.sendMessage("Hello World")$
	});
</script>

<div id="playingSurface" class="relative w-full h-full overflow-hidden">
	{#each $store_CardGroup as cardGroup, i}
		<div
			class="absolute cursor-move"
			style="
				top: calc({cardGroup?.y ? cardGroup.y * 100 : 0}% - {cardGroup?.y ? 10.5 / 2 : 0}rem + {cardGroup?.x
				? 0
				: 35}%);
				left: calc({cardGroup?.x ? cardGroup.x * 100 : 0}% - {cardGroup?.x
				? 7.5 / 2 + 1 * (cardGroup.cards.length - 1) * Number(!cardGroup.locked)
				: 0}rem + {cardGroup?.x ? 0 : 47.5}%);
				z-index: {cardGroup?.z ? cardGroup.z : 0};
			"
			on:click={handleCardClick(i)}
		>
			<PlayingCardGroup
				cards={cardGroup}
				lifted={liftedCard == i}
				flipped={cardGroup?.flipped
					? cardGroup?.flipped
					: cardGroup?.flipped == null
					? null
					: false}
				handleButtonClick={handleCardButtonClick(i)}
				handleLockClick={handleCardLockClick(i)}
				hand={!cardGroup.locked}
				stack={cardGroup.locked}
				animate={motion}
			/>
		</div>
	{/each}
	{#if hand}
		<div id="botBar" class="absolute bg-gray-200 h-[1px] w-full bottom-[20%]" />
		<div id="botBar" class="absolute bg-green-800 h-[1px] w-full bottom-[16.5%]" />

		<div class="absolute bottom-[20.2%] right-4 text-white">
			{$username}
		</div>

		<div class="absolute bottom-6 right-6 flex flex-col space-y-8">
			{#if drawButton}
				<input
					id="forwardTurn"
					class="flex h-10 w-10  rounded-md place-content-center items-center bg-gray-100 text-black text-center"
					bind:value={drawValue}
					on:keypress={(v) => {
						if (v.keyCode == 13) {
							if (Number(drawValue)) {drawButton = false; drawCards(Number(drawValue));};
						}
					}}
				/>
			{/if}

			<button
				id="forwardTurn"
				class="flex h-10 w-10 rounded-md place-content-center items-center bg-gray-100 text-green-600 hover:bg-white hover:text-green-700"
				on:mouseenter={() => (turnButtonHover = true)}
				on:mouseleave={() => (turnButtonHover = false)}
			>
				{#if turnButtonHover}
					<Check size={1.5} strokeWidth={3} />
				{:else}
					{(Math.round((ButtonTime - startTime) / 100) / 10).toFixed(1)}
				{/if}
			</button>
		</div>
	{/if}
</div>
