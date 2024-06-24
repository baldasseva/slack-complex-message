# Apify Actor for complex Slack messages

> **DISCLAIMER**
>
> This Actor specifically serves as an integration for [Pagespeed Insights Webpage Analyzer](https://console.apify.com/actors/DDLWekg68xT22l1DW/source) because the existing Slack integration was not fulfilling my expectations

## Use case

When [Pagespeed Insights Webpage Analyzer](https://console.apify.com/actors/DDLWekg68xT22l1DW/source) runs, it will save the results of its analysis in a Key-Value Store named _OUTPUT_. The results there include the number of pages analyzed, the mean score of all the pages for each category of analysis etc.

At the time of writing (24/06/2024) the existing Slack Integration is limited. In particular, it cannot access the data in the Key-Value Store. This Actor was created for the purpose of filling that void, but as such, its use cases are very limited.

## Solution

We assume this Actor will be used as an Actor-to-Actor integration. Nonetheless, it is possible to pass any `Key-value Store ID` as input and run this Actor independently.

### Inputs

| Fields                      | Default  | Notes                                                                                                                                       |
| --------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Slack Token                 | ---      | **Required**                                                                                                                                |
| Channel                     | #general |                                                                                                                                             |
| Key-value Store ID          | ---      | _If absent, the Actor will read from the run that triggered this integration. If no other Actor has triggered this one, the run will fail._ |
| Key-value Store Record name | OUTPUT   |                                                                                                                                             |

### Outputs

Two Slack messages are sent:

1. The aggregated mean scores of the analysis
2. The scores of each page analyzed (this one is sent as an in-thread response of the first message)
