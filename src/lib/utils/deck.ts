
export const suits: suit[] = ["heart", "diamond", "club", "spade"]
export const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
export type suit = "Joker" | "heart" | "diamond" | "club" | "spade"



function randomHash() {
    return Math.random().toString().substring(2) + Math.random().toString().substring(2)
}

function combinationsOfTwoArrays(suits: suit[], values: number[], flipped = true) {
    const combinations: Card[] = [];
    for (let suit = 0; suit < suits.length; suit++) {
        for (let value = 0; value < values.length; value++) {
            combinations.push(
                new Card({ value: values[value], suit: suits[suit], flipped: flipped })
            );
        }
    }
    return combinations;
}

function rand(items) {
    // "|" for a kinda "int div"
    return items[items.length * Math.random() | 0];
}

function shuffle(a: any[]) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export class Card {
    value: number
    suit: string
    flipped: boolean
    x?: number
    y?: number
    z?: number

    constructor(card?: { value?: number, suit?: suit, flipped?: boolean }) {
        this.value = card?.value;
        this.suit = card?.suit;
        this.flipped = card?.flipped
    }

    Joker(flipped = true) {
        return new Card({ value: 0, suit: "Joker", flipped: flipped })
    }

}

export class CardSet {
    cards: Card[];
    x?: number
    y?: number
    z?: number
    flipped?: boolean
    locked?: boolean

    constructor(cards?: Card[] | Card, x?: number, y?: number, z?: number, flipped?: boolean) {
        if (cards.constructor == Array) {
            this.cards = cards;
        } else if (cards.constructor == Card) {
            this.cards = [cards];
        } else {
            this.cards == [];
        }
        this.x = x;
        this.y = y;
        this.z = z;
        this.flipped = flipped;
    }

    split() {
        const out: CardSet[] = [];
        for (let em of this.cards) {
            out.push(new CardSet([em], this.x, this.y))
        }
        return out;
    }

    add(grp: CardSet | Card) {
        if (grp instanceof CardSet) {
            this.cards = this.cards.concat(grp.cards);
        }
        if (grp instanceof Card) {
            this.cards.push(grp);
        }
    }

    draw(n = -1) {
        const draws: Card[] = [];
        for (let i = 0; (i < n) || (n < 0); i++) {
            if (this.cards.length == 0) {
                break;
            }
            const drawn = this.cards.pop();
            draws.push(drawn);
        }
        return new CardSet(draws);
    }
}


export class CardGroup {
    cards: { [cardID: string]: CardSet }

    constructor(...cards: CardSet[]) {
        this.cards = {};
        this.combine(...cards)
    }

    combine(...cards: CardSet[]) {
        const hashes: string[] = [];
        for (let card of cards) {
            const hsh = randomHash();
            hashes.push(hsh);
            this.cards[hsh] = card;
        }
        return hashes;
    }

    remove(...hashes: string[]) {
        const cards: CardSet[] = [];
        for (let hash of hashes) {
            cards.push(this.cards[hash]);
            delete this.cards[hash];
        }
        return cards;
    }
}


export class CardDeck {
    cardsInDeck: Card[];
    cardsNotInDeck?: Card[];
    jokers?: number;

    constructor({ jokers = 2, shuffle = false, flipped = true }) {
        this.cardsInDeck = combinationsOfTwoArrays(suits, values, flipped = flipped);
        for (let i = 0; i < jokers; i++) {
            this.cardsInDeck.push(
                new Card().Joker(flipped)
            )
        }
        this.cardsNotInDeck = [];
        this.jokers = 2;
        if (shuffle) {
            this.shuffleDeck();
        }
    }

    Empty() {
        this.cardsInDeck = [];
        this.cardsNotInDeck = [];
    }

    drawRandom(n = -1) {
        const draws: Card[] = [];
        for (let i = 0; (i < n) || (n < 0); i++) {
            if (this.cardsInDeck.length == 0) {
                break;
            }
            const drawn = rand(this.cardsInDeck);
            this.cardsInDeck.slice(this.cardsInDeck.indexOf(drawn), 1);
            this.cardsNotInDeck.push(drawn);
            draws.push(drawn);
        }
        return new CardSet(draws);
    }

    draw(n = -1) {
        const draws: Card[] = [];
        for (let i = 0; (i < n) || (n < 0); i++) {
            if (this.cardsInDeck.length == 0) {
                break;
            }
            const drawn = this.cardsInDeck.pop();
            this.cardsNotInDeck.push(drawn);
            draws.push(drawn);
        }
        return new CardSet(draws);
    }

    resetDeck() {
        this.cardsInDeck = [...this.cardsInDeck, ...this.cardsNotInDeck]
        this.cardsNotInDeck = [];
    }

    shuffleDeck() {
        this.cardsInDeck = shuffle(this.cardsInDeck);
    }

}




export default CardDeck;