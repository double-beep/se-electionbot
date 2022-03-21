import { allMatch, noneMatch, someMatch } from "./utils/expressions.js";

/**
 * @typedef {import("chatexchange/dist/User").default} User
 * @typedef {import("chatexchange/dist/Browser").IProfileData} ChatProfile
 */

/**
 * @summary checks if the message asked how or where to nominate
 * @param {string} text
 * @returns {boolean}
 */
export const isAskedForNominatingInfo = (text) => {
    return someMatch([
        /^(?:how|where|can I)(?:\s+can I)?(?:\s+to)?\s+(?:nominate|submit|register|enter|apply|elect)(?!\s+(?:an)?others?|\s+some(?:one|body))/i,
        /^(?:how|where|can I)\s+(?:to |can I )?be(?:come)?(?:\s+a)?\s+mod(?:erator)?/i
    ], text);
};

/**
 * @summary checks if the message asked if they can nominate others
 * @param {string} text
 * @returns {boolean}
 */
export const isAskedIfCanNominateOthers = (text) => {
    return someMatch([
        /^(?:how\s+can|can|how\s+to)(?:\s+one|\s+i)?(?:\s+users?)?\s+(?:nominate|register)\s+(?:(?:an)?others?(?:\s+users?)?|some(?:one|body))/i
    ], text);
};

/**
 * @summary checks if the message asked why a nomination was removed
 * @param {string} text
 * @returns {boolean}
 */
export const isAskedWhyNominationRemoved = (text) => {
    return /^(?:why|what)\b/.test(text) &&
        /\b(?:nomination|nominee|candidate)s?\b/.test(text) &&
        /\b(?:deleted?|vanish(?:ed)?|erased?|removed?|unpublish(?:ed)?|cancel(?:led)?|withdrawn?|fewer|less(?:er)?|resign)\b/.test(text);
};

/**
 * @summary checks if the message asked if mods are paid
 * @param {string} text
 * @returns {boolean}
 */
export const isAskedIfModsArePaid = (text) => {
    return /^(?:why|what|are|how|do)\b/.test(text) &&
        /\b(?:reward|rewarded|paid|compensat(?:ed|ion)|money)\b/.test(text) &&
        /\b(?:mods|moderators)\b/.test(text);
};

/**
 * @summary checks if the message asked what do moderators do or what privileges they have
 * @param {string} text
 * @returns {boolean}
 */
export const isAskedAboutModsOrModPowers = (text) => {
    return /^(?:why|what|should|does)\b/.test(text) &&
        /\b(?:should i (?:be|become)|is a|(?:do|does)(?: a)? (?:mod|moderator)s?|benefits?|privileges?|powers?|responsibilit(?:y|ies))\b/.test(text) &&
        /\b(?:mod|moderator)s?\b/.test(text);
};

/**
 * @summary checks if the message asked how or where to vote
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedAboutVoting = (text) => {
    return allMatch([
        /^(?:where|how|want|when)\b/,
        /\b(?:do|can|to|give|cast|should)\b/,
        /\b(?:voting|vote|elect)\b/,
    ], text);
};

/**
 * @summary checks if the message asked to tell who the current mods are
 * @param {string} text message text
 * @param {string|null} apiSlug current site's apiSlug
 * @returns {boolean}
 */
