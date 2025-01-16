import axios from "axios";
import { compare } from "bcrypt";
import { expect } from "chai";
import { UserInput } from "../src/types/types";
import prisma from "../src/prisma";

describe("Create User Mutation", () => {
  it("should create a user successfully", async () => {
    const newUser: UserInput = {
      name: "Test User Name",
      email: "test2@gmail.com",
      password: "testpass123",
      birthDate: "2001-01-01",
    };

    const userData = {
      query: ` 
        mutation Mutation($data: UserInput!) {
          createUser(userData: $data) {
            id
            name
            email
            birthDate
          }
        }
      `,
      variables: { data: newUser },
    };

    const response = await axios.post("http://localhost:4000", userData);

    const createdUser = response.data.data.createUser;
    const expectedBirthDateInMs = new Date(newUser.birthDate).getTime();

    expect(createdUser).to.deep.eq({
      id: createdUser.id,
      name: newUser.name,
      email: newUser.email,
      birthDate: String(expectedBirthDateInMs),
    });

    const savedUser = await prisma.user.findUnique({ where: { email: newUser.email } });

    if (!savedUser) {
      throw new Error("User not found in database");
    }

    expect(savedUser.name).to.eq(newUser.name);
    expect(savedUser.email).to.eq(newUser.email);
    expect(savedUser.birthDate.getTime()).to.be.eq(expectedBirthDateInMs);
    expect(await compare(newUser.password, savedUser.password)).to.be.eq(true);

    await prisma.user.delete({ where: { id: savedUser.id } });
  });
});
