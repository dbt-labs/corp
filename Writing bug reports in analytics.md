# Writing bug reports in analytics
From time to time, some of our work will impact existing reports such that they use show different numbers to what is expected. When this happens, we definitely want to know about it! Unfortunately, a lot of the time, we will get alerted that something is "wrong" or "broken" without enough details for us to diagnose the issue effectively. To help us fix things as quickly as possible, it's really important to communicate the bug clearly. Often, as the bug reporter, spending some extra effort when reporting the bug will save lots of effort in making the fix!

If you've noticed a bug, we recommend opening up an issue on your dbt repo. We use the same structure in reporting analytics bugs that software engineers do when reporting software bugs.

## Steps to reproduce:
List the steps that took you on your journey to discovering this bug! Include hyperlinks so we can go on the same journey.

Example:
```
## Steps to reproduce:
* Go to [this Looker/Mode/Periscope report](www.link_to_report.com).
* Also go to [this GA dashboard](www.link_to_ga.com).
```

## Expected resuts:
Explain what you expected to see when you went on your journey of bug-discovery. If you have historical data (e.g. a screenshot of the same report from last week), here is a great place to include it!
Example:
```
## Expected resuts:
* The pageview numbers for yesterday _should_ be somewhat similar.
```

## Actual results
Explain what you saw that made you go "that doesn't look right". Include screenshots!
```
## Actual resuts:
* Looker is reporting 500 pageviews:
[Screenshot of Looker]
* GA is reporting 100 page views:
[Screenshot of GA]
```

## Extra details
Include any extra details that you think might be relevant. If you're someone that is close to the dbt code, you might know of a recent PR related to this area.
```
## Extra details
PR #27 "Join page views to users" was merged just before we noticed these errors
```
