<script lang="ts">
	// import Decimal from 'decimal.js';
	import PlayingCardGroup from "$lib/components/PlayingCardGroup.svelte";
	import Rules from "$lib/utils/rules";
	import { page } from "$app/stores";

	import { get, writable, type Writable } from "svelte/store";
	import { CardSet, CardGroup } from "$lib/utils/deck";
	import { onDestroy, onMount } from "svelte";
	import Check from "./icons/Check.svelte";
	import Connection, { username } from "$lib/utils/comm";
	import { goto } from "$app/navigation";
	import ChatBox from "./ChatBox.svelte";

	export let CardSets: CardGroup = new CardGroup();
	// export const cardStore: Writable<CardSet[]> = writable(CardSets);
	export const cardStore: Writable<CardGroup> = writable(CardSets);
	export const handStore: Writable<CardGroup> = writable(new CardGroup());
	let postSurface = writable(() => {});
	export let hand = true;
	let liftedCard: string = "";
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
			function internalCardClick(m?) {
				if (liftedCard == i) {
					if (Date.now() - mouseTime < 200 * 1) {
						cardStore.update((cc) => {
							cc.cards[i].flipped = !cc.cards[i]?.flipped;
							conn.flipCard(i, cc.cards[i]?.flipped);
							return cc;
						});
					}
					conn.moveCard(
						liftedCard,
						$cardStore.cards[liftedCard].x,
						$cardStore.cards[liftedCard].y,
						false
					);
					liftedCard = "";
				} else {
					highestZ += 1;
					cardStore.update((cc) => {
						cc.cards[i].z = highestZ;
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
					cc.cards[i].z = highestZ;
					return cc;
				});
				liftedCard = "";
				mouseTime = Date.now();
			}, 1);
			return () => {};
		}
	}

	function handleCardButtonClick(i) {
		function internalHandleCardButtonClick(cardIndex: number) {
			if (Rules.splitCards($cardStore.cards[i])) {
				cardStore.update((cc) => {
					const clickedCardSet = cc.cards[i];
					const popCard = clickedCardSet.cards.splice(cardIndex, 1);
					cc.cards[i] = clickedCardSet;
					const nextLiftedCard = cc.combine(
						new CardSet(
							popCard,
							clickedCardSet.x,
							clickedCardSet.y,
							highestZ,
							clickedCardSet.flipped
						)
					);
					conn.splitCards(i, highestZ, nextLiftedCard[0], cardIndex);
					setTimeout(() => {
						liftedCard = nextLiftedCard[0];
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
			cardStore.update((cc) => {
				newState = !cc.cards[i].locked;
				cc.cards[i].locked = newState;
				conn.lockCard(i, newState);
				return cc;
			});
			return newState;
		}
		return innerHandleCardLockClick;
	}

	function euclidean(
		element: { x?: number; y?: number },
		comparisons: { [key: string]: { x?: number; y?: number } }
	) {
		let distances: { distance: number; i: string; dir: number }[] = [];
		for (let [key, value] of Object.entries(comparisons)) {
			if (value?.x) {
				const calc = Math.sqrt(
					(+element?.x - +value?.x) ** 2 +
						(+element?.y - +value?.y) ** 2
				);
				if (calc != 0) {
					distances.push({
						distance: calc,
						i: key,
						dir: +element?.x - +value?.x,
					});
				}
			}
		}
		return distances;
	}

	function unitCirclePoints(n = 2, index: number) {
		if (n == 1) {
			n = 2;
		}
		const tau = Math.PI * 2;
		const angel = tau / n;
		return {
			x: Math.cos(angel * index - tau / 4),
			y: Math.sin(angel * index - tau / 4),
		};
	}

	function rotatePoint(
		point: { x: number; y: number },
		i?,
		n?,
		options: { invert?: boolean; adjust?: boolean; angel?: number } = {}
	) {
		const tau = Math.PI * 2;
		let { invert = false, adjust = true, angel = (tau / n) * i } = options;
		let { x, y } = point;
		if (adjust) {
			x -= 0.5;
			y -= 0.5;
		}
		// return {x: x - 0.5, y: y - 0.5};
		if (invert) {
			return {
				x: x * Math.cos(angel) + y * Math.sin(angel) + 0.5 * +adjust,
				y: -x * Math.sin(angel) + y * Math.cos(angel) + 0.5 * +adjust,
			};
		}
		return {
			x: x * Math.cos(angel) - y * Math.sin(angel) + 0.5 * +adjust,
			y: x * Math.sin(angel) + y * Math.cos(angel) + 0.5 * +adjust,
		};
	}

	function drawCards(n) {
		cardStore.update((cc) => {
			const draws = cc.cards[0].draw(n);
			console.log(draws);
			const newIndex = cc.combine(draws)[0];
			cc.cards[newIndex].y = 0.55;
			cc.cards[newIndex].flipped = true;

			return cc;
		});
	}

	const conn: Connection = new Connection(gameID);
	const connectedUsers = conn.connectedUsers;
	conn.cardStore = cardStore;
	conn.handStore = handStore;
	let lastMoveUpdate = Date.now();
	onMount(function () {
		document.onmousemove = (m) => {
			if (liftedCard != "") {
				const theXCoord =
					m.x / document.getElementById("playingSurface").offsetWidth;
				const theYCoord =
					(m.y -
						document.getElementById("playingSurface").offsetTop) /
					document.getElementById("playingSurface").offsetHeight;
				const { x, y } = rotatePoint(
					{ x: theXCoord, y: theYCoord },
					userIndex,
					numConnected,
					{ invert: true }
				);
				cardStore.update((cc) => {
					cc.cards[liftedCard].x = x;
					cc.cards[liftedCard].y = y;
					if (Date.now() - lastMoveUpdate > 75) {
						conn.moveCard(liftedCard, x, y, true);
						lastMoveUpdate = Date.now();
					}
					return cc;
				});
				if (theYCoord < 0.845) {
					let euc = euclidean(
						$cardStore.cards[liftedCard],
						$cardStore.cards
					);
					euc = euc.sort((a, b) => a.distance - b.distance);
					// console.log(euc)
					const closest = euc[0];
					if (
						closest?.distance < 0.025 &&
						Rules.combineCards(
							$cardStore.cards[liftedCard],
							$cardStore.cards[closest.i]
						) && (Date.now() - mouseTime) > 450
					) {
						cardStore.update((cc) => {
							let to;
							let from;
							const dir = closest.dir > 0 || cc.cards[closest.i].locked;
							if (dir) {
								to = closest.i;
								from = liftedCard;
							} else {
								from = closest.i;
								to = liftedCard;
							}
							console.log(from + " to " + to);
							cc.cards[to].add(cc.remove(from)[0]);
							conn.combineCards(to, from);
							return cc;
						});
						console.log(liftedCard)
						liftedCard = "";
						console.log(liftedCard)
					}
				}
			}
			// $username = "Hello"
		};

		setInterval(() => {
			ButtonTime = Date.now();
		});

		if (($username == null || $username == "") && hand) {
			$username = localStorage.getItem("username");
			if ($username == null || $username == "") {
				// @ts-ignore
				window.location = "/";
			}
		}
		if (hand) {
			conn.connect();
			conn.onchat = chatbox.onchat;
			postSurface.update(() => {
				return () => conn.postSurface();
			});
			console.log(conn);
		}
		// conn.sendMessage("Hello World")$
		let onBeforeUnLoadEvent = false;
		window.onunload = window.onbeforeunload = () => {
			if (!onBeforeUnLoadEvent) {
				onBeforeUnLoadEvent = true;
				if (hand && conn) {
					conn.destroy();
				}
			}
		};
	});

	let numConnected = 1;
	let userIndex = 0;
	let points = [];

	const unsubscribe_ConnectedUsers = connectedUsers.subscribe((val) => {
		numConnected = val.length ? val.length : 1;
		userIndex = numConnected ? val.indexOf($username) : 0;
		const pointsOnCircle = [];
		const scalingFactor = 1.1;
		for (let i = 0; i < numConnected; i++) {
			const point = rotatePoint(unitCirclePoints(numConnected, i), 1, 1, {
				angel: ((Math.PI * 2) / numConnected) * userIndex + Math.PI,
				adjust: false,
			});
			// const point = unitCirclePoints(numConnected, i);
			pointsOnCircle.push({
				x: ((point.x + scalingFactor) * 50) / scalingFactor,
				y: ((point.y + scalingFactor) * 50) / scalingFactor,
				username: val[i],
			});
		}
		points = pointsOnCircle;
	});

	onDestroy(() => conn.destroy());
	onDestroy(unsubscribe_ConnectedUsers);
</script>

<div id="playingSurface" class="relative w-full h-full overflow-hidden">
	{#each Object.entries($cardStore.cards) as [key, cardSet]}
		<div
			class="absolute cursor-move"
			style="
				top: calc({cardSet?.y
				? rotatePoint(
						{
							x: cardSet?.x ? cardSet.x : 47.5,
							y: cardSet.y,
						},
						userIndex,
						numConnected
				  ).y * 100
				: hand
				? 35
				: 0}% - {cardSet?.y ? 10.5 / 2 : hand ? 0 : -17}rem);
				left: calc({cardSet?.x
				? rotatePoint(
						{ y: cardSet?.y ? cardSet.y : 35, x: cardSet.x },
						userIndex,
						numConnected,
						{ invert: false }
				  ).x * 100
				: 45}% - {cardSet?.x
				? 7.5 / 2 +
				  0.3 * (cardSet.cards.length - 1) * Number(!cardSet.locked)
				: 0}rem);
				z-index: {cardSet?.z ? cardSet.z : 0};
			"
			on:click={handleCardClick(key)}
		>
			<PlayingCardGroup
				cards={cardSet}
				lifted={liftedCard == key}
				flipped={cardSet?.y &&
				cardSet?.x &&
				rotatePoint(
					{ y: cardSet.y, x: cardSet.x },
					userIndex,
					numConnected
				).y > 0.8
					? true
					: cardSet?.flipped
					? cardSet?.flipped
					: cardSet?.flipped == null
					? null
					: false}
				handleButtonClick={handleCardButtonClick(key)}
				handleLockClick={handleCardLockClick(key)}
				hand={!cardSet.locked}
				stack={cardSet.locked}
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

		<div
			class="absolute bottom-6 right-6 flex flex-col space-y-8"
			style="z-index: 10000;"
		>
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
		<div
			class="absolute bottom-6 left-6 flex flex-col space-y-8"
			style="z-index: 10000;"
		>
			<ChatBox
				on:message={(msg) => conn.say(msg.detail.value)}
				chat={conn.chat}
				bind:this={chatbox}
			/>
		</div>
	{/if}
	{#if hand}
		{#each points as point, i}
			<div
				class="absolute text-center"
				style="top: {point.y}%; left: {point.x}%;"
			>
				{#if handStore[point.username]}
					<PlayingCardGroup cards={handStore[i]} flipped={false} />
				{/if}
				{point.username}
			</div>
		{/each}
	{/if}
</div>
