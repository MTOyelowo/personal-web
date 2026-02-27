import { faker } from "@faker-js/faker";

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    address: {
        street: string;
        suite: string;
        city: string;
        zipcode: string;
        geo: {
            lat: string;
            lng: string;
        };
    };
    phone: string;
    website: string;
    company: {
        name: string;
        catchPhrase: string;
        bs: string;
    };
}

export interface TransformedUser {
    id: number;
    image: string;
    name: string;
    link: string;
    about: string;
}

export const transformUser = (user: User): TransformedUser => {
    return {
        id: user.id,
        image: faker.image.avatar(),
        name: user.name,
        link: user.username,
        about: faker.lorem.words({ min: 30, max: 60 })
    }
}