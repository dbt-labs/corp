# Data Warehouse Design: Conventions & Best Practices

## Old Paradigm

Once upon a time, at Fishtown Analytics, data warehouse design patterns were few 
and far between. dbt requires different names for each SQL file in a project, 
so when we needed to make significant alterations to `salesforce_account`, we'd 
do so in new models with names like `salesforce_account_xf`, `_enriched`, 
or `_joined`—naming conventions that lacked internal consistency or interpersonal
clarity. All four models would materialize, as tables and views, in the same 
schema. When a BI user wants to learn about Salesforce
accounts, they have not one but four sources of truth.

Enter: principles of data warehouse design.

Thoughtful people have been thinking about this for decades. In the past, 
best practices were influenced by their design patterns, but they were equally
motivated by the trade-offs and limitations of database technology. Star schemas,
highly fractured ERDs, tables full of foreign keys, and curated
preaggregations make more sense in a world where storage is expensive and joins
are cheap. Modern analytic databases, such as BigQuery and Snowflake, present
the opposite dilemma: storage is cheap, multi-TB table scans less so; and human 
brain time spent searching, deduplicating, and interpreting is the most 
expensive of all.

## Fishtown's Thoughts

To that end, we've spent time developing a vocabulary and an architecture for 
thinking about data warehouse design, working in concert with our dbt-driven 
modeling [best practices](https://docs.getdbt.com/docs/best-practices). 
The [coding conventions](https://github.com/fishtown-analytics/corp/blob/master/dbt_coding_conventions.md)
are still as true as ever; we're applying the same thinking 
beyond the `select` statement, to the repo and warehouse levels.

dbt the open-source software has one (version 0) API, but your dbt _project_ has 
several: the organizational structure within a `models` directory; the 
transformation graph (DAG) visible in 
[dbt docs](https://github.com/fishtown-analytics/dbt-docs); and the 
"transformed" views, tables, and schemata in the database. Each of these can and
should be a usable interface into an organization's analytics, with consistent
patterns across the three.

### A Note on Custom Schemata

Up to this point, the concept of a folder hierarchy is standard; the 
organization of views and tables within a database schema, less so. dbt offers a 
lot by way of [custom schema names](https://docs.getdbt.com/docs/using-custom-schemas) 
and [model aliasing](https://docs.getdbt.com/docs/using-custom-aliases).
Different data warehouses add levels to the hierarchy, and levers to your 
toolkit: Snowflake allows an arbitrary number of logical databases; models in 
one BigQuery project can select data from another one, so long as dbt's user has 
access to both.

The single most significant improvement we can make as dbt practioners is
solidifying the relationship between `models` folder organization
and schema allocation in the warehouse. We prefer setting high-level
configurations in `dbt_project.yml`, where possible, and selecting only a
specific set of models—`stg_` views and `fct_` tables—to expose as tangible
goods in a select few production-grade schemata.

This can be as simple as making all intermediate scripts ephemeral models where
possible, and tables in an unexposed schema (`intermediate`) where query 
performance requires. (Ephemeral models become compiled SQL code that dbt adds 
as CTEs in place of `ref()` statements in downstream models.) It can be as fancy 
as setting up Raw and Analytics logical databases in Snowflake, with a 
`salesforce.account` in each: one loaded as-is by an off-the-shelf tool; the
other cleaned, renamed, processed, and ready for querying in analysis or audit.

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

### Facts, Dimensions, Marts

Complex logical rollups can and should happen across several models, with
discrete steps and abstractions split into queries of no more than a few
hundred lines. The end result of these rollups is one or more "good" tables,
exposed to end-users and aptly prefixed `fct_` or `dim_`:
it contains the facts and dimensions that a good reporter seeks.

In our Kimball-lite stage of the world, facts and dims are the leading players:

* **fct_verb:** A tall, narrow table recording real-world processes that
have occurred or are occurring. The heart of these tables is usually an
immutable event stream: sessions, transactions, orders, stories, votes, and
so on.

* **dim_noun:** A wide, squat table where each row is a person, place, or thing;
the ultimate source of truth when identifying and describing entities of the 
organization. They are mutable, though slowly changing: customers, products, 
candidates, buildings, employees.

Dimension tables can be the best friends of end users: they can pivot their way 
across useful flags and meaningful aggregates. If dims are the goal, flattening 
facts is the best means of getting there. By first building `fct_order`,
we're a simple sum away from calculating lifetime revenue in `dim_customer`.

**Marts** are stores of fact and dimension tables, related primarily by their use case
in analysis and reporting. They should be organized by business unit, high-level 
concept, or intended set of end-users: `marketing`, `finance`, `product`, 
etc. Some fact tables form the basis for dim tables or other facts, used widely across the
project. You might gird these keystones into a `core` folder, and `ref()` them
at will.

Each mart often contains one or more transformation flows, during which staging
data is rolled up, aggregated, nested, or otherwise altered in a more
significant, structured way. These intermediate models should _not_ be exposed;
they can be ephemeral or, as materializing becomes necessary for performance
reasons, built as tables in a cordoned-off intermediate schema. (It should be
named something that says "I'm incomplete and not to be trusted", such as 
`intermediate`.)

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
forms the basis for analysis/reporting. If you are interested in keeping
these separate from your core analytical assets, consider a `utils` schema.

**Lookups:** A user-mapping table, a zipcode-country table, etc. These are
as likely to be [CSV seeds](https://docs.getdbt.com/v0.12/reference#seed) as 
tables in a production database. You may reference it at several unpredictable 
points throughout modeling, and maybe even in a BI tool. They too may find 
themselves at home in a `utils` schema.

**Admin:** Audit logs, warehouse operations, Redshift maintenance, 
and incremental records of the miscellaneous DDL you run to make your project
run smoothly. These make most sense in an `admin` schema, to which only
project administrators have query access.

**Metrics:** Precisely defined measurements taken from fact tables, directly
conducive to time-series reporting, and tightly structured so as to allow 
one-to-one comparison with goals and forecasting. A metrics table lives
downstream of dim and fact tables in your DAG, and it deserves special status.

**Packages:** While not a model folder within your main project, packages
that include models (like our [snowplow](https://github.com/fishtown-analytics/snowplow) 
package) can be configured into custom schema and materialization patterns
from `dbt_project.yml`.
