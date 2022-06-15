const prisma = require("../utils/prisma");

const createTicket = async (req, res) => {
  const { screeningId, customer, seats } = req.body;
  console.log(screeningId, customer, seats);

  const createdTicket = await prisma.ticket.create({
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

  res.json({ data: createdTicket });
};

const getScreeningsByScreenId = async (req, res) => {
  const { screenId } = req.params;

  const screenings = await prisma.screening.findMany({
    where: { screenId: screenId },
  });

  res.json({ data: screenings });
};

module.exports = { createTicket, getScreeningsByScreenId };
