# Looker Style Guide
To understand what goes in dbt vs Looker, please reference Tristan's article: "[How do you decide what to model in dbt vs LookML?](https://blog.getdbt.com/-how-do-you-decide-what-to-model-in-dbt-vs-lookml--/)". We believe that all business logic should live within dbt and we rarely ever use PDTs or extended views. If you find yourself reaching to create a PDT, then perhaps consider whether it should be a dbt model.

## Structure of our LookML project
When structuring our LookML project, our views' folders should loosely reflect the structure of our dbt project with the name of the views representing our business units. For example, we have our core business units (e.g. customers) and our dbt Cloud business units (e.g. accounts, cloud projects, etc) which are similar to our [marts folder](https://github.com/fishtown-analytics/internal-analytics/tree/main/models/marts).

Think of views as raw ingredients that are in the vegetable/fruit aisles in a grocery store. They are ingredients that can be combined and packaged into a product that fits our customers' needs. These "packaged items" are explores. More on that below.

```
fishtown project
├── core
│   └── customers.view
├── csm
│   └── sprints.view
├── dbt_cloud
│   ├── cloud_accounts.view
│   ├── cloud_ide_sessions.view
│   └── cloud_projects.view
├── dbt_core
│   ├── dbt_doc_viewer_activity.view
│   └── dbt_projects.view
├── finance
│   ├── quickbook_invoices.view
│   └── subscription_transactions.view
└── fishtown.model
```

Explores should be optimized for the business stakeholder where we're getting the best represented business unit to run our analyses off of. This means that explores should be organized based on department or category of the business unit. For example, we have several Slack views, but maybe they all join under a singular `Slack Messages` explore, which should fall under the `Community` category.

Building off of our above analogy, explores are the packaged items that can combine ingredients (views) to suit a customer's needs. We can utilize various views to create different explores.


## Views

