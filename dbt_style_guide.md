# dbt Style Guide

## Model Naming

- All objects should be plural.  
  Example: `stg_stripe__invoices.sql` vs. `stg_stripe__invoice.sql`

- All objects should have a prefix to indicate their purpose in the flow:
  - `base_` is uncommon, but indicates a process needed before `stg_` - typically when multiple sources are rarely used independently. The stg_ model is then used to join or union the sources together before more robust transformations happen.  
     
     Example: Creating one table for all cleaned location data.
     - `base_location__addresses.sql`, `base_location__countries.sql`, and `base_location__states.sql`  would serve to clean the data and be the 1:1 relationship between the source.
     - `stg_location__locations.sql` would serve to join all location-related data as one entity.
  - `stg_` is used to clean and standardize data before being fundamentally changed in downstream modeling.
  - `int_` is used to indicate a step towards creating a final model surfaced to stakeholders
  - `fct_` is used to indicate a final data set surfaced to stakeholders, and flags data which is in the form of an immutable event stream.
  - `dim_` is used to indicate a final data set surfaced to stakeholders, and flags data which is used to describe an entity.  

- All models should use the naming convention `<type/dag_stage>_<source/topic>__<additional_context>`. See [this article](https://docs.getdbt.com/blog/stakeholder-friendly-model-names) for more information.
  - Within the **marts** and **intermediate** folders, `__<additional_context>` is optional. 
  - Models in the **staging** folder should use the source's name as the `<source/topic>` and the entity name as the `additional_context`.

  Examples:
  - base_stripe__invoices.sql
  - stg_stripe__customers.sql
  - int_payments.sql
  - int_customers__unioned.sql
  - fct_orders.sql

### Organization
Our models (typically) fit into three main categories: staging, marts, and base/intermediate.  

For more detail about why we use this structure, check out [this discourse post](https://discourse.getdbt.com/t/how-we-structure-our-dbt-projects/355). The file and naming structures are as follows:
```
├── dbt_project.yml
└── models
    ├── marts
    |   ├── core
    |   |   ├── _docs_core.md
    |   |   ├── _models_core.yml
    |   |   ├── dim_customers.sql
    |   |   └── fct_orders.sql
    |   └── intermediate
    |       ├── _models_int_core.yml
    |       ├── int_payments.sql
    |       ├── int_customers__unioned.sql
    |       └── int_customers__grouped.sql
    └── staging
        └── stripe
            ├── base
            |   ├── _models_base_stripe.yml
            |   └── base_stripe__invoices.sql
            ├── _docs_stripe.md
            ├── _models_stripe.yml
            ├── _sources_stripe.yml
            ├── stg_stripe__customers.sql
            └── stg_stripe__invoices.sql
```
## Model configuration

- Model configurations at the [group level](https://docs.getdbt.com/reference/model-configs#configuring-directories-of-models-in-dbt_projectyml) should be considered (and if applicable, applied) first.
- More specific configurations should be applied at the model level [using one of these methods](https://docs.getdbt.com/reference/model-configs#apply-configurations-to-one-model-only).
- Models within the `marts` folder should be materialized as `table` or `incremental`.
  - By default, `marts` should be materialized as `table` within `dbt_project.yml`.
  - If switching to `incremental`, this should be specified in the model's configuration.

## dbt conventions
- Only `base_` and `stg_` models should select from [sources](https://docs.getdbt.com/docs/building-a-dbt-project/using-sources)
- Models not within the `staging` folder should select from [refs](https://docs.getdbt.com/reference/dbt-jinja-functions/ref).

## Testing

- At a minimum, unique and not_null tests should be applied to the assumed primary key of each model.

## Naming and field conventions

- Schema, table and column names should be in `snake_case`.

- Limit use of abbreviations that are related to domain knowledge. An onboarding
  employee will understand `current_order_status` better than `current_os`.

- Use names based on the _business_ terminology, rather than the source terminology.

- Each model should have a primary key that can identify the unique row.

- The primary key of a model should be named `<object>_id`, e.g. `account_id` – this makes it easier to know what `id` is being referenced in downstream joined models.

- If a surrogate key is created, it should be named `<object>_sk`.

- For `base` or `staging` models, columns should be ordered in categories, where identifiers are first and date/time fields are at the end.  
  Example:
  ```sql
  transformed as (

      select

        -- ids
        order_id,
        customer_id,

        -- dimensions
        order_status,
        is_shipped,

        -- measures
        order_total,

        -- metdata
        created_at,
        updated_at,
        _sdc_batched_at

      from source

  )
  ```

- Date/time columns should be named according to these conventions:
  - Timestamps: `<event>_at`
    Format: UTC  
    Example: `created_at`
  
  - Dates: `<event>_date`  
    Format: Date  
    Example: `created_date`

- Booleans should be prefixed with `is_` or `has_`.

- Price/revenue fields should be in decimal currency (e.g. `19.99` for $19.99; many app databases store prices as integers in cents). If non-decimal currency is used, indicate this with suffix, e.g. `price_in_cents`.

- Avoid using reserved words (such as [these](https://docs.snowflake.com/en/sql-reference/reserved-keywords.html) for Snowflake) as column names.

- Consistency is key! Use the same field names across models where possible.  
Example: a key to the `customers` table should be named `customer_id` rather than `user_id`.

## CTEs

For more information about why we use so many CTEs, check out [this glossary entry](https://docs.getdbt.com/terms/cte).

- Where performance permits, CTEs should perform a single, logical unit of work.

- CTE names should be as verbose as needed to convey what they do.

- CTEs with confusing or noteable logic should be commented with SQL comments, as you would with any complex functions.

- CTEs that are duplicated across models should be pulled out and created as their own models.

- CTEs and SQL within a model should follow this structure:
  - `with` statement
  - Import CTEs
  - Logical CTEs
  - Final CTE
  - Simple `select` statement

- All `{{ ref('...') }}` statements should be placed in CTEs at the top of the file ("import" CTEs)

- SQL should end with a simple select statement. All other logic should be contained within CTEs.  
  Example: `select * from final`

- Where applicable, opt for filtering within import CTEs over filtering within logical CTEs.

CTE Example:

``` sql
with

events as (

    ...
    where not is_deleted

),

-- CTE comments go here
filtered_events as (

    ...

)

select * from filtered_events
```

## SQL style guide
*DO NOT OPTIMIZE FOR A SMALLER NUMBER OF LINES OF CODE. NEWLINES ARE CHEAP, BRAIN TIME IS EXPENSIVE* 

- Use trailing commas

- Indents should be four spaces 

- When dealing with long `when` or `where` clauses, predicates should be on a new
  line and indented.

- Lines of SQL should be no longer than 80 characters and new lines should be used to ensure this.  
  Example:
  ```sql
  sum(
    case when order_status = 'complete' then order_total end
  ) as monthly_total,


  {{ get_windowed_values(
        strategy='sum',
        partition='order_id',
        order_by='created_at',
        column_list=[
          'final_cost'
        ]
  ) }} as total_final_cost
  ```

- Field names and function names should all be lowercase

- The `as` keyword should be used when aliasing a field or table

- Fields should be stated before aggregates / window functions

- Aggregations should be executed as early as possible before joining to another table.

- Ordering and grouping by a number (eg. group by 1, 2) is preferred over listing the column names (see [this rant](https://blog.getdbt.com/write-better-sql-a-defense-of-group-by-1/) for why). Note that if you are grouping by more than a few columns, it may be worth revisiting your model design.

- Prefer `union all` to `union` [*](http://docs.aws.amazon.com/redshift/latest/dg/c_example_unionall_query.html)

- Avoid table aliases in join conditions (especially initialisms) – it's harder to understand what the table called "c" is compared to "customers".

- If joining two or more tables, _always_ prefix your column names with the table alias. If only selecting from one table, prefixes are not needed.

- Be explicit about your join (i.e. write `inner join` instead of `join`). `left joins` are normally the most useful, `right joins` often indicate that you should change which table you select `from` and which one you `join` to.

- When filtering by multiple clauses, each clause and expression should be on a new line.  
Example:
  ```sql
  where 
    user_id is not null
    and status = 'pending'
    and location = 'hq'
  ```

- Joins should list the "left" table first (i.e., the table you're joining data to):
```sql
select
    
    trips.*,
    drivers.rating as driver_rating,
    riders.rating as rider_rating

from trips
left join users as drivers
    on trips.driver_id = drivers.user_id
left join users as riders
    on trips.rider_id = riders.user_id

```

### Example SQL
```sql
with

my_data as (

    select * from {{ ref('my_data') }}
    where not is_deleted

),

some_cte as (

    select * from {{ ref('some_cte') }}

),

some_cte_agg as (

    select

        id,
        sum(field_4) as total_field_4,
        max(field_5) as max_field_5

    from some_cte
    group by 1

),

final as (

    select [distinct]

        my_data.field_1,
        my_data.field_2,
        my_data.field_3,

        -- use line breaks to visually separate calculations into blocks
        case
            when my_data.cancellation_date is null
              and my_data.expiration_date is not null
              then expiration_data
            when my_data.cancellation_date is null
              then my_data.start_date + 7
            else my_data.cancellation_date
        end as cancellation_date,

        some_cte_agg.total_field_4,
        some_cte_agg.max_field_5

    from my_data
    left join some_cte_agg  
        on my_data.id = some_cte_agg.id
    where 
      my_data.field_1 = 'abc'
      and (
          my_data.field_2 = 'def'
          or my_data.field_2 = 'ghi'
      )
    having count(*) > 1

)

select * from final

```

## YAML style guide

- Every subdirectory contains their own `.yml` file(s) which contain configurations for the models within the subdirectory.

- A separate `.yml` file is created per top-level configuration (`sources`, `models`) that applies to the models within the subdirectory. 

- YAML files should be prefixed with an underscore to keep it at the top of the subdirectory.  
  Example: `__sources_core.yml`, `_models_core.yml`

- YAML files should be named for the top-level configuration it contains.  
  Examples: `_sources_core.yml`, `_models_core.yml`

- Indents should use four spaces.

- List items should be indented.

- Use a new line to separate list items that are dictionaries, where appropriate.

- Lines of YAML should be no longer than 80 characters.

### Example YAML
```yaml
version: 2

models:
  - name: stg_snowplow__events
    description: This model contains events from the core Jaffle Shop website.
    columns:
      - name: event_id
        description: "{{ doc('event_id_description') }}"
        tests:
          - unique
          - not_null

      - name: event_at
        description: When the event occurred in UTC (eg. 2018-01-01 12:00:00)
        tests:
          - not_null

      - name: user_id
        description: >
          The user id of the visitor to the site.
          This only populates when the user logs in - this user id can be  
          joined to the Jaffle Shop Users data.
        tests:
          - not_null
          - relationships:
              to: ref('users')
              field: id
```


## Jinja style guide

- Jinja delimiters should have spaces inside of the delimiter between the brackets and your code.  
  Example: `{{ this }}` instead of `{{this}}`
- Use new lines to visually indicate logical blocks of Jinja or to enhance readability.  
  Example:  
  ```jinja 
  {%- set orig_cols = adapter.get_columns_in_relation(ref('fct_orders')) %}

  {%- set new_cols = dbt_utils.star(
        from=ref('fct_order_items'),
        except=orig_cols
  ) %}

  -- original columns. {{ col }} is indented here, but choose what will satisfy
  -- your own balance for Jinja vs. SQL readability. 
  {%- for col in orig_cols %}
      {{ col }}
  {% endfor %}

  -- column difference
  {{ new_cols }}
  ```
- Use new lines within Jinja delimiters and arrays if there are multiple arguments.  
  Example:
  ```jinja
  {%- dbt_utils.star(
      from=ref('stg_jaffle_shop__orders'),
      except=[
        'order_id',
        'ordered_at',
        'status'
      ],
      prefix='order_'
  ) %}
  ```
- Opt for code readability over compiled SQL readability.