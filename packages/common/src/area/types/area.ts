import { AboutJson } from "../../types/about/interfaces/about.interface";

// TODO: use them everywhere

export type Services = AboutJson["server"]["services"];
export type Service = Services[number];

export type Actions = Service["actions"];
export type Action = Actions[number] & {
    serviceName: string;
};

export type Reactions = Service["reactions"];
export type Reaction = Reactions[number] & {
    serviceName: string;
};
