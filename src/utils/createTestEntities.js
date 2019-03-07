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

export const createTestClient = async (active = true) =>
  createGDS(sq.from`clients`)({
    name: faker.company.companyName(),
    abbreviation: faker.random.alphaNumeric(7),
    slug: faker.lorem.slug(),
    active
  });

export const createTestOLPermission = async (userId, clientId, permission) =>
  createGDS(sq.from`client_permissions`)({
    clientId,
    userId,
    permission
  });

export const createTestCycle = async (
  clientId,
  cycleName,
  cycleCategory,
  engagementDates
) =>
  createGDS(sq.from`cycles`)({
    clientId,
    name: cycleName || faker.lorem.sentence(),
    category: cycleCategory,
    engagementDates: engagementDates || `[2018-01-01,2018-12-31)`
  });

export const createTestIO = async (
  insertion_order_id,
  client_id,
  created_by,
  attribution,
  campaign_name,
  campaign_description,
  program_phase,
  commission_rate = 0.15
) =>
  createGDS(sq.from`insertion_orders_revisions`)({
    insertion_order_id: insertion_order_id || faker.random.uuid(),
    client_id,
    created_by,
    attribution: attribution || faker.name.firstName(),
    campaign_name: campaign_name || faker.lorem.words(4),
    campaign_description: campaign_description || faker.lorem.word(),
    program_phase: program_phase || faker.lorem.word(),
    commission_rate
  });

export const createTestIOLineItem = async (
  insertion_order_line_item_id,
  insertion_order_id,
  created_by,
  category,
  platform,
  objective,
  cost_gross,
  cost_net,
  active_dates = "[2018-01-01, 2018-12-31)",
  commission_rate = 0.15
) =>
  createGDS(sq.from`insertion_orders_line_items_revisions`)({
    insertion_order_line_item_id:
      insertion_order_line_item_id || faker.random.uuid(),
    insertion_order_id,
    category: category || faker.lorem.word(),
    platform: platform || faker.lorem.word(),
    objective: objective || faker.lorem.word(),
    active_dates,
    cost_gross:
      cost_gross || faker.random.number({ min: 0, max: 100, precision: 2 }),
    cost_net:
      cost_net || faker.random.number({ min: 0, max: 100, precision: 2 }),
    commission_rate,
    created_by
  });
