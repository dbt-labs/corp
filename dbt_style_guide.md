# dbt Style Guide

## Model Naming

- All objects should be plural.  
  Example: `stg_stripe__invoices.sql` vs. `stg_stripe__invoice.sql`

- All objects should have a prefix to indicate their DAG stage in the flow.  
  See [dbt Conventions](https://github.com/dbt-labs/corp/blob/main/dbt_style_guide.md#dbt-conventions) for more information.

- All models should use the naming convention `<type/dag_stage>_<source/topic>__<additional_context>`. See [this article](https://docs.getdbt.com/blog/stakeholder-friendly-model-names) for more information.
  - Within the **marts** and **intermediate** folders, `__<additional_context>` is optional. 
  - Models in the **staging** folder should use the source's name as the `<source/topic>` and the entity name as the `additional_context`.

    Examples:
    - seed_snowflake_spend.csv
    - base_stripe__invoices.sql
    - stg_stripe__customers.sql
    - int_payments.sql
    - int_customers__unioned.sql
    - fct_orders.sql

## Model Organization  
Our models (typically) fit into two main categories:

| Category | Description                                             |
|----------|---------------------------------------------------------|
| Staging  | Contains models which clean and standardize data        |
| Marts    | Contains moels which combine or heavily transform data |

Things to note:
- There are different types of models
that typically exist in each of the above categories.  
See [dbt Conventions](https://github.com/dbt-labs/corp/blob/main/dbt_style_guide.md#dbt-conventions) 
for more information. 

- Read [How we structure our dbt projects](https://docs.getdbt.com/guides/best-practices/how-we-structure/1-guide-overview) to see how we typically structure our projects and further thoughts around organization.

## Model configurationd

- Model configurations at the [group level](https://docs.getdbt.com/reference/model-configs#configuring-directories-of-models-in-dbt_projectyml) should be considered (and if applicable, applied) first.
- More specific configurations should be applied at the model level [using one of these methods](https://docs.getdbt.com/reference/model-configs#apply-configurations-to-one-model-only).
- Models within the `marts` folder should be materialized as `table` or `incremental`.
  - By default, `marts` should be materialized as `table` within `dbt_project.yml`.
  - If switching to `incremental`, this should be specified in the model's configuration.

## dbt Conventions
- Only `base_` and `stg_` models should select from [sources](https://docs.getdbt.com/docs/building-a-dbt-project/using-sources)
- Models not within the `staging` folder should select from [refs](https://docs.getdbt.com/reference/dbt-jinja-functions/ref).
- The following are the DAG stages that we tend to utilize:
  <details>

  <summary>Common</summary>

    | dag_stage | Typically found in | description                                                        |
    |-----------|--------------------|--------------------------------------------------------------------|
    | seed_     | /data              | <li> Indicates a data set created from `dbt seed`. |
    | stg_      | /models/staging    | <li> Indicates a data set that is being cleaned and standardized. </li><li> In absence of a base_ layer, it represents the 1:1 relationship between the source and first layer of models. </li> |                                                                                                           |
    | int_      | /models/marts      | <li> Indicates a logical step towards creating a final data set. </li> |
    | dim_      | /models/marts      | <li> Flags data which is used to describe an entity. </li><li> Indicates a final data which is robust, versatile, and ready for consumption. </li> |
    | fct_      | /models/marts      | <li> Flags data which is in the form of an immutable event stream. </li><li> Indicates a final data which is robust, versatile, and ready for consumption. </li> |
  
  </details>

  <details>

  <summary>Uncommon</summary>

    | dag_stage | Typically found in | description                                                        |
    |-----------|--------------------|--------------------------------------------------------------------|
    | base_     | /models/staging    | <li> Indicates cleaning and standardization on a data set before joining to other data sets in `stg_` models.<li> Typically used when multiple sources are rarely used independently. <br/><br/> <strong><em>Example</strong></em>: <br>Location data in our org is seldom used partially, so we want to create one cleaned data set which puts it all together. <br/><br/> <em>Step 1</em>: Models to clean and standardize each data set:<br/><ul><li>base_location__addresses.sql</li><li>base_location__countries.sql</li><li>base_location__states.sql</li></ul><br/><em>Step 2</em>: A model to join all location data as one entity for use in downstream modeling:<ul><li>stg_location__locations.sql</li></ul> |
    | report_   | /models/reports    | Indicates that a final data sets are being modeled to pre-aggregate reports for use in outside tooling.                                                                                                                    |

  </details>

## Testing

- At a minimum, `unique` and `not_null` tests should be applied to the expected primary key of each model.

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

        -- date/times
        created_at,
        updated_at,

        -- metadata
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
  Example: `is_active_customer` and `has_admin_access`

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

- ### Example CTE

  ``` sql
  with

  events as (

      ...
      where not is_deleted

  ),

  -- CTE comments go here
  events_joined as (

      ...

  )

  select * from events_joined
  ```

## SQL style guide
- **DO NOT OPTIMIZE FOR A SMALLER NUMBER OF LINES OF CODE.**  
  New lines are cheap, brain time is expensive; new lines should be used within  
  reason to produce code that is easily read.

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

- ### Example SQL
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

- ### Example YAML
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

- Use [whitespace control](https://jinja.palletsprojects.com/en/3.1.x/templates/#whitespace-control) to make compiled SQL more readable.

- An effort should be made for a good balance in readability for both templated 
and compiled code. However, opt for code readability over compiled SQL readability
when needed.

- A macro file should be named after the _main_ macro it contains.

- A file with more than one macro which will be used independently should follow
these conventions:
  - The macros are all related to a main idea 
  - The file is named for the main idea 

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