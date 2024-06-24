import { Block, KnownBlock } from "@slack/web-api";

const scoreEmoji = (score:number) => {
    if (score < 0.5) {
        return {name: 'red_circle', symbol: '🔴'}
    } 
    if (score < 0.85){
        return {name: 'large_yellow_circle', symbol: '🟡'}
    } 
    return {name: 'large_green_circle', symbol: '🟢'}
}

export const reportMsgBlocks = (scores: Record<string, number>, finishedRequests: number, runUrl: string | undefined): (Block | KnownBlock )[] => {
    const result: (Block | KnownBlock )[] = [
        {
            type: "header",
            text: {
                type: "plain_text",
                text: "A Lighthouse Analysis report is waiting for you"
            }
        },
        {
            type: "rich_text",
            elements: [
                {
                    type: "rich_text_list",
                    style: "bullet",
                    elements: Object.keys(scores).map((category) => {
                        return {
                            type: "rich_text_section",
                            elements: [
                                {
                                    type: "emoji",
                                    name: scoreEmoji(scores[category]).name,
                                },
                                {
                                    type: "text",
                                    text: `   ${category}: `,
                                    style: {
                                        bold: true
                                    }
                                },
                                {
                                    type: "text",
                                    text: `${scores[category]}`
                                }
                            ]
                        }
                    }),
                },
                {
                    type: "rich_text_section",
                    elements: [
                        {
                            type: "text",
                            text: `Pages analyzed: ${finishedRequests}`
                        }
                    ]
                }
            ]
        }
    ]

    if (runUrl) {
        result.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: "See actor run details"
            },
            accessory: {
                type: "button",
                text: {
                    "type": "plain_text",
                    "text": "Run details"
                },
                value: "go_to_actor_run",
                url: runUrl,
                action_id: "button-action"
            }
        })
    }

    return result;
};

export const pagesListMsgBlocks = (successfulRequests: { url:string, scores: Record<string, number> }[]) => [
    {
        type: "section",
        text: {
            type: "plain_text",
            text: "The following pages have been analyzed"
        }
    },
    {
        type: "section",
        text: {
            type: "mrkdwn",
            text: successfulRequests.reduce((prev: string, req) => {
                const scoreString = Object.keys(req.scores).reduce((prev, category) => `${prev} ${scoreEmoji(req.scores[category]).symbol} ${category}: ${req.scores[category]};`, '');
                return `${prev}${req.url} (${scoreString})\n`
            }, '')
        }
    }
];