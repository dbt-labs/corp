# Developing Staging Tables

When building staging tables for the first time in your project you would have to do a lot of 
front-loaded hard work to make your life easy in the long run. This checklist is meant to help you spend
less time thinking about what steps you need and more time just repeatedly churning out your staging tables!

Feel free to use this to your preferred style and change this but it can be used as a starting point
and quick reference to spend less brain power on remembering every step.

## Checklist
- [ ] Create source and renamed CTEs
- [ ] Load source from sources
- [ ] List all columns from the table
- [ ] Place IDs at the top
- [ ] Make sure IDs are meaningfully named - following the format `<object>_id`
- [ ] Place dates at the bottom
- [ ] Make sure dates end with `<event>_at` or `<event>_date`
- [ ] Prefix booleans with `is_` or `has_`.
- [ ] Split up columns based on data types for convenience
- [ ] Make sure all columns are `snake_case`
- [ ] Add `<object>_cents` or other indicators when it's not in decimal currency
- [ ] Save model with plural version of the table (ex. `stg_orders` instead of ~~`stg_order`~~)