#### Structure
* A view's name should represent the business unit (i.e. the level of granularity of the table). For example, if we're taking `fct_intercom_conversations`, then the view name should be: `intercom_conversations`.
* The `sql_table_name` should always have the [user attribute feature](https://blog.getdbt.com/how-to-integrate-dbt-and-looker-with-user-attributes/). You can set your dbt schema in your [Account settings](https://fishtown.looker.com/account).
* Parameters and their dimensions should be listed first
* Dimensions and measures should be organized by group label

### Drill fields
 * These should be listed under the `Dimensions` section where the name of the drill set should reflect the level of granularity/information that the set offers (e.g. "Account Information" - this contains all information about the account such as: identifier, name, plan, and created date). See the below example as a reference.

#### Dimensions & Measures
* Dimensions and measures should be ordered as (if fields are applicable):
  - name
  - label _(optional)_
  - group_label
  - description
  - primary_key _(optional)_
  - hidden _(optional)_
  - type
  - sql
  - value_format_name _(optional)_
  - filter _(optional)_
  - drill_field _(optional)_
* Primary keys for the view should be the first dimension listed (IDs always come first, similar to our [SQL Style Guide](https://github.com/fishtown-analytics/corp/blob/master/dbt_coding_conventions.md)) and most times should be hidden. This allows us to understand the granularity of the view and is required if you want to use joins on the view.
* All dimensions and measures should have a description. This is especially important when we have common dimension/measure names across views (e.g. `created_at`). Descriptions should describe the definition, use case and/or calculation.
* There should be a dimension for every field that exists in the table that the view is built off of. If the dimension is not useful for visualizations (e.g. an `id` field created via the surrogate key) then it should be flagged as hidden.
* We prefer `value_format_name` over `value_format`
* Measures should reference the dimension (e.g. `${order_total}` over `${TABLE}.order_total`). This is because if you were to change the definition of `${order_total}` in the dimension, then it wouldn't be reflected in the measure aggregation if you used `${TABLE}.order_total`

#### Example

```
view: intercom_conversations {
  sql_table_name:
  -- if prod -- analytics.analytics.fct_intercom_conversations
  -- if dev -- analytics.{{_user_attributes['dbt_schema']}}.fct_intercom_conversations ;;


# =============================================== PARAMETERS

  parameter: date_granularity {
    type: string
    allowed_value: { value: "Day" }
    allowed_value: { value: "Month" }
    allowed_value: { value: "Quarter" }
    allowed_value: { value: "Year" }
  }

  dimension: date {
    label_from_parameter: date_granularity
    sql:
        CASE
         WHEN {% parameter date_granularity %} = 'Day' THEN ${day_in_funnel_date}
         WHEN {% parameter date_granularity %} = 'Month' THEN ${day_in_funnel_month}
         WHEN {% parameter date_granularity %} = 'Quarter' THEN ${day_in_funnel_quarter}
         WHEN {% parameter date_granularity %} = 'Year' THEN ${day_in_funnel_year}
         ELSE NULL
        END ;;
  }

# =============================================== DIMENSIONS

# ==================== IDs
  dimension: conversation_id {
    group_label: "Identifiers"
    description: "Primary key for the table. Links to the intercom conversation thread."
    primary_key: yes
    hidden: yes
    type: string
    sql: ${TABLE}."CONVERSATION_ID" ;;
    link: {
      label: "Intercom Link"
      url: "https://app.intercom.com/a/apps/c15gqki8/inbox/inbox/all/conversations/{{ value }}"
    }
  }
  dimension: customer_id {
    group_label: "Identifiers"
    description: "The identifier for the customer."
    type: string
    sql: ${TABLE}."CUSTOMER_ID" ;;
  }

# ==================== Conversations
  dimension: responses {
    group_label: "Conversation response metrics"
    description: "Sum of admin and user responses"
    type: number
    sql: ${TABLE}."TOTAL_RESPONSES" ;;
  }

# ==================== Timestamps
  dimension_group: updated {
    group_label: "Timestamps"
    description: "Timestamp of last alterations EST"
    hidden: yes
    type: time
    timeframes: [
     raw,
     time,
     date,
     week,
     month,
     quarter,
     year
    ]
    sql: ${TABLE}."UPDATED_AT" ;;
    convert_tz: no
  }


# =============================================== DRILL FIELDS

  set: account_information {
    fields: [
      account_id,
      account_name,
      plan,
      created_date
      ]
  }

# =============================================== MEASURES

# ==================== SLA performance   
  measure: total_responses {
    group_label: "SLA Performance"
    description: "The total responses within an Intercom conversation (both admin and user)"
    type: sum
    sql: ${responses} ;;
    value_format_name: percent_1
  }

  measure: total_responses_enterprise {
    label: "Total Responses by Enterprise Customers"
    group_label: "SLA Performance"
    description: Total responses within an Intercom conversation for Enterprise accounts"
    type: sum
    sql: ${responses} ;;
    filters: [plan: "Enterprise"]
    drill_fields: [account_information*]
  }
```

## Models
* Explores should be organized by group label and group labels should be organized alphabetically
* Every explore should be listed under a `group_label` (see how we categorize explores in the "Structure of our LookML project" section)
* Explores should have only a few joins at max. If you're finding yourself joining several views to a single explore, it might mean you'll need to: 1. Model this in dbt 2. Rethink which table should be the base of the explore you're creating
* There are occasions, particularly for views with many dimensions, where you want to limit the dimensions of the joining view or if the joining view has repeated dimensions that the right table already has where you'd want to exclude dimensions (see below for examples).

```
connection: "snowflake"

include: "/core/*.view"
include: "/dbt_cloud/*.view"
include: "/dbt_core/*.view"
include: "/intercom/*.view"
include: "/csm/*.view"
include: "/finance/*.view"
include: "/metrics/*.view"
include: "/salesforce/*.view"
include: "/slack/*.view"
include: "/snowplow/*.view"
include: "/feedback/*.view"

....

#=============================================== DBT CLOUD

explore: cloud_accounts {
  join: customers {
    view_label: "Cloud Customers"
    fields: [
        customer_name,
        is_current,
        ltv,
        first_payment_date,
        start_month,
        end_month
      ]
    sql_on: ${cloud_accounts.account_id} = ${customers.account_id} ;;
    type: left_outer
    relationship: one_to_one
  }
}

explore: cloud_ide_sessions {
  label: "IDE Sessions"
  group_label: "dbt Cloud"
  join: cloud_users {
    view_label: "Cloud Users"
    sql_on: ${cloud_ide_sessions.user_id} = ${cloud_users.user_id} ;;
    type: left_outer
    relationship: many_to_one
  }
  join: customers {
    view_label: "Cloud Customers"
    fields: [
        ALL_FIELDS*,
        -customers.account_id,
        -customers.account_name,
        -customers.account_created
      ]
    sql_on: ${cloud_ide_sessions.account_id} = ${customers.account_id} ;;
    type: left_outer
    relationship: one_to_one
    }
}


```
