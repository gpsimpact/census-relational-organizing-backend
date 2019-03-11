import faker from "faker";
import { createGDS } from "@jakelowen/sqorn-graphql-filters";
import { sq } from "../db";

export const uuid = () => faker.random.uuid();

export const createTestUser = async (
  name,
  email,
  abbreviation,
  active = true
) =>
  createGDS(sq.from`users`)({
    name: name || `${faker.name.firstName()} ${faker.name.lastName()}`,
    email: email || faker.internet.email().toLowerCase(),
    abbreviation: faker.lorem.word().substring(0, 7),
    active
  });

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
