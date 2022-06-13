const { PrismaClient } = require("@prisma/client");
const { transformDocument } = require("@prisma/client/runtime");
const prisma = new PrismaClient();

async function seed() {
  const customer = await createCustomer();
  const movies = await createMovies();
  const screens = await createScreens();
  const seats = await createSeats(screens[0]);
  const screenings = await createScreenings(screens, movies);
  const ticket = await createTicket(screenings[0], customer, seats);
  console.log("12........................: ", ticket);
  process.exit(0);
}
async function createSeats(screen) {
  const seat1 = await prisma.seat.create({
    data: {
      type: "seat1",
      screen: {
        connect: {
          id: screen.id,
        },
      },
    },
  });

  const seat2 = await prisma.seat.create({
    data: {
      type: "seat2",
      screen: {
        connect: {
          id: screen.id,
        },
      },
    },
  });
  //   console.log("seatsCreated   :", seat1, seat2);
  return [seat1, seat2];
}

async function createTicket(screening, customer, seats) {
  const ticket = await prisma.ticket.create({
    data: {
      screening: {
        connect: {
          id: screening.id,
        },
      },
      customer: {
        connect: {
          id: customer.id,
        },
      },
      seats: {
        connect: [{ id: seats[0].id }, { id: seats[1].id }],
      },
    },
    include: {
      customer: true,
      screening: {
        include: {
          movie: true,
        },
      },
      seats: true,
    },
  });
  return ticket;
}

async function createCustomer() {
  const customer = await prisma.customer.create({
    data: {
      name: "Alice",
      contact: {
        create: {
          email: "alice@boolean.co.uk",
          phone: "1234567890",
        },
      },
    },
    include: {
      contact: true,
    },
  });

  //   console.log("Customer created", customer);

  return customer;
}

async function createMovies() {
  const rawMovies = [
    { title: "The Matrix", runtimeMins: 120 },
    { title: "Dodgeball", runtimeMins: 154 },
  ];

  const movies = [];

  for (const rawMovie of rawMovies) {
    const movie = await prisma.movie.create({ data: rawMovie });
    movies.push(movie);
  }

  //   console.log("Movies created", movies);

  return movies;
}

async function createScreens() {
  const rawScreens = [{ number: 1 }, { number: 2 }];

  const screens = [];

  for (const rawScreen of rawScreens) {
    const screen = await prisma.screen.create({
      data: rawScreen,
    });

    screens.push(screen);
  }

  return screens;
}

async function createScreenings(screens, movies) {
  const screeningDate = new Date();
  let screenings = [];

  for (const screen of screens) {
    for (let i = 0; i < movies.length; i++) {
      screeningDate.setDate(screeningDate.getDate() + i);

      const screening = await prisma.screening.create({
        data: {
          startsAt: screeningDate,
          movie: {
            connect: {
              id: movies[i].id,
            },
          },
          screen: {
            connect: {
              id: screen.id,
            },
          },
        },
      });
      screenings.push(screening);

      //   console.log("Screening created", screening);
    }
  }

  return screenings;
}

seed()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  })
  .finally(() => process.exit(1));
