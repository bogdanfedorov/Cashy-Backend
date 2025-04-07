import cors from "cors";
import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import { Background, BackgroundCardStatus } from "./models/background.model";
import { Player } from "./models/player.model";

const players: Array<Player> = [
  {
    id: "10fe3020-4ae6-4c57-8e8a-a422da3ff66c",
    name: "Jane Doe",
    balance: 1560,
    level: 50,
    score: 3211,
    frameUrl: "players/frames/gold.png",
    avatarUrl: "players/avatars/player1.png",
    background: "players/backgrounds/image-1.png",
  },
];

const backgrounds: Array<Background> = [
  {
    id: "3503f1cc-6d12-4541-aa0f-53fc822ce8c0",
    status: BackgroundCardStatus.Applied,
    name: "Sunset City",
    backgroundImageName: "players/backgrounds/image-1.png",
  },
  {
    id: "d7ee16e1-9397-490e-a3b6-30a411beb0ea",
    status: BackgroundCardStatus.Owned,
    name: "Sunset City",
    backgroundImageName: "players/backgrounds/image-2.png",
  },
  {
    id: "18158e6e-f72e-476e-92d5-6459e73bbd07",
    status: BackgroundCardStatus.EventOnly,
    name: "Sunset City",
    backgroundImageName: "players/backgrounds/image-3.png",
  },
  {
    id: "3e4410e7-3982-43a4-95d5-31feef760077",
    status: BackgroundCardStatus.CanBePurchased,
    name: "Sunset City",
    backgroundImageName: "players/backgrounds/image-4.png",
    price: 10,
  },
  {
    id: "d6ffe264-388f-4f38-b616-eb6ab8267e81",
    status: BackgroundCardStatus.CanBePurchased,
    name: "Sunset City",
    backgroundImageName: "players/backgrounds/image-5.png",
    price: 100,
  },
  {
    id: "ef012eab-8ff7-4760-8d68-5bda31c09ff9",
    status: BackgroundCardStatus.CanBePurchased,
    name: "Sunset City",
    backgroundImageName: "players/backgrounds/image-6.png",
    price: 1000,
  },
  {
    id: "964b2aab-d0c6-4670-bb11-8ae3aadd7fce",
    status: BackgroundCardStatus.EventOnly,
    name: "Sunset City",
    backgroundImageName: "players/backgrounds/image-7.png",
  },
  {
    id: "9235adec-4cb2-4575-96eb-26edf6945e3a",
    status: BackgroundCardStatus.EventOnly,
    name: "Sunset City",
    backgroundImageName: "players/backgrounds/image-8.png",
  },
  {
    id: "fbedef26-d820-44c1-baf7-407e8c906258",
    status: BackgroundCardStatus.EventOnly,
    name: "Sunset City",
    backgroundImageName: "players/backgrounds/image-9.png",
  },
  {
    id: "2c56c042-bc9e-493f-957f-7df441e9773d",
    status: BackgroundCardStatus.EventOnly,
    name: "Sunset City",
    backgroundImageName: "players/backgrounds/image-10.png",
  },
];
const backgroundsMap = backgrounds.reduce(
  (map: Map<string, number>, cur, index) => {
    map.set(cur.id, index);
    return map;
  },
  new Map(),
);

const schema = buildSchema(`
  type Query {
    player: Player
    backgrounds: [Background]
  }

  type Mutation {
    changeBackground(backgroundId: String): Player
    buyBackground(backgroundId: String): Background
  }

  type Player {
    id: String
    name: String
    balance: Float
    level: Int
    score: Int
    frameUrl: String
    avatarUrl: String
    background: String
  }

  type Background {
    id: String
    name: String
    status: Int
    price: Float
    backgroundImageName: String
  }
`);

const root = {
  player: () => players[0],
  backgrounds: () => backgrounds,
  changeBackground: async ({ backgroundId }: { backgroundId: string }) => {
    const backgroundIndex = backgroundsMap.get(backgroundId);

    if (backgroundIndex === -1) {
      throw new Error("Background not found");
    }

    const background = backgrounds[backgroundIndex];

    if (background.status === BackgroundCardStatus.EventOnly) {
      throw new Error("This type is only available at events");
    }

    if (background.status === BackgroundCardStatus.Applied) {
      throw new Error("This background is already applied.");
    }

    if (background.status === BackgroundCardStatus.CanBePurchased) {
      throw new Error("First you need to purchase this background");
    }

    const prevBackground = players[0].background;

    const prevBackgroundIndex = backgrounds.findIndex(
      (bg) => bg.backgroundImageName === prevBackground,
    );

    players[0].background = background.backgroundImageName;
    backgrounds[backgroundIndex].status = BackgroundCardStatus.Applied;
    backgrounds[prevBackgroundIndex].status = BackgroundCardStatus.Owned;

    return players[0];
  },
  buyBackground: async ({ backgroundId }: { backgroundId: string }) => {
    const backgroundIndex = backgroundsMap.get(backgroundId);

    if (backgroundIndex === -1) {
      throw new Error("Background not found");
    }

    const background = backgrounds[backgroundIndex];

    if (background.status === BackgroundCardStatus.EventOnly) {
      throw new Error("This type is only available at events.");
    }

    if (background.status === BackgroundCardStatus.Applied) {
      throw new Error("This background is already applied.");
    }

    if (background.status === BackgroundCardStatus.Owned) {
      throw new Error("You have already purchased this.");
    }

    if (background.price) {
      const balanceAfterTransaction = players[0].balance - background.price;

      if (balanceAfterTransaction < 0) {
        throw new Error("Insufficient balance");
      }

      backgrounds[backgroundIndex].status = BackgroundCardStatus.Owned;
      players[0].balance = balanceAfterTransaction;
    }

    return backgrounds[backgroundIndex];
  },
};

const app = express();

app.use(cors());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }),
);

app.listen(4000, () => {
  console.log("Server is running on http://localhost:4000/graphql");
});
