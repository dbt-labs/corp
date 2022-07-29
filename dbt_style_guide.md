# dbt Style Guide

## Model Organization  
Our models (typically) fit into two main categories:

| Category | Description                                             |
|----------|---------------------------------------------------------|
| Staging  | Contains models which clean and standardize data        |
| Marts    | Contains models which combine or heavily transform data |
  
Things to note:
- There are different types of models
that typically exist in each of the above categories.  
See [dbt Conventions](https://github.com/dbt-labs/corp/blob/main/dbt_style_guide.md#dbt-conventions) 
for more information. 

- Read [How we structure our dbt projects](https://docs.getdbt.com/guides/best-practices/how-we-structure/1-guide-overview) for an example and more details around organization.

## Modeling Conventions
- Only models in `staging` should select from [sources](https://docs.getdbt.com/docs/building-a-dbt-project/using-sources)
- Models not within the `staging` folder should select from [refs](https://docs.getdbt.com/reference/dbt-jinja-functions/ref).
- The following are the DAG stages that we tend to utilize:
  <details>

  <summary>Common</summary>

    | dag_stage | Typically found in | description                                                        |
    |-----------|--------------------|--------------------------------------------------------------------|
    | seed_     | /data              | <li> Indicates a data set created from `dbt seed`. |
    | stg_      | /models/staging    | <li> Indicates a data set that is being cleaned and standardized. </li><li> In absence of a base_ layer, it represents the 1:1 relationship between the source and first layer of models. </li> |                                                                                                           |
    | int_      | /models/marts      | <li> Indicates a logical step towards creating a final data set. </li><li>Typically used for:</li><ul><li>Breaking up a very large fct_ or dim_ model into smaller pieces to reduce complexity</li><li>Creating a reusable data set to reference in multiple downstream fct_ and dim_ models</li></ul> |
    | dim_      | /models/marts      | <li> Flags data which is used to describe an entity. </li><li> Indicates a final data which is robust, versatile, and ready for consumption. </li> |
    | fct_      | /models/marts      | <li> Flags data which is in the form of numeric facts observed during measurement events. </li><li> Indicates a final data which is robust, versatile, and ready for consumption. </li> |
  
  </details>

  <details>

  <summary>Uncommon</summary>

    | dag_stage | Typically found in | description                                                        |
    |-----------|--------------------|--------------------------------------------------------------------|
    | base_     | /models/staging    | <li> Indicates cleaning and standardization on a data set before joining to other data sets in `stg_` models.<li> Typically used when multiple sources are rarely used independently. <br/><br/> <strong><em>Example</strong></em>: <br>Location data in our org is seldom used partially, so we want to create one cleaned data set which puts it all together. <br/><br/> <em>Step 1</em>: Models to clean and standardize each data set:<br/><ul><li>base_location__addresses.sql</li><li>base_location__countries.sql</li><li>base_location__states.sql</li></ul><br/><em>Step 2</em>: A model to join all location data as one entity for use in downstream modeling:<ul><li>stg_location__locations.sql</li></ul> |
    | report_   | /models/reports    | Indicates that a final data sets are being modeled to pre-aggregate reports for use in outside tooling.                                                                                                                    |

  </details>

## Model Naming

- All objects should be plural.  
  Example: `stg_stripe__invoices.sql` vs. `stg_stripe__invoice.sql`

- All objects should have a prefix to indicate their DAG stage in the flow.  
  See [dbt Conventions](https://github.com/dbt-labs/corp/blob/main/dbt_style_guide.md#dbt-conventions) for more information.

- All models should use the naming convention `<type/dag_stage>_<source/topic>__<additional_context>`. See [this article](https://docs.getdbt.com/blog/stakeholder-friendly-model-names) for more information.
  - For models in the **marts** folder `__<additional_context>` is optional. 
  - Models in the **staging** folder should use the source's name as the `<source/topic>` and the entity name as the `additional_context`.

    Examples:
    - seed_snowflake_spend.csv
    - base_stripe__invoices.sql
    - stg_stripe__customers.sql
    - int_payments.sql
    - int_customers__unioned.sql
    - fct_orders.sql

## Naming Conventions

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

## Model Configurations

- Model configurations at the [folder level](https://docs.getdbt.com/reference/model-configs#configuring-directories-of-models-in-dbt_projectyml) should be considered (and if applicable, applied) first.
- More specific configurations should be applied at the model level [using one of these methods](https://docs.getdbt.com/reference/model-configs#apply-configurations-to-one-model-only).
- Models within the `marts` folder should be materialized as `table` or `incremental`.
  - By default, `marts` should be materialized as `table` within `dbt_project.yml`.
  - If switching to `incremental`, this should be specified in the model's configuration.

## Testing

- At a minimum, `unique` and `not_null` tests should be applied to the expected primary key of each model.

## CTEs

For more information about why we use so many CTEs, check out [this glossary entry](https://docs.getdbt.com/terms/cte).

- Where performance permits, CTEs should perform a single, logical unit of work.

- CTE names should be as verbose as needed to convey what they do.

- CTEs with confusing or noteable logic should be commented with SQL comments as you would with any complex functions, and should be located above the CTE.

- CTEs that are duplicated across models should be pulled out and created as their own models.

- CTEs fall in to two main categories:
  | Term    | Definition                                                                                                                                                             |
  |---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | Import  | Used to bring data into a model. These are kept relatively simple and refrain from complex operations such as joins and column transformations.                        |
  | Logical | Used to perform a logical step with the data that is brought into the model toward the end result. |

- All `{{ ref() }}` or `{{ source() }}` statements should be placed within import CTEs so that dependent model references are easily seen and located.

- Where applicable, opt for filtering within import CTEs over filtering within logical CTEs. This allows a developer to easily see which data contributes to the end result.

- SQL should end with a simple select statement. All other logic should be contained within CTEs to make stepping through logic easier while troubleshooting.
  Example: `select * from final`

- SQL and CTEs within a model should follow this structure:
  - `with` statement
  - Import CTEs
  - Logical CTEs
  - Simple select statement

### Example SQL with CTEs

  ``` sql
  with 

  -- Import CTEs
  suppliers as (
      select * from {{ ref('stg_tpch__suppliers') }}
  ),

  nations as (
      select * from {{ ref('stg_tpch__nations') }}
  ),

  regions as (
      select * from {{ ref('stg_tpch__regions') }}
  ),

  -- Logical CTEs
  locations as (
      select
          {{ dbt_utils.surrogate_key([
              'regions.region_id',            
              'nations.nation_id'
          ]) }} as location_sk,

          regions.region_id,
          regions.name as region,
          regions.comment as region_comment,

          nations.nation_id,
          nations.name as nation,
          nations.comment as nation_comment
        from regions
      left join nations
          on regions.region_id = nations.region_id
  ),
  
  final as (
      select
          suppliers.supplier_id,
          suppliers.supplier_name,
          suppliers.supplier_address,
          locations.nation,
          locations.region,
          suppliers.phone_number,
          suppliers.account_balance
      from suppliers
      inner join locations
          on suppliers.nation_id = locations.nation_id
  )

  -- Simple select statement
  select * from final
  ```

## SQL style guide
- **DO NOT OPTIMIZE FOR A SMALLER NUMBER OF LINES OF CODE.**  
  New lines are cheap, brain time is expensive; new lines should be used within  
  reason to produce code that is easily read.

- Use trailing commas

- Indents should use four spaces. 

- When dealing with long `when` or `where` clauses, predicates should be on a new
  line and indented.  
  Example:
  ```sql
  where 
      user_id is not null
      and status = 'pending'
      and location = 'hq'
  ```

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

- Our convention is to use all lowercase unless a specific scenario needs us to
  do otherwise. This means that keywords, field names, function names, and file names
  should all be lowercased.

- The `as` keyword should be used when aliasing a field or table

- Fields should be stated before aggregates / window functions

- Aggregations should be executed as early as possible before joining to another table.

- Ordering and grouping by a number (eg. group by 1, 2) is preferred over listing the column names (see [this rant](https://blog.getdbt.com/write-better-sql-a-defense-of-group-by-1/) for why). Note that if you are grouping by more than a few columns, it may be worth revisiting your model design. If you really need to, the [dbt_utils.group_by](https://github.com/dbt-labs/dbt-utils/tree/0.8.6/macros/sql/groupby.sql) function may come in handy.

- Prefer `union all` to `union` [*](http://docs.aws.amazon.com/redshift/latest/dg/c_example_unionall_query.html)

- Avoid table aliases in join conditions (especially initialisms) – it's harder to understand what the table called "c" is compared to "customers".

- If joining two or more tables, _always_ prefix your column names with the table alias. If only selecting from one table, prefixes are not needed.

- Be explicit about your join (i.e. write `inner join` instead of `join`). `left joins` are the most common, `right joins` often indicate that you should change which table you select `from` and which one you `join` to.

- Joins should list the left table first (i.e., the table you're joining data to)  
  Example:
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
      qualify row_number() over(
          partition by my_data.field_1
          order by my_data.start_date desc
      ) = 1
  )

  select * from final
  ```

## YAML and Markdown style guide

- Every subdirectory contains their own `.yml` file(s) which contain configurations for the models within the subdirectory.

- YAML and markdown files should be prefixed with an underscore ( `_` ) to keep it at the top of the subdirectory.

- YAML and markdown files should be named with the convention `_<description>_<config>`.  
  Examples: `_jaffle_shop_sources.yml`, `_jaffle_shop_docs.md`  
  - `description` is typically the folder of models you're setting configurations for.  
    Examples: `core`, `staging`, `intermediate`
  - `config` is the top-level resource you are configuring.  
    Examples: `docs`, `models`, `sources`
- Indents should use two spaces.

- List items should be indented.

- Use a new line to separate list items that are dictionaries, where appropriate.

- Lines of YAML should be no longer than 80 characters.

- Items listed in a single .yml or .md file should be sorted alphabetically for ease of finding in larger files.

- Each top-level configuration should use a separate `.yml` file (i.e, sources, models)
  Example:
  ```bash
  models
  ├── marts
  └── staging
      └── jaffle_shop
          ├── _jaffle_shop_docs.md
          ├── _jaffle_shop__models.yml
          ├── _jaffle_shop__sources.yml
          ├── stg_jaffle_shop__customers.sql
          ├── stg_jaffle_shop__orders.sql
          └── stg_jaffle_shop__payments.sql
  ```

### Example YAML
  `_tpch_models.yml`:
  ```yaml
  version: 2

  models:
  
    - name: base_tpch__nations
      description: This model cleans the raw nations data
      columns:
        - name: nation_id
          tests:
            - unique
            - not_null   

    - name: base_tpch__regions
      description: >
        This model cleans the raw regions data before being joined with nations
        data to create one cleaned locations table for use in marts.
      columns:
        - name: region_id
          tests:
            - unique
            - not_null

    - name: stg_tpch__locations
      description: "{{ doc('tpch_location_details') }}"
      columns:
        - name: location_sk
          tests:
            - unique
            - not_null
  ```

  ### Example Markdown
  `_jaffle_shop_docs.md`:
  ```markdown
    {% docs enumerated_statuses %}
      
      Although most of our data sets have statuses attached, you may find some
      that are enumerated. The following table can help you identify these statuses.
      | Status | Description                                                                 |
      |--------|---------------|
      | 1      | ordered       |
      | 2      | shipped       |
      | 3      | pending       |
      | 4      | order_pending | 

      
  {% enddocs %}

  {% docs statuses %} 

      Statuses can be found in many of our raw data sets. The following lists
      statuses and their descriptions:
      | Status        | Description                                                                 |
      |---------------|-----------------------------------------------------------------------------|
      | ordered       | A customer has paid at checkout.                                            |
      | shipped       | An order has a tracking number attached.                                    |
      | pending       | An order has been paid, but doesn't have a tracking number.                 |
      | order_pending | A customer has not yet paid at checkout, but has items in their cart. | 

  {% enddocs %}
  ```
## Jinja style guide

- Jinja delimiters should have spaces inside of the delimiter between the brackets and your code.  
  Example: `{{ this }}` instead of `{{this}}`

- Use [whitespace control](https://jinja.palletsprojects.com/en/3.1.x/templates/#whitespace-control) to make compiled SQL more readable.

- An effort should be made for a good balance in readability for both templated 
and compiled code. However, opt for code readability over compiled SQL readability
when needed.

- A macro file should be named after the _main_ macro it contains.

- A file with more than one macro should follow these conventions:
  - There is one main macro which is the main focal point
  - The file is named for the main macro or idea
  - All other macros within the file are only used for the purposes of the main 
    idea and not used by other macros outside of the file.

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