# Changelog

## 2.0.0 - 13-07-2020

* Breaking change: Drop support for node v11, v13 and below v10


## 1.0.0 - 25-11-2015

* Breaking change: enrichActivities and enrichAggregatedActivities no longer accept a callback but return a promise
* Breaking change: No longer register a schema to be an ActivitySchema through activitySchema method but build an ActivitySchema object from ActivitySchemaFactory
- Creating a FeedManager can now also be done with custom settings (not loaded via getstream.json) through the method feedManagerFactory
