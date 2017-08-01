# DroneSwift!
Hello!, I have written a solution for the drone delivery code test found here: https://github.com/GetSwift/codetest

## Installation and Execution
This app is written in Javascript, and expects Node v6.9^. To install simply clone this repo then run
```
npm install
```
There is one direct dependency, axios, used to make the API calls simpler and cleaner.

The app can be run using:
```
npm run start
```
or
```
npm run dest
```
There are two slightly different versions of the app, this is because I originally thought that the package deadline was the time the package needed to be at its destination, not the deadline for departure from the depo. Thus I calculated the delivery time for each package, and created additional object fields for depature and (in case it might be useful) travel time. This resulted in an app which mostly found packages to be unassignable. After some basic testing, I decided that most likely deadline meant the time it needed to leave the depo. I simplified my code and this resulted in more expected output. 'npm run start' runs the simple version, 'npm run dest' runs the version which assumes deadline means arrival at destination.

## Analysis
### How did I implement my solution?
I created a new array called "dronesAvailable" which lists a drone, and the time it will be free for its next delivery. This time is calculated using the current position of the drone, and how long it will take for it to travel back to the depo (including delivery if it's carrying a package) using the Haversine formula. This array is sorted based on time and its times are compared with the deadline times of the package array (also sorted by time). Drones are then assigned on a first come, first served basis until we run out of drones or packages.
As mentioned above, I also implemented some logic to calculate delivery times for packages in the event "deadline" meant arrival at destination.

As it's written, I would deploy this as a microservice which would generate drone delivery lists from batched input most likely provided by some sort of user input aggregator.
### Why did I implement it this way?
To me there are two main elements to this problem: finding the time each drone will be available for another delivery, and correctly pairing packages with appropriate drones. I chose to base my solution on the "correctly pairing" part of the problem, and used sorting to do so. I think there will be lower overall time complexity (~n log n) as each list is sorted once, instead of an alternative iterative lookup of deadlines (n^2). I also split the drone availability times into its own list as it might scale slightly better (assuming finite drones in a hash table-type structure).
### Will it scale?
Node's event loop is pretty good at this sort of high volume I/O so with some adjustments it might have a chance. Changes I would consider include turning computationally expensive functions into microservices for distribution to dedicated servers, moving the list of available drones to its own high-speed database (Redis or similar), and offloading drone information to some sort of SQL database.

That said, in an actual system it would seem likely you'd have a known quantity of drones and their individual positions would not need to be calculated for planning delivery orders. A drone-focused database could be polled regularly to anticipate drone arrival at the depo, and a separate availability list could be maintained which would expect each drone arrival and have the appropriate package ready for pick up.
