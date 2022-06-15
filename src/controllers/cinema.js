const prisma = require("../utils/prisma");

const createTicket = async (req, res) => {
  const { screenings, customer, seats } = req.body;
  console.log("screenings.....", screenings);
  console.log("customer.....", customer);
  console.log("seats....", seats);

  const createdTicket = await prisma.ticket.create({
    data: {
      screening: {
        connect: { id: screenings.screenId },
      },
      customer: {
        connect: { id: customer.id },
      },
      seats: {
        connect: [{ id: seats[0].id }, { id: seats[1].id }],
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
