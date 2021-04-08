# LookML Style Guide


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
* The `sql_table_name` should always have the [user attribute feature](https://blog.getdbt.com/how-to-integrate-dbt-and-looker-with-user-attributes/).
* Dimensions and measures should be organized by group label (Note: for dimensions, date groupings should always be last)

#### Dimensions & Measures
* Dimensions and measures should be ordered as (if fields are applicable): name, label, group_label, description, hidden, type, sql, value_format_name, filter
* Both should have a description
* We prefer `value_format_name` over `value_format`
* Measures should reference the dimension (e.g. ${order_total} over ${TABLE}.order_total)

#### Example

```
view: intercom_conversations {
  sql_table_name:
  -- if prod -- analytics.analytics.fct_intercom_conversations
  -- if dev -- analytics.{{_user_attributes['dbt_schema']}}.fct_intercom_conversations ;;

# =============================================== DIMENSIONS

# ==================== IDs
  dimension: conversation_id {
    description: "Primary key for the table. Links to the intercom conversation thread."
    primary_key: yes
    type: string
    sql: ${TABLE}."CONVERSATION_ID" ;;
    link: {
      label: "Intercom Link"
      url: "https://app.intercom.com/a/apps/c15gqki8/inbox/inbox/all/conversations/{{ value }}"
    }
  }

# ==================== CONVERSATIONS
  dimension: responses {
    group_label: "Conversation response metrics"
    description: "Sum of admin and user responses"
    type: number
    sql: ${TABLE}."TOTAL_RESPONSES" ;;
  }

# ==================== DATES
  dimension_group: updated {
    group_label: Dates
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

# ==================== SLA PERFORMANCE   
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

explore: cloud_ide_sessions {
  label: "IDE Sessions"
  group_label: "dbt Cloud"
  join: cloud_accounts {
    view_label: "Cloud Accounts"
    sql_on: ${cloud_ide_sessions.account_id} = ${cloud_accounts.account_id} ;;
    type: left_outer
    relationship: many_to_one
  }
  join: cloud_users {
    view_label: "Cloud Users"
    sql_on: ${cloud_ide_sessions.user_id} = ${cloud_users.user_id} ;;
    type: left_outer
    relationship: many_to_one
  }
  join: customers {
    view_label: "Cloud Customers"
    sql_on: ${cloud_ide_sessions.account_id} = ${customers.account_id} ;;
    type: left_outer
    relationship: one_to_one
  }
}

```
