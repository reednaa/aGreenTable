<script lang="ts">
    import { page } from "$app/stores";

    import { CardDeck, CardGroup } from "$lib/utils/deck";
    import CardSurface from "$lib/components/PlayingSurface.svelte";
    import { username } from "$lib/utils/comm";
    import { goto } from "$app/navigation";

    const deck = new CardDeck({ shuffle: true, flipped: false });
    // const firstGroup = deck.draw(4);
    // const secondGroup = deck.draw(0);
    const PlayerZero = deck.draw();
    PlayerZero.locked = true;
    const gameID = $page.params["gameID"];
    if ($username == "") {
        if (window.localStorage.getItem("username")) {
            $username = window.localStorage.getItem("username");
        } else {
            goto("/");
        }
    }
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
