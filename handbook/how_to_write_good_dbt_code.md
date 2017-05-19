# How to Write Good dbt Code

(by @jthandy)

The driving motivation behind dbt is to help analysts do their work in ways that mimic software development, focusing on modularity, quality, and collaboration. While dbt helps by building tooling to make this type of workflow more achievable, **working in this way requires more than just tooling**. It also requires a set of instincts about how to write good code.

I’ve written enough code in my life to understand what it feels like to write terrible code and the pain it causes. It is a priority for all of us at Fishtown Analytics to write good code when we do client work, for two clear reasons:

- Writing good code will produce better outcomes for our clients. The analytics we build for them will be more performant, reliable, and maintainable if we take care to build them well.
- Writing good code will produce better outcomes for us. Not only will it cause our clients to be happier and therefore renew their contracts and refer us business, but writing good code actually allows us to do our work in far less time, and thus be much more profitable and work fewer hours.

And let’s be very clear about this: **writing analytic code is writing code**. While the purpose of this code is very specific (supporting insight generation from data), that doesn’t make the code produced in this effort any less “code” than the code of a mobile app or cloud software platform or operating system. While you may or may not think of yourself this way, **the minute you start writing analytic code, you are a developer.**

So, while the engineers at Fishtown Analytics are busy building the tooling to facilitate a brand new analytics workflow that is, at its heart, focused on enabling analysts to work like developers, **the analysts at Fishtown Analytics are the pioneers of how best to do this work**. It is you who will drive the design of our tools—the problems you face, the workflows you invent, the standards you coalesce around. This role is about more than simply doing client service, it’s about inventing a new way to do client service.

With that in mind, here are some guiding instincts that we’ve developed as we’ve founded the company and spent countless hours using dbt to do client work. These are instincts, not hard-and-fast rules—they should live in the back of your mind but not inhibit you from getting a job done.

1. Copying and pasting is almost always bad.
1. Encapsulate complex logic so that others can use the results without needing to understand how the results are generated.
1. **Do everything you can to make your code easier to read.** Hard-to-read code is a problem, and will cause all kinds of negative outcomes for your projects, including loss of trust in and difficulty to maintain your code. These will ultimately result in you spending stressful hours doing things you don’t want to do. 
