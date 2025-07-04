Bookclub
--------

> Keep your reading history organised 

Have you ever thought "Well, I'll be... 1984 by George Orwell, huh? That seems like a mighty fine read. Can't quite remember if I read it already, maybe 75 years ago or so. Wish I’d jotted it down back then, would've made things a lot easier!"

If your answer is yes, then fear not! With Bookclub, you can keep track of books you've read and your rating for each of them,
so when the time comes for next visit to the library or bookstore, you will be well-equipped to ask for suggestions and discuss with the clerk on your next pick of well written poetry, or great adventure prose...
As long as you are fluent in JSON.

## Interacting with the app

### Dockerized path

To avoid any "It doesn't work on my machine" issues, and also not have to ship the program with my own machine (on which it works, I swear!),
effort was put to encapsulate it into Docker image. Docker compose was also utilized for even more enhanced ease of use.

To take advantage of this fact, just install somewhat up-to-date [Docker](https://www.docker.com/products/docker-desktop/) and run
```bash
$ docker compose up
```
and watch the app unfold and use it (it will open on port 3000 by default)

If you want to observe how tests are getting greener and greener every day, try

```bash
$ docker compose run --rm test
$ docker compose run --rm teste2e
```

### Old school path

If docker is not for you, that's fine, I've got you covered!

Make sure you have somewhat up-to-date version of nodejs and postgresql server installed. During the development, I spent time with postgresql 17 and nodejs 22.

If you have your node and postgres ready, go ahead and run

```bash
$ npm install
```

It will install all required packages. It can take a few minutes, so in that time, execute

```bash
$ cp .env.example .env
```

and fill it with proper configuration.

When all of the above steps are done, run

```bash
$ npm run start
```

to run the app, or try

```bash
$ npm run test
$ npm run test:e2e
```

to run some tests.

## Postman collection

For your convenience, I've created simple postman collection to help you navigate through endpoints to observe the app in action
you can find it [here](https://orange-meteor-426133.postman.co/workspace/Bopke's-Workspace~01c1c6ef-47ff-45bd-81e4-d53ffc076088/collection/46453003-8b96d16e-3983-44a0-802a-40c539af80b4?action=share&creator=46453003)