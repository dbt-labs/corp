###Product Ideas###

One of the missions of Fishtown Analytics is to build useful analytics products.

####Design principles####

#####Composability#####
We embrace the #nix approach to the design and construction of products: each product should accomplish as little as possible and interact well with other products

####Projects####
#####Query execution proxy#####

This product would accept incoming queries, transform them on-the-fly, run the resultant query against a target database, and return the results to the user. Transformations could include SQL extensions, transient models, or performance enhancements.

#####Database credential store#####

This product would store credentials for all of the databases a user needs to connect to across all of their various tools, and then expose a connection protocol that tools could connect with. As more users need to connect to more data sources, credential management becomes a real problem.
