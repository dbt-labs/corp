###Product Ideas###

One of the goals of Fishtown Analytics is to build useful analytics products. We build products for three reasons:
1. to improve our ability to deliver on client engagements,
2. to create useful tools for analysts, and
3. to evangelize the analytic workflow we believe in.

All products we consider building will make their way onto this list because we have specifically felt the need for them in our own analytic work.

####Design Principles####

#####Composability#####

We embrace the #nix approach to the design and construction of products: each product should accomplish as little as possible and interact well with other products.

#####Revenue#####

Fishtown Analytics will never directly earn revenue from any of its products. **If and when we believe a commercial opportunity exists for a product, we will spin that product off into a separate entity.**



####Current List####
#####Query execution proxy#####

This product would accept incoming queries, transform them on-the-fly, run the resultant query against a target database, and return the results to the user. Transformations could include SQL extensions, transient models, or performance enhancements.

#####Database credential management#####

This product would store credentials for all of the databases a user needs to connect to across all of their various tools, and then expose a connection protocol that tools could connect with. As more users need to connect to more data sources, credential management becomes a real problem.

#####Model runner#####

This product would materialize analytic models to a database on a scheduled basis. Functionality would include scheduling, status notification, dependency resolution, database load management, and optimization (partial table updates).

#####Continuous Integration#####

This product would run on a regular basis and notify users of any anomalous data patterns existing in their database. These patterns could be detected algorithmically or declaratively.