export const isAskedForCurrentMods = (text, apiSlug = null) => {
    return someMatch([
        new RegExp(`^whois ${apiSlug} mod(?:erator)?s$`),
        /^who(?: are| is|'s) the current mod(?:erator)?s?/,
        /^how many mod(?:erator)?s? (are there|do we have)/,
        /^how.*\bcontact\b.*mod(?:erator)?s?/
    ], text);



};

/**
 * @summary checks if the message asked to tell who winners are
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedForCurrentWinners = (text) => {
    return allMatch([
        /^(?:who|how\s+many)/,
        /winners|new\s+mod|will\s+win|future\s+mod/
    ], text);
};

/**
 * @summary checks if the message asked to tell how many positions are due
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedForCurrentPositions = (text) => {
    return /^how many (?:positions|mod(?:erator)?s) (?:are|were|will be)(?: being)? (?:elected|there)/.test(text);
};

/**
 * @summary checks if the message asked to tell who nominees are
 * @param {string} text
 * @returns {boolean}
 */
export const isAskedForCurrentNominees = (text) => {
    return someMatch([
        /^(?:(?:are|is) there)?(?: ?any| a)?(?: new)? (?:nomination|nominee|candidate)s?(?: so far)?\b(?! in.+?room)/i,
        /(?:who|what) (?:are|were|was|is|has)(?: the)? (?:nomin(?:ee|ation|ated)|particip(?:ant|ated)|candidate)s?(?!\s+score)/i,
        /how many (?:nomin(?:ee|ation|ated)|participant|candidate)s?\b(?!\s+(?:score|are here|are in.+?room|(?:have|are|were) withdrawn))/i
    ], text);
};

/**
 * @summary checks if the message asked to tell who the withdrawn nominees are
 * @param {string} text
 * @returns {boolean}
 */
export const isAskedForWithdrawnNominees = (text) => {
    return someMatch([
        /^(?:who)\b.*\b(?:withdr[ae]wn?|removed|deleted)\b.*\b(?:election|nomination)/,
        /^(?:whom?) (?:has|have|was)\b.*\b(?:withdr[ae]wn?|removed|deleted)/,
        /^(?:how many|which|was|were)\b.*\b(?:candidate|nomin(?:ee|ation))s?\b.*\b(?:withdr[ae]wn?|removed|deleted)/
    ], text);
};

/**
 * @summary checks if the message asked for current election schedule
 * @param {string} text
 * @returns {boolean}
 */
export const isAskedForElectionSchedule = (text) => {
    return /(?:when|how|what)(?: is|'s) the election(?: scheduled)?|election schedule/.test(text);
};

/**
 * @summary checks if the message asked if anyone can edit in a ♦ in their username
 * @param {string} text
 * @returns {boolean}
 */
export const isAskedAboutUsernameDiamond = (text) => {
    return /(?:edit|insert|add).+?(?:\u2666|diamond).+?(?:user)?name/.test(text);
};

/**
 * @summary checks if the message asked who created or maintains the bot
 * @param {string} text
 * @returns {boolean}
 */
export const isAskedWhoMadeMe = (text) => {
    return /who(?: (?:are|is) your)?\s+(?:made|created|own(?:s|ers?)|develop(?:s|ed|ers?)|maintain(?:s|ers?))(?:\s+you)?/.test(text);
};

/**
 * @summary checks if the message asked who or what the bot is
 * @param {string} text message content
 * @returns {boolean}
 */
export const isAskedWhoAmI = (text) => {
    return someMatch([
        /^(?:(?:who|what)\s+are\s+you|about)\b/i,
        /^are\s+you(?:\s+(?:a|the))?\s+(?:bot|robot|chat\s*?bot|da?emon)/i
    ], text);
};

/**
 * @mention
 * @summary checks if the message asked how the bot fares
 * @param {string} text message content
 * @returns {boolean}
 */
export const isAskedHowAmI = (text) => {
    return someMatch([
        /^(?:(?:hello|hi|heya)(?:\s+bot)?,?\s+)?how\s+are\s+you(?:\s+today)?(?:$|\?)/i
    ], text);
};

/**
 * @summary checks if the message asked whether the bot is alive
 * @param {string} text message content
 * @returns {boolean}
 */
export const isAskedAmIalive = (text) => {
    return someMatch([/^(?:where\s+ar[et]\s+(?:you|thou)|alive|dead|ping)(?:$|\?)/i, /^are\s+you\s+(?:t?here|alive|dead)(?:$|\?)/i], text);
};

/**
 * @summary checks if the message asked for meaning of life
 * @param {string} text message content
 * @returns {boolean}
 */
export const isAskedMeaningOfLife = (text) => {
    return someMatch([
        /^what(?:'s| is)(?:\s+the|an?)\s+(?:answer|meaning|reason)\s+(?:of|to|for)\s+life(?:$|\?)/i,
        /^what\s+is\s+42(?:$|\?)/i
    ], text);
};

/**
 * @summary checks if the message asked for one's candidate score
 * @param {string} text
 * @returns {boolean}
 */
export const isAskedForOwnScore = (text) => {
    return /can i nominate myself/.test(text) ||
        /what(?: is|'s)\b.*\bm[ye](?: candidate)? score(?:$|\?)/.test(text);
};

/**
 * @summary checks if the message asked for candidate score of another user
 * @param {string} text
 * @returns {boolean}
 */
export const isAskedForOtherScore = (text) => {
    return allMatch([
        /(?:(?:what)?(?: is|'s)(?: the)? |^)(?:candidate )?score (?:for |of )(?:the )?(?:(?:site )?user )?(?:@?-?\d+|https:\/\/.+\/users\/\d+.*)(?:$|\?)/
    ], text) && noneMatch([/\b(?:my|mine)\b/], text);
};

/**
 * @summary checks if the message asked for candidate score calculation formula
 * @param {string} text
 * @returns {boolean}
 */
export const isAskedForScoreFormula = (text) => {
    return someMatch(
        [
            /(?:what|how)\b.+\bcandidate score\b(?!\s+of).*\b(?:calculated|formula)?(?:$|\?)/,
            /what\b.+\bformula\b.+\bcandidate score(?:$|\?)/
        ], text
    );
};

/**
 * @summary checks if the message asked for candidate score leaderboard
 * @param {string} text
 * @returns {boolean}
 */
export const isAskedForScoreLeaderboard = (text) => {
    return /who\b.*\b(?:highest|greatest|most)\b.*\bcandidate scores?/.test(text) ||
        /candidate scores? leaderboard(?:$|\?)/.test(text);
};

/**
 * @summary detects if someone is thanking the bot
 * @param {string} text
 * @returns {boolean}
 */
export const isThankingTheBot = (text) => {
    return /thanks?(?= you|,? bot|[!?]|$)/.test(text);
};

/**
 * @summary detects if someone is praising or loving the bot
 * @param {string} text
 * @returns {boolean}
 */
export const isLovingTheBot = (text) => {
    return [
        /\b(?:election)?bot\b/,
        /\b(?:awesome|brilliant|clever|correct|excellent|good|great|impressive|like|love|legit|marvell?ous|nice|neat|perfect|praise|right|smart|super|superb|swell|wise|wonderful)\b/,
        /\b(?:is|the|this|bot|electionbot|wow|pretty|very)\b/
    ].every((expression) => expression.test(text));
};

/**
 * @summary detects if someone hates the bot
 * @param {string} text
 * @returns {boolean}
 */
export const isHatingTheBot = (text) => {
    return [
        /\b(?:election)?bot\b/,
        /\b(?:bad|terrible|horrible|broken|buggy|dislike|hate|detest|poor)\b/,
        /\b(?:is|the|this|bot|electionbot|wow|pretty|very)\b/
    ].every((expression) => expression.test(text));
};

/**
 * @summary detects if someone is saying the bot is insane
 * @param {string} text
 * @returns {boolean}
 */
export const isSayingBotIsInsane = (text) => {
    return [
        /(?<=(\bbot\b).+?|)(?:insane|crazy)(?:(?!\1)|.+?\bbot\b)/i
    ].some((expression) => expression.test(text));
};

/**
 * @summary checks if the message is asking about user eligibility
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedForUserEligibility = (text) => {
    return /^(?:can|is) user \d+(?: be)? (?:eligible|nominated?|elected?)/.test(text);
};

/**
 * @fun
 * @summary checks if a message is asking how many mods it takes to change a lightbulb
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedAboutLightbulb = (text) => {
    return /how (?:many|much) mod(?:erator)?s(?: does)? it takes? to (?:change|fix|replace)(?: a| the)? light\s?bulb/.test(text);
};

/**
 * @fun
 * @summary checks if a message is asking for a Jon Skeet joke
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedAboutJonSkeetJokes = (text) => {
    return /(?:tell|say)\b.*\bjon\s?skeet\s?(?:joke|fact|meme)?[!?]+$/.test(text);
};

/**
 * @fun
 * @summary checks if a message is asking for a joke
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedAboutJokes = (text) => {
    return someMatch([
        /(?:tell|make|say)\b.+?\b(?:me|us)?\b.+?(?:(?: a)? joke|laugh)/
    ], text);
};

/**
 * @summary checks if a message is asking if bot's responses are canned
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedIfResponsesAreCanned = (text) => {
    return /bot\b.+?says?\b.+?canned/i.test(text);
};

/**
 * @summary checks if a message is asking to list required badges
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedAboutRequiredBadges = (text) => {
    return someMatch([
        /^(?:what\s+are|list)(?:\s+the)?\s+(?:required|mandatory|necessary)\s+badges/i,
        /^(?:what|which)(?:\s+of)?(?:\s+the)?\s+badges\s+are\s+(?:required|mandatory|necessary)/i
    ], text);
};

/**
 * @summary checks if a message is asking to list badges of a certain type
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedAboutBadgesOfType = (text) => {
    return /^(?:what|list)(?: are)?(?: the)?.+?\b(participation|editing|moderation)\s+badges/i.test(text);
};

/**
 * @summary checks if a message is asking how to vote or who to vote for
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedHowOrWhoToVote = (text) => {
    return text.length > 14 && // temp fix - prevents matching "how to vote?"
        someMatch(
            [
                /^(?:how|whom?)\s+(?:should(?:n't|\s+not)? i|to)\s+(?:(?:choose|pick|decide|determine)?.+?\bvote\b|vote)/i,
                /^how\s+do(?:es)?\s+(?:the\s+)?voting\s+(?:process)?work/i
            ],
            text
        );
};

/**
 * @summary checks if a message is asking where did the nomination comments go
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedAboutMissingComments = (text) => {
    return allMatch([
        /^(where|why|are|were|did|who|how|i|is|election)\b/,
        /\b(missing|hidden|cleared|deleted?|removed?|go|election|nominations?|all|view|find|bug|see)\b/,
        /\bcomments?\b/
    ], text);
};

/**
 * @summary checks if a message is asking who is the best candidate
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedWhoIsTheBestCandidate = (text) => {
    return someMatch([
        /^(?:who(?:'s)?|what(?:'s)?|which) (?:was |were |are |is )?(?:a |the )?.*\bbest(?:est)? (?:candidate|nomination|nominee)s?/i
    ], text);
};

/**
 * @summary checks if a message is asking who is the best mod
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedWhoIsTheBestMod = (text) => {
    return someMatch([
        /^(?:who|which)\s+(?:is|are)(?:\s+the)?(\s+most)?\s+(?:best|coolest|loved|favou?rite)\s+(?:mod|diamond)(?:erator)?/i
    ], text);
};

/**
 * @summary checks if a message is asking about STV ranked-choice voting
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedAboutSTV = (text) => {
    return someMatch([
        /^(?:what|how).*?(?:\s+meek)?\s+s(?:ingle\s+)?t(?:ransferable\s+)?v(?:ote)?/i
    ], text);
};

/**
 * @summary checks if the bot is mentioned
 * @param {string} text  message text
 * @param {ChatProfile|User} botChatProfile
 * @returns {Promise<boolean>}
 */
export const isBotMentioned = async (text, botChatProfile) => {
    const { name } = botChatProfile;
    const normalized = (await name).replace(/\s/g, "");
    return someMatch(
        [new RegExp(`^\\s*@(?:${normalized})[:,-]? `, "i")], text
    );
};

/**
 * @summary checks if a message is asking how many mods are in the room
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedHowManyModsInTheRoom = (text) => {
    return someMatch([
        /^how many mod(?:erator)?s are here(?:\?|$)/i
    ], text);
};

/**
 * @summary checks if a message is asking how many candidates are in the room
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedHowManyCandidatesInTheRoom = (text) => {
    return someMatch([
        /^how many (?:candidate|nominee)s are\s+(?:here|in\s+th(?:e|is)\s+room)(?:\?|$)/i,
        /^are(?:\s+there\s+)?any\s+(?:candidate|nominee)s\s+(?:here|in\s+th(?:e|is)\s+room)(?:\?|$)/i
    ], text);
};

/**
 * @summary checks if a message is asking for help
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedForHelp = (text) => {
    return someMatch([
        /^can you help(?:\s+me)?/i,
        /^(?:please\s+)?(?:h[ae]lp|info)(?:(?:\s+me)?(?:,?\s+please)?)(?:[?!]|$)/i,
    ], text);
};

/**
 * @summary checks if a message is asking for full help
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedForFullHelp = (text) => {
    return someMatch([
        /^(?:(?:help|info|topics) (full|all|complete)|(full|all|complete) (?:help|info|topics))/i,
    ], text);
};

/**
 * @summary checks if a message is asking for what an election is
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedWhatElectionIs = (text) => {
    return text.length <= 56 && someMatch([
        /^(?:what|what's) (?:is )?(?:a |an |the )?election(?:\?\!?|$)/i,
        /^how do(?:es)? (?:a |an |the )?elections? work/i
    ], text);
};

/**
 * @summary checks if a message is asking what the election status is
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedWhatIsElectionStatus = (text) => {
    return someMatch([
        /^(?:what|how)\s+is(?:\s+the)?\s+election\s+(?:stat(?:us|e)|progress(?:ing)?)(?:\?\!?|$)/i,
        /^election\s+(?:stat(?:us|e)|progress)(?:\?\!?|$)/i,
        /^what\s+is(?:\s+the)?\s+(?:stat(?:us|e)|progress)\s+of(?:\s+the)?\s+election(?:\?\!?|$)/i
    ], text);
};

/**
 * @summary checks if a message is asking when is the next phase
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedWhenIsTheNextPhase = (text) => {
    return someMatch([
        /^when(?:'s| is| does) (?:the )?next phase/i,
        /^when(?:'s| is| does) (?:the )?(?:nomination|election) (?:phase )?(?:start|end)(?:ing)/i,
        /is (?:it|election|nomination) (?:start|end)(?:ing|ed)\s?(soon|yet)?/i,
    ], text);
};

/**
 * @summary checks if a message is asking when the election ends
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedWhenTheElectionEnds = (text) => {
    return someMatch([
        /^when(?:\s+does)?(?:\s+the)?\s+(?:it|election)\s+ends?(?:\?\!?|$)/i
    ], text);
};

/**
 * @summary checks if a message is asking how many users are eligible to vote
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedHowManyAreEligibleToVote = (text) => {
    return someMatch([
        /^how many(?: (?:users|people|bots))?(?: are eligible to| can) vote/i
    ], text);
};

/**
 * @summary checks if a message is asking for the election page
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedForElectionPage = (text) => {
    return someMatch([
        /(?:what|where)\s+is(?:\s+the)?\s+(?:(?:link|url)\s+(?:to|of)(?:\s+the)?\s+election|election\s+page)/i,
        /(?:link|url)\b.*\belection\b(?:page)?\s?(?:[?!]|$)/i,
        /election (?:page )?(?:link|url)(?:[?!]|$)/i,
    ], text);
};

/**
 * @summary checks if a message is asking where can one find a ballot file
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedAboutBallotFile = (text) => {
    return someMatch([
        /^(?:where|how)\s+(?:can|is)(?:\s+i\s+find)?(\s+the)?\s+(?:ballot|blt)(?:\s+file)?/i,
        /^is(?:\s+the)?\s+(?:ballot|blt)(?:\s+file)?\s+available/i
    ], text);
};

/**
 * @summary checks if a message is asking for the list of election phases
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedAboutElectionPhases = (text) => {
    return someMatch([
        /^(?:what)\s+are(?:\s+the)?(?:\s+election(?:'s|s)?)?\s+phases(?:[?!]|$)/i,
        /^list(?:\s+the)?\s+election(?:'s|s)?\s+phases(?:[?!]|$)/i
    ], text);
};

/**
 * @summary checks if a message is asking how many users already voted
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedHowManyVoted = (text) => {
    return someMatch([
        /^how\s+(?:many|much)(?:\s+users)?(?:\s+have)?\s+(?:vote|participate)d/i,
        /^how\s+(?:many|much)\s+(?:participant|voter)s/i
    ], text);
};

/**
 * @summary checks if a message is asking if one has voted themselves
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedIfOneHasVoted = (text) => {
    return someMatch([
        /^(?:did|have)\s+i\s+voted?(?:\s+in(?:\s+th[ei]s?)\s+election)??(?:\?|$)/i
    ], text);
};

/**
 * @summary checks if a message is asking if one can vote
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedIfCanVote = (text) => {
    return someMatch([
        /^can\s+i\s+vote(?:\s+in(?:\s+th[ei]s?)?\s+election)?(?:\?|$)/i
    ], text);
};

/**
 * @summary checks if a message is asking where to find results
 * @param {string} text message text
 * @returns {boolean}
 */
export const isAskedWhereToFindResults = (text) => {
    return someMatch([
        /^(?:where|how)\s+can\s+i\s+find(?:\s+th[ei]s?)?(?:\s+election)?\s+results(?:\?|$)$/i,
        /^(?:where|how)(\s+can|)?(?:\s+th[ei]s?)?(?:\s+election)?\s+results(?:\1|\s+can)?\s+be\s+found(?:\?|$)$/i
    ], text);
};