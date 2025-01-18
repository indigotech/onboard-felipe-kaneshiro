import { expect } from "chai";
import { User } from "@prisma/client";
import prisma from "../src/prisma";
import axios from "axios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("User Query", () => {
    let createdUser: User;

    before(async () => {
        await prisma.user.deleteMany();

        const hashedPassword = await bcrypt.hash('testuserquery123', 10);

        
        createdUser = await prisma.user.create({
            data: {
                name: "Test User Query",
                email: "testuserquery@gmail.com",
                password: hashedPassword,
                birthDate: new Date("2001-01-01"),
            },
        });
    });


    it("should return a user successfully", async () => {
        const loginUser = {
        query: `
            mutation Login($data: LoginInput!) {
              login(loginData: $data) {
                token
              }
            }
            `,
        variables: { 
            data:{
                email: "testuserquery@gmail.com",
                password: "testuserquery123",
            }},
        };

        const queryUser = {
            query: `
            query User($id: ID!) {
                user(id: $id) {
                    id
                    name
                    email
                    birthDate
                }
            }
            `,
            variables: { id: createdUser.id },
        }

        const loginResponse = await axios.post("http://localhost:4000", loginUser);
        const tokenLoginResponse = loginResponse.data.data.login.token;

        const headers = { Authorization: `Bearer ${tokenLoginResponse}` };
        const response = await axios.post("http://localhost:4000", queryUser, { headers });

        expect(response.data.data.user).to.deep.eq({ 
            id: createdUser.id.toString(),
            name: createdUser.name,
            email: createdUser.email,
            birthDate: createdUser.birthDate.getTime().toString(),
        });
    });


    it("should return user not found on database", async () => {
        const loginUser = {
        query: `
            mutation Login($data: LoginInput!) {
              login(loginData: $data) {
                token
              }
            }
            `,
        variables: { 
            data:{
                email: "testuserquery@gmail.com",
                password: "testuserquery123",
            }},
        };

        const queryUser = {
            query: `
            query User($id: ID!) {
                user(id: $id) {
                    id
                    name
                    email
                    birthDate
                }
            }
            `,
            variables: { id: createdUser.id + 1 },
        }
        
        const loginResponse = await axios.post("http://localhost:4000", loginUser);
        const tokenLoginResponse = loginResponse.data.data.login.token;

        const headers = { Authorization: `Bearer ${tokenLoginResponse}` };
        const response = await axios.post("http://localhost:4000", queryUser, { headers }).catch((error) => error.response);
        
        expect(response.data.errors[0].message).to.eq("Usuário não encontrado no Banco de Dados");
    });


    it("should return time expired", async () => {
        const shortTimetToken = jwt.sign({ id: createdUser.id }, process.env.JWT_SECRET as string, { expiresIn: "1s" });
        
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const queryUser = {
            query: `
            query User($id: ID!) {
                user(id: $id) {
                    id
                    name
                    email
                    birthDate
                }
            }
            `,
            variables: { id: createdUser.id},
        }

        const headers = { Authorization: `Bearer ${shortTimetToken}` };    
        const response = await axios.post("http://localhost:4000", queryUser, { headers }).catch((error) => error.response);
        
        expect(response.data.errors[0].message).to.eq("Usuário não autenticado ou tempo de login expirado.");
        expect(response.data.errors[0].code).to.eq(401);
    });


    it("should return not authenticated user", async () => {
        const notAuthenticatedUser = {
            query: `
            query User($id: ID!) {
                user(id: $id) {
                    id
                    name
                    email
                    birthDate
                }
            }
            `,
            variables: { id: createdUser.id},
        }

        const headers = { Authorization: `Invalid Token` };
        const response = await axios.post("http://localhost:4000", notAuthenticatedUser, { headers }).catch((error) => error.response);
        
        expect(response.data.errors[0].message).to.eq("Usuário não autenticado ou tempo de login expirado.");
        expect(response.data.errors[0].code).to.eq(401);
    });
});