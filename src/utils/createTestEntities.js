import faker from "faker";
import { createGDS } from "@jakelowen/sqorn-graphql-filters";
import { sq } from "../db";
import { permsToInt, makeDefaultState } from "./permissions/permBitWise";

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
    active,
    tos: faker.lorem.paragraphs()
  });

export const createTestOLPermission = async (userId, teamId, permission) =>
  createGDS(sq.from`team_permissions`)({
    teamId,
    userId,
    permission
  });

export const createTestTeamPermissionBit = async (userId, teamId, permObJ) => {
  const defState = makeDefaultState();
  const perms = Object.assign({}, defState, permObJ);

  return createGDS(sq.from`team_permissions_bit`)({
    teamId,
    userId,
    permission: permsToInt(perms)
  });
};

export const createTestTarget = async data => {
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
    twitterHandle: `@${faker.random.word()}`,
    facebookProfile: faker.random.word(),
    householdSize: faker.random.number({
      min: 1,
      max: 10
    }),
    active: true
  };
  const writeData = Object.assign({}, fakeData, data);
  return createGDS(sq.from`targets`)(writeData);
};

export const createTestFormField = async data => {
  const fakeData = {
    id: faker.random.uuid(),
    label: "I am the label text",
    type: "text",
    name: "alpha",
    selectOptions: JSON.stringify([
      {
        value: "alpha",
        label: "alpha"
      },
      {
        value: "beta",
        label: "beta"
      }
    ]),
    placeholder: "I am a place holder",
    validationType: "string",
    validationTests: JSON.stringify([
      { method: "required", message: "Value is required." },
      {
        method: "min",
        value: "2",
        message: "Must have length of 2."
      }
    ])
  };
  const writeData = Object.assign({}, fakeData, data);
  return createGDS(sq.from`form_fields`)(writeData);
};

export const createTestFormValue = async (formId, userId, targetId, name) => {
  const data = {
    value: faker.random.word(),
    formId,
    userId,
    targetId,
    name
  };
  return createGDS(sq.from`form_values`)(data);
};

export const createTestForm = async userId => {
  const data = {
    id: faker.random.uuid(),
    userId,
    title: "This is form title",
    buttonText: "Button Text",
    redirectRoute: "/someRoute",
    fields: JSON.stringify([
      {
        label: "I am the label text",
        type: "text",
        name: "alpha",
        selectOptions: [
          {
            value: "alpha",
            label: "alpha"
          },
          {
            value: "beta",
            label: "beta"
          }
        ],
        placeholder: "I am a place holder",
        validationTests: JSON.stringify([
          ["yup.number"],
          ["yup.required"],
          ["yup.min", 50],
          ["yup.max", 500]
        ])
      },
      {
        label: "I am the label text",
        type: "text",
        name: "beta",
        selectOptions: [
          {
            value: "alpha",
            label: "alpha"
          },
          {
            value: "beta",
            label: "beta"
          }
        ],
        placeholder: "I am a place holder",
        validationTests: JSON.stringify([
          ["yup.number"],
          ["yup.required"],
          ["yup.min", 50],
          ["yup.max", 500]
        ])
      }
    ])
  };

  return createGDS(sq.from`forms`)(data);
};

export const createTestGtib = async userId => {
  const data = {
    text: faker.random.words(5),
    isGlobal: true,
    userId
  };

  return createGDS(sq.from`tibs`)(data);
};

export const createTestTtib = async (userId, teamId) => {
  const data = {
    text: faker.random.words(5),
    userId,
    teamId
  };

  return createGDS(sq.from`tibs`)(data);
};

export const createAdminUser = async data => {
  const user = await createTestUser(data);
  await createTestGlobalPerm(user.id, "ADMIN");
  return user;
};

export const createTestTargetNote = async (userId, targetId) => {
  const data = {
    targetId,
    createdBy: userId,
    content: faker.lorem.paragraph()
  };
  return createGDS(sq.from`target_notes`)(data);
};

export const createTestTargetContactAttempt = async (userId, targetId) => {
  const data = {
    targetId,
    createdBy: userId,
    content: faker.lorem.paragraph(),
    disposition: "PHONE__NOT_HOME",
    method: "PHONE"
  };
  return createGDS(sq.from`target_contact_attempts`)(data);
};

export const createTestTaskDefinition = async (formId, userId) => {
  const data = {
    formId,
    createdBy: userId
  };

  return createGDS(sq.from`task_definitions`)(data);
};

export const createTestTaskAssignment = async (
  taskDefinitionId,
  teamId,
  permissions
) => {
  const data = {
    teamId,
    taskDefinitionId,
    taskRequiredRoles: permsToInt(permissions)
  };

  return createGDS(sq.from`task_assignments`)(data);
};
