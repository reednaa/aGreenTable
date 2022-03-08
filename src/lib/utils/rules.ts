import type { Card, CardSet } from "./deck";

export const ruleSets = ["true", "500"]

export class Rule {
    ruleSet: string

    constructor(ruleSet?: string) {
        this.ruleSet = ruleSet;
    }


    combineCards(setOne: CardSet, setTwo: CardSet, options?: {}) {
        switch (this.ruleSet) {
            case "500":
                if ((setOne.cards[0].suit == "Joker") && setOne.cards.length == 1) {
                    return true
                }
                if ((setTwo.cards[0].suit == "Joker") && setTwo.cards.length == 1) {
                    return true
                }
                // Check for all other combinations. Can be lazy evaluated
                break;
            default:
                return true;
        }
    }

    splitCards(setOne: CardSet, options?: {}) {
        switch (this.ruleSet) {
            default:
                return true;
        }
    }
}

const Rules = new Rule();
export default Rules;