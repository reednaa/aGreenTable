import type { Card, CardGroup } from "./deck";

export const ruleSets = ["true", "500", "all"]

export class Rule {
    ruleSet: string[]

    constructor(ruleSet?: string[] | string) {
        if (typeof ruleSet == "string") {
            this.ruleSet = [ruleSet]
        } else {
            this.ruleSet = ruleSet ? ruleSet : ["true"]
        }
    }

    addRule(ruleSet: string[] | string) {
        if (typeof ruleSet == "string") {
            this.ruleSet = [ruleSet]
        } else {
            this.ruleSet = ruleSet
        }
    }

    combineCards(setOne: CardGroup, setTwo: CardGroup, options?: {}) {
        if (this.ruleSet.includes("true")) {
            return true
        } else if (this.ruleSet.includes("500") && this.ruleSet.includes("all")) {
            if ((setOne.cards[0].suit == "Joker") && setOne.cards.length == 1) {
                return true
            }
            if ((setTwo.cards[0].suit == "Joker") && setTwo.cards.length == 1) {
                return true
            }
            // Check for all other combinations. Can be lazy evaluated
        }
        return true
    }

    splitCards(setOne: CardGroup, options?: {}) {
        if (this.ruleSet.includes("true")) {
            return true
        }
        return true
    }
}

const Rules = new Rule();
export default Rules;