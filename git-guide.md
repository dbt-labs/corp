# Git guide
The goal of this guide is twofold:
1. Improve consistency when multiple analysts are working on a codebase; and
2. Provide a framework that decreases the number of decisions that need to be
made


## Git branches
Git branches should:
* be named as follows:
  * feature/name-of-feature
  * fix/name-of-fix
  * refactor/name-of-refactor

## Commits
Commits should:
* have a message in the imperative sense – a good way to frame this tense is to
  finish the sentence "this commit will ...". For example:
  * Add MRR models
  * Fix typo in sessions model description
  * Update schema to v2 schema syntax
  * Upgrade project to dbt v0.13.0
* happen early and often! As soon as a piece of your code works, commit it! This
  means that if (/when), down the line, you introduce bad code, you can easily
  take your code back to the state it was in when it worked.

Commits can:
* be squashed on a local branch before being  pushed to your remote branch, if
  you feel comfortable doing this.

## Pull requests
Pull requests should:
* tackle a functional grouping of work. While it may be tempting to (for
  example) build MRR models _and_ add maintenance jobs in a single PR, these
  should be separate pieces of work.
* include a body that explains the context of the changes to the code, as well
  as what the code does. Useful things to include in a PR are:
  * Links to Trello cards
  * Links to dbt docs that explain any new piece of functionality you have
    introduced
  * A screenshot of the DAG for the new models you have built
  * Links to any related PRs (for example, if your BI tool will need to be
    updated to reflect the changes in your models)
  * Explanation of any breaking changes
  * Any special instructions to merge this code, e.g. whether a full-refresh
    needs to be run, or any renamed models should be dropped. You can use a PR
    template to encourage others making PRs on the repo to do the same. An
    example PR template we often use on client work is included [here](https://github.com/fishtown-analytics/dbt-init/blob/master/starter-project/.github/pull_request_template.md)
* be opened with 48 hours for the reviewer to review
* be merged by its _author_ when:
  * approval has been given by at least one collaborator
  * all tests have passed

Pull requests can:
* be used to collaborate on code, as they are a great way to share the code
  you've written so far. In this scenario, use a _draft_ pull request.
