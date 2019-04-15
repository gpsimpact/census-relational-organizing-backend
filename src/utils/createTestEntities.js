import faker from "faker";
import { createGDS } from "@jakelowen/sqorn-graphql-filters";
import { sq } from "../db";

export const uuid = () => faker.random.uuid();

export const createTestUser = async data => {
  const fakeData = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    address: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.state(),
    zip5: faker.address.zipCode().substring(0, 5),
    phone: `+${faker.random.number({
      min: 10000000000,
      max: 19999999999
    })}`,
    active: true
  };
  const writeData = Object.assign({}, fakeData, data);
  return createGDS(sq.from`users`)(writeData);
};

export const createTestGlobalPerm = async (userId, permission) =>
  createGDS(sq.from`global_permissions`)({
    userId,
    permission
  });

export const createTestTeam = async (active = true) =>
  createGDS(sq.from`teams`)({
    name: faker.company.companyName(),
    slug: faker.lorem.slug(),
    active
  });

export const createTestOLPermission = async (userId, teamId, permission) =>
  createGDS(sq.from`team_permissions`)({
    teamId,
    userId,
    permission
  });

export const createTestTarget = async data => {
  const fakeData = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    active: true
  };
  const writeData = Object.assign({}, fakeData, data);
  return createGDS(sq.from`targets`)(writeData);
};
