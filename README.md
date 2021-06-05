Please read the PLEASE_READ_FIRST.md first.

Please document your code & design decisions here.

I decided to create a database module that can interface with the SimplyRets service and also to the mongodb
client. By doing this I am able to separate the data access and updating logic from the GraphQl operations.

I like to use more modern standards for asynchronous functions so I relied heavily on async/await functionality.
I think this helps to make the code cleaner and easier to follow (rather than using promise chains or callbacks).

I added my Query and Mutation types to the existing types provided. The authentication is implemented as a
context funtion for the Apollo server, in this way to protects the GraphQl endpoint but also allows the
playground to be used.

For the favorite counter I decided to create this as a "Favorite" mutable property. It can either increment
or decrement the favorite counter for a listing.

I added some unit tests for the database module but was unable to finish the final tests (the listing tests)
before my 5 hour window was exceeded. I think I could finish these tests in about another 30 minutes or so.