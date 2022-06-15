const { PrismaClient } = require("@prisma/client");
const { prisma, prismaNoLog } = require("../src/utils/prisma");

// Choose prismaNoLog if you don't want SQL queries logged
const db = prisma;

async function seed() {
  const customer = await createCustomer();
  const movies = await createMovies();
  const screens = await createScreens();
  const screenings = await createScreenings(screens, movies);
  const seats = await createSeats(screens);
  const ticket = await createTicket(customer, screenings, seats);

  console.log("Screenings: ", screenings);
  console.log("Seats: ", seats);
  console.log("Ticket ", ticket);

  process.exit(0);
}

async function createCustomer() {
  const customer = await db.customer.create({
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

  // console.log('Customer created', customer);

  return customer;
}

async function createMovies() {
  const rawMovies = [
    { title: "The Matrix", runtimeMins: 120 },
    { title: "Dodgeball", runtimeMins: 154 },
  ];

  const movies = [];

  for (const rawMovie of rawMovies) {
    const movie = await db.movie.create({ data: rawMovie });
    movies.push(movie);
  }

  // console.log('Movies created', movies);

  return movies;
}

async function createScreens() {
  const rawScreens = [{ number: 1 }, { number: 2 }];

  const screens = [];

  for (const rawScreen of rawScreens) {
    const screen = await db.screen.create({
      data: rawScreen,
    });

    // console.log('Screen created', screen);

    screens.push(screen);
  }

  return screens;
}

async function createScreenings(screens, movies) {
  const screeningDate = new Date();

  const screenings = [];

  for (const screen of screens) {
    for (let i = 0; i < movies.length; i++) {
      screeningDate.setDate(screeningDate.getDate() + i);

      const screening = await db.screening.create({
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
        include: {
          screen: true,
          movie: true,
        },
      });

      screenings.push(screening);

      // console.log('Screening created', screening);
    }
  }

  return screenings;
}

async function createSeats(screens) {
  let seats = [];

  for (const screen of screens) {
    let screenSeats = [];

    seatNumbers = [1, 2, 7];

    for (const seatNum of seatNumbers) {
      const seat = await db.seat.create({
        data: {
          name: `S${screen.number}#${screen.number * seatNum}`,
          screen: {
            connect: {
              id: screen.id,
            },
          },
        },
      });

      screenSeats.push(seat);
    }

    seats.push(screenSeats);
  }

  return seats;
}

async function createTicket(customer, screenings, seats) {
  const screening = screenings[3];
  const screeningId = screening.id;
  // const screenId  = screening.screenId;
  const ticketSeats = seats[1];

  const ticket = await db.ticket.create({
    data: {
      screening: {
        connect: { id: screeningId },
      },
      customer: {
        connect: { id: customer.id },
      },
      seats: {
        connect: [{ id: ticketSeats[0].id }, { id: ticketSeats[2].id }],
      },
    },
    include: {
      screening: {
        include: {
          screen: true,
          movie: true,
        },
      },
      customer: true,
      seats: true,
    },
  });

  return ticket;
}

async function query() {
  const seats = await db.seat.findMany({
    where: {
      screen: {
        number: 2,
      },
    },
    include: {
      screen: true,
      tickets: {
        include: {
          customer: {
            include: {
              contact: true,
            },
          },
        },
      },
    },
  });

  seats.forEach((seat, index) => {
    console.log(
      `\nSeat #${index} id=${seat.id}: ${seat.name}, screen: ${seat.screen.number}`
    );
    if (seat.tickets) {
      console.log(`Tickets: `, JSON.stringify(seat.tickets, null, 2));
    }
  });

  // Don't edit any of the code below this line
  process.exit(0);
}

seed()
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
  })
  .finally(() => process.exit(1));
