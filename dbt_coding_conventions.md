# Code Review Checklist


## Policy & Procedure

- Reviewers should have 48 hours to complete a review, so plan ahead with the end of your sprint.
- When possible, questions/problems should be discussed with your reviewer before PR time. PR time is by definition the worst possible time to have to make meaningful changes to your models, because you’ve already done all of the work!

## Model Configuration

- Model-specific attributes (like sort/dist keys) should be specified in the model
- If a particular configuration applies to all models in a directory, it should be specified in the project
- In-model configurations should be specified like this:

```python
{{
  config(
    materialized = ’table’,
    sort = ’id’,
    dist = ’id’
  )
}}
```

## Base Models

- DO place all base models in a base/ directory
- DON'T select from source data outside of base models
- DON'T select from any given source table in more than one base model
- DON'T `select *` in base models
- DON'T cast source field types outside of base models
- DO rename source field names to be valid unquoted sql identifiers in base models
- DO rename source field names to comply with standard field naming conventions (ed: what are these?)

## Field Naming Conventions

- TBD

## CTEs

- DO place all `{{ ref('...') }}` statements in CTEs at the top of the file
- DON'T place any logic in CTEs which `ref` other models
- AVOID implementing more than one logical unit of work in a CTE
- DO make CTE names as verbose as needed to convey what they do
- DO comment CTEs which contain confusing or noteable logic
- DO yank out CTEs that are duplicated across models into their own models
- DO place `[with] {cte_name} as (` on a single line
- DO pad one newline above and below the sql in a CTE
- DO use block comments (`/* ... */`) to comment CTEs
- DO place CTE comments on the lines immediately above a CTE

Given these rules, CTEs should be formatted like this:

``` sql
with events as (

	...

),

/*
CTE comments go here
/*
filtered_events as (

	...

)

select * from filtered_events
```

## Style Guide
### *DO NOT OPTIMIZE FOR A SMALLER NUMBER OF LINES OF CODE. NEWLINES ARE CHEAP, BRAIN TIME IS EXPENSIVE*

- DO indent `select` four spaces from the CTE which contains it
- DON'T indent `select` when it's found outside of a CTE
- DO indent fields four spaces from the `select` keyword which references them
- DO indent `where`, `join`, `group`, `union`, `having`, `limit`, and `order` to align with the `select` keyword in their scope
- DO place the first filter on the same line as the `where` keyword
- DO indent subsequent filters to align the end of the boolean operator (`and`/`or`) with the end of the `where` keyword
- AVOID writing lines of SQL longer than 80 characters
- DO place dimensions before aggregates or window functions
- DO use lowercase for field names, function names, and sql keywords
- DO use the `as` keyword when projecting a field or table name
- PREFER placing all `group by` fields on the same line
- PREFER the `using` keywords for joins on a shared field name
- DO place `distinct` on the same line as the `select`
- DO indent the `when` and `else` parts of a `case` statements 4 spaces from the `case` keyword
- DO place parentheses which begin a block on the same line as the previous keyword (eg. in compound where statements)
- DO use `=` for equality and `!=` for negative inequality
- DO use `like` and `ilike` for string comparisons

Given these rules, select statements should be formatted like this:

```sql
select [distinct]
    field_1,
    field_2,
    field_3,
    case
        when cancellation_date is null and expiration_date is not null then expiration_date
        when cancellation_date is null then start_date+7
        else cancellation_date
    end as canellation_date

    sum(field_4),
    max(field_5)

from some_cte
join other_cte using (id)

where field_1 = ‘abc’
  and (
    field_2 = ‘def’ or
    field_2 = ‘ghi’
  )

group by 1, 2, 3
having count(*) > 1
```

## Testing

- Every model should be tested in a schema.yml file
- At minimum, unique and foreign key constraints should be tested (if applicable)
- The output of dbt test should be pasted into PRs
- Any failing tests should be fixed or explained prior to requesting a review
