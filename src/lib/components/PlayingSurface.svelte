<script lang="ts">
	// import Decimal from 'decimal.js';
	import PlayingCardGroup from "$lib/components/PlayingCardGroup.svelte";
	import Rules from "$lib/utils/rules";
	import { page } from "$app/stores";

	import { get, writable, type Writable } from "svelte/store";
	import { CardGroup } from "$lib/utils/deck";
	import { onDestroy, onMount } from "svelte";
	import Check from "./icons/Check.svelte";
	import Connection, { username } from "$lib/utils/comm";
	import { goto } from "$app/navigation";
	import ChatBox from "./ChatBox.svelte";

	export let cardGroups: CardGroup[] = [];
	export const cardStore: Writable<CardGroup[]> = writable(cardGroups);
	let postSurface = writable(() => {});
	export let hand = true;
	let liftedCard = -1;
	let highestZ = 1;
	let mouseTime = 0;
	let x = 0;
	let y = 0;
	export let motion = false;
	let turnButtonHover = false;
	let drawButton = true;
	let drawValue = "";
	let chatbox;
	const gameID = $page.params["gameID"];

	const startTime = Date.now();
	let ButtonTime = Date.now();

	function handleCardClick(i, stop = null) {
		if (stop == null) {
			function internalCardClick(m) {
				if (liftedCard == i) {
					if (Date.now() - mouseTime < 200 * 1) {
						cardStore.update((cc) => {
							cc[i].flipped = !cc[i]?.flipped;
							conn.flipCard(i, cc[i]?.flipped);
							return cc;
						});
					}
					conn.moveCard(liftedCard, $cardStore[liftedCard].x, $cardStore[liftedCard].y, false);
					liftedCard = -1;
				} else {
					highestZ += 1;
					cardStore.update((cc) => {
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
				cardStore.update((cc) => {
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
			if (Rules.splitCards($cardStore[i])) {
				cardStore.update((cc) => {
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
				conn.splitCards(i, highestZ);
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
			cardStore.update((cc) => {
				newState = !cc[i].locked;
				cc[i].locked = newState;
				conn.lockCard(i, newState);
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
				const calc = Math.sqrt(
					(+element?.x - +em?.x) ** 2 + (+element?.y - +em?.y) ** 2
				);
				if (calc != 0) {
					distances.push({
						distance: calc,
						i: its,
						dir: +element?.x - +em?.x,
					});
				}
			}
			its += 1;
		}
		return distances;
	}

	function drawCards(n) {
		cardStore.update((cc) => {
			const draws = cc[0].draw(n);
			console.log(draws);
			const newIndex = cc.push(draws);
			cc[newIndex - 1].y = 0.55;
			cc[newIndex - 1].flipped = true;

			return cc;
		});
	}

	let conn: Connection = new Connection(gameID);
	conn.cardStore = cardStore;
	let lastMoveUpdate = Date.now()
	onMount(function () {

		document.onmousemove = (m) => {
			if (liftedCard != -1) {
				const theXCoord = m.x /
						document.getElementById("playingSurface").offsetWidth;
				const theYCoord =
					(m.y -
						document.getElementById("playingSurface").offsetTop) /
					document.getElementById("playingSurface").offsetHeight;
				cardStore.update((cc) => {
					cc[liftedCard].x = theXCoord;
					cc[liftedCard].y = theYCoord;
					if (Date.now() - lastMoveUpdate > 105) {
						conn.moveCard(liftedCard, theXCoord, theYCoord, true);
						lastMoveUpdate = Date.now()
					}
					return cc;
				});
				if (theYCoord < 0.845) {
					let euc = euclidean($cardStore[liftedCard], $cardStore);
					euc = euc.sort((a, b) => a.distance - b.distance);
					const closest = euc[0];
					if (
						closest?.distance < 0.02 &&
						Rules.combineCards(
							$cardStore[liftedCard],
							$cardStore[closest.i]
						)
					) {
						console.log(closest);
						cardStore.update((cc) => {
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
							console.log(from + " to " + to);
							cc[to].add(cc.splice(from, 1)[0]);
							conn.combineCards(to, from);
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
			$username = localStorage.getItem("username");
			if ($username == null || $username == "") {
				goto("/");
			}
		}
		if (hand) {
			conn.connect();
			conn.onchat = chatbox.onchat;
			postSurface.update(() => {return () => conn.postSurface()});
			console.log(conn);
		}
		// conn.sendMessage("Hello World")$
	});

	onDestroy(() => {
		if (hand && conn) {
			conn.destroy();
		}
	});
</script>

<div id="playingSurface" class="relative w-full h-full overflow-hidden">
	{#each $cardStore as cardGroup, i}
		<div
			class="absolute cursor-move"
			class:transition-all={liftedCard == i}
			class:duration-100={liftedCard == i}
			style="
				top: calc({cardGroup?.y ? cardGroup.y * 100 : 0}% - {cardGroup?.y
				? 10.5 / 2
				: (hand ? 0 : -17)}rem + {cardGroup?.y ? 0 : (hand ? 35 : 0)}%);
				left: calc({cardGroup?.x ? cardGroup.x * 100 : 0}% - {cardGroup?.x
				? 7.5 / 2 +
				  0.3 * (cardGroup.cards.length - 1) * Number(!cardGroup.locked)
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
		<div
			id="botBar"
			class="absolute bg-gray-200 h-[1px] w-full bottom-[20%]"
		/>
		<div
			id="botBar"
			class="absolute bg-green-800 h-[1px] w-full bottom-[16.5%]"
		/>

		<div class="absolute bottom-[20.2%] right-4 text-white">
			{$username}
		</div>

		<div class="absolute bottom-6 right-6 flex flex-col space-y-8">
			{#if drawButton}
				<input
					id="forwardTurn"
					placeholder="Drw"
					class="flex h-10 w-10  rounded-md place-content-center items-center bg-gray-100 text-black text-center"
					bind:value={drawValue}
					on:keypress={(v) => {
						if (v.keyCode == 13) {
							if (Number(drawValue)) {
								drawButton = false;
								drawCards(Number(drawValue));
								$postSurface();
							}
						}
					}}
				/>
			{/if}

			<button
				id="forwardTurn"
				class="flex h-10 w-10 rounded-md place-content-center items-center bg-gray-100 text-green-600 hover:bg-white hover:text-green-700"
				on:mouseenter={() => (turnButtonHover = true)}
				on:mouseleave={() => (turnButtonHover = false)}
				on:click={$postSurface}
			>
				{#if turnButtonHover}
					<Check size={1.5} strokeWidth={3} />
				{:else}
					{(Math.round((ButtonTime - startTime) / 100) / 10).toFixed(
						1
					)}
				{/if}
			</button>
		</div>
		<div class="absolute bottom-6 left-6 flex flex-col space-y-8">
			<ChatBox
				on:message={(msg) => conn.say(msg.detail.value)}
				chat={conn.chat}
				bind:this={chatbox}
			/>
		</div>
	{/if}
</div>
