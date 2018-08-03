# Data Warehouse Design: Conventions & Best Practices

## Old Paradigm

Once upon a time, at Fishtown Analytics, data warehouse design patterns were few 
and far between. dbt requires different names for each SQL file in a project, 
so when we needed to make significant alterations to `salesforce_account`, we'd 
do so in new models (good!) with clever names like `salesforce_account_xf`, 
`_enriched`, or `_joined`, often without internal consistency or interpersonal
clarity on those naming conventions. All four models would materialize, as
views, in the same schema. When a BI user wants to learn about Salesforce
accounts, they have not one but four sources of truth. Not good.

Thoughtful people have been thinking about data warehouse design for decades. In
the past, design patterns needed to also account for considerations such as
storage (expensive!) through highly fractured ERDs and extensive use of 
integer keys. Today, storage is cheap, computation less so, and human brain 
time spent searching, deduplicating, and interpreting is the most expensive of 
all.

## Fishtown's Thoughts

To that end, we've spent time developing a vocabulary and an architecture for 
thinking about data warehouse design, working in concert with our dbt-driven 
modeling [best practices](https://docs.getdbt.com/docs/best-practices). 
The [coding conventions](https://github.com/fishtown-analytics/corp/blob/master/dbt_coding_conventions.md)
are still as true as ever; we're applying the same thinking 
beyond the `select` statement, to the repo and warehouse levels.

### Note on Custom Schemata

The concept of a folder hierarchy is standard; the organization of views and
tables within a database schema, less so. dbt offers a lot by way of 
[custom schema names](https://docs.getdbt.com/docs/using-custom-schemas), and
soon [model aliasing](https://github.com/fishtown-analytics/dbt/pull/800) as well.
Different data warehouses add levels to the hierarchy, and levers to your toolkit: 
Snowflake allows an arbitrary number of logical databases; models in one BigQuery
project can select data from another one, if you have access to both.

A significant theme is the relationship between folder structure in a dbt repo
and the schema structure of its target warehouse. We prefer setting high-level
configurations in `dbt_project.yml`, where possible, and selecting only a
specific set of models—`stg_` views and `fct_` tables—to expose in the
tangible warehouse.

This can be as simple as making all intermediate scripts
a mix of ephemeral models (compiled SQL code that dbt injects in place of `ref()`
statements) and tables in an unexposed schema. It can be as fancy as setting
up Raw and Analytics logical databases in Snowflake, with a `salesforce.account`
in each.

### Staging Raw Data

The staging model is the atomic unit of data modeling. Each model bears a 
one-to-one relationship with the raw data table it represents: 
`salesforce.account` becomes `stg_salesforce_account`. It has the same
granularity, but the columns have been renamed, recast, or usefully
reconsidered.

Every raw data table should still flow through a base model of the form:
```sql
with source as (
    
    select * from raw_schema.raw_table
    
),

renamed as (
    
    select
    
        firstname as first_name,
        createdat::date as created_at,
        ...
    
)

select * from renamed
```
Depending on the quality of raw data, this base model could also be a staging
model. A staged view might just as well warrant several models' worth of cleaning, 
correcting, and categorizing. Raw data comes as it is; staging data is clean, 
presentable, and ready for the curtain to rise.

Staging models **can** have joins in them to field additional columns for context 
or enrichment; add rows through unions and remove them through filters;
deduplicate a natural key or hash together a 
[surrogate one](https://github.com/fishtown-analytics/dbt-utils#surrogate_key-source); 
but they should **not** have `group by` aggregations that would change their 
granularity. The `stg_salesforce_account` model should have one account per row, 
and `account_id` as its primary key.

In our experience, it is most helpful to have all of these models within a
single `models/staging` folder, with one subfolder for each datasource:

```yml
staging:
    salesforce:
        schema: stg_salesforce
        base:
            materialized: ephemeral
            # salesforce_account_base.sql
        stg:
            materialized: view
            # stg_salesforce_account.sql
    snowplow:
        schema: stg_snowplow
        ...
```

### Marts of Facts

Complex logical rollups can and should happen across several models, with
discrete steps and abstractions split into queries of 100 lines or fewer. The
end of these rollups is a table, exposed to end-users and aptly prefixed `fct_`:
it contains the facts that a good reporter seeks.

Marts are stores of one or more fact tables, related primarily by their use case
in analysis and reporting. They could be organized by business unit, high-level 
concept, or intended set of end-users: `marketing`, `finance`, `product`, 
etc. Some fact tables form the basis for other ones and are used across the
project; you might gird these keystones into a `core` folder, and `ref()` them
at will.

Each mart often contains one or more transformation flows, during which staging
data is rolled up, aggregated, nested, or otherwise altered in a more
significant, structured way. These intermediate models should _not_ be exposed;
they can be ephemeral or, as materializing becomes necessary for performance
reasons, built as tables in a cordoned-off intermediate schema. (It should be
named something that says "I'm incomplete and not to be trusted", like `intermediate`.)

Where the work of staging models is limited to cleaning and preparing, fact
tables are the product of substantive data transformation: choosing (and reducing)
dimensions, date-spining, executing business logic, and making informed,
confident decisions. Staging models are your supply chain; marts are your
department store floor.

### Accessories to Data

There are other kinds of SQL files that find their way into robust dbt projects.
In some cases, they offer utilities that extend your SQL, even in BI tools;
in other cases, they exist for specific end-users, and should be put into a
specially-permissioned schema accordingly.

In addition to `staging` and `marts`, you may find yourself with model folders
such as:

**Utils:** An `all_days` table. This is useful everywhere, though it never
forms the basis for analysis/reporting. Consider a `utils` schema.

**Lookups:** A user-mapping table, a zipcode-country table, etc. You may
reference it at several unpredictable points throughout modeling, and maybe
even in a BI tool. These too may find themselves at home in a `utils` schema.

**Admin:** Audit logs, warehouse operations, Redshift maintenance, 
and incremental records of the miscellaneous DDL you run to make your project
run smoothly. These make most sense in an `admin` schema, to which only
admins have access.

**Metrics:** Precisely defined measurements taken from fact tables, directly
conducive to time-series reporting, and tightly structured so as to allow 
one-to-one comparison with goals and forecasting. A metrics table lives
downstream of fact tables in your DAG and deserves special status.

**Packages:** While not a model folder within your main project, packages
that include models (like our [snowplow](https://github.com/fishtown-analytics/snowplow) 
package) can be configured into custom schema and materialization patterns
from `dbt_project.yml`.

### Postscript

These thoughts are and continue to be in-progress. Fixing the scourge of
incomprehensible SQL was one thing—you know bad code when you see it. Devising
best practices for building, expanding, maintaining, and naming projects with
hundreds of models and dozens of meaningful tables is a challenge. Trying to do
so across a team of analysts, without a system of guidelines and
conventions, is nigh impossible.
