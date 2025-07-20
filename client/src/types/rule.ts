export type Rule = {
  _id: string;
  name: string;
  tenantId: string;
  ruleIndex: number;
  source: Source[];
  destination: Destination[];
  action: "Allow" | "Block";
  createdAt: string;
  updatedAt: string;
};

export type Source = {
  name: string;
  email: string;
};

export type Destination = {
  name: string;
  address: string;
};
