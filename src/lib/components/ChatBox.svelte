<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import type { Writable } from "svelte/store";
    import Chat from "./icons/Chat.svelte";
    import Close from "./icons/Close.svelte";
    import Send from "./icons/Send.svelte";

    export let chat: Writable<string[]>;
    let unreadMessages = 0;
    export function onchat() {
        if (expanded) {
            gotoBottom("boxOfChat");
        } else {
            unreadMessages += 1;
        }
    }
    let chatValue: string = "";
    const dispatch = createEventDispatcher();

    let expanded = false;
    function submissionHandler(v) {
        v.preventDefault();
        if (chatValue != "") {
            dispatch("message", {
                value: chatValue,
            });
        }
        chatValue = "";
        setTimeout(() => {
            gotoBottom("boxOfChat");
        }, 1);
    }

    function gotoBottom(id) {
        var element = document.getElementById(id);
        element.scrollTop = element.scrollHeight - element.clientHeight;
    }

    function expandHandler() {
        expanded = !expanded;
        unreadMessages -= unreadMessages;
        if (expanded) {
            setTimeout(() => {
                gotoBottom("boxOfChat");
            }, 1);
        }
    }
</script>

<div
    class="relative bg-gray-100 {!expanded
        ? 'hover:bg-white'
        : ''} rounded transition-all"
    class:h-10={!expanded}
    class:w-10={!expanded}
    class:w-64={expanded}
    class:h-32={expanded}
>
    {#if expanded}
        <div class="w-full h-[80%] px-1.5 pt-1 overflow-scroll" id="boxOfChat">
            {#each $chat as message}
                <div class="text-gray-800 text-sm">
                    {message}
                </div>
            {/each}
        </div>
        <form
            class="absolute bottom-0 w-full flex flex-row"
            on:submit={submissionHandler}
        >
            <input
                class="rounded-bl bg-gray-100 px-1 py-0.5 w-[88%] outline-none"
                placeholder="Chat"
                bind:value={chatValue}
            />
            <button
                class="flex rounded-br hover:bg-gray-200 px-1 py-0.5 w-[12%] place-content-center items-center"
            >
                <Send />
            </button>
        </form>
    {/if}
    <div
        class="absolute flex place-content-center items-center cursor-pointer right-0 top-0 {expanded
            ? ' h-8 w-8'
            : 'h-10 w-10'}"
        on:click={expandHandler}
    >
        {#if expanded}
            <Close size={1.5} strokeWidth={2} />
        {:else}
            <Chat size={2} strokeWidth={2} />
            {#if unreadMessages > 0}
                <div
                    class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-600 text-[8px] text-center text-white"
                >
                    {unreadMessages}
                </div>
            {/if}
        {/if}
    </div>
</div>

<style lang="postcss">
    
</style>