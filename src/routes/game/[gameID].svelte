<script lang="ts">
    import PlacedCards from "$lib/components/PlayingCardGroup.svelte";
    import Card from "$lib/components/PlayingCard.svelte";
    import { page } from "$app/stores";

    import { CardDeck, CardGroup } from "$lib/utils/deck";
    import CardSurface from "$lib/components/PlayingSurface.svelte";

    const deck = new CardDeck({ shuffle: true, flipped: false });
    // const firstGroup = deck.draw(4);
    // const secondGroup = deck.draw(0);
    const PlayerZero = deck.draw();
    PlayerZero.locked = true;
    const gameID = $page.params["gameID"];
</script>

<svelte:head>
    <title>A Green Table | Game: {gameID}</title>
</svelte:head>

<div class="w-screen h-screen">
    <CardSurface CardSets={new CardGroup(PlayerZero)} />
</div>

<!-- <br>

<PlacedCards fan={false} cards={PlayerOne}/>
<PlacedCards hand={false} cards={PlayerTwo}/>
<PlacedCards cards={PlayerThree}/> -->
