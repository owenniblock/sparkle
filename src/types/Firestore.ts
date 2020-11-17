import { WithId } from "utils/id";
import { AdminRole } from "hooks/roles";

import {
  RestrictedChatMessage,
  PrivateChatMessage,
} from "components/context/ChatContext";
import { Reaction } from "components/context/ExperienceContext";

import { CampVenue } from "./CampVenue";
import { ChatRequest } from "./ChatRequest";
import { PartyMapVenue } from "./PartyMapVenue";
import { Purchase } from "./Purchase";
import { Role } from "./Role";
import { Table } from "./Table";
import { User } from "./User";
import { Venue } from "./Venue";
import { VenueEvent } from "./VenueEvent";

interface VenueStatus {
  currentVenue: boolean;
  currentEvent: boolean;
  eventPurchase: boolean;
  venueChats: boolean;
  venueEvents: boolean;
  userPurchaseHistory: boolean;
}

interface Experience {
  reactions: Record<string, Reaction>;
  tables: Record<string, Table>;
}

type VenueTimestamps = Record<keyof VenueStatus, number>;
export type AnyVenue = Venue | PartyMapVenue | CampVenue;

interface UserVisit {
  timeSpent: number;
}

export interface Firestore {
  status: FirestoreStatus;
  data: FirestoreData;
  ordered: FirestoreOrdered;
}

export interface FirestoreStatus {
  requesting: VenueStatus;
  requested: VenueStatus;
  timestamps: VenueTimestamps;
}

export interface FirestoreData {
  currentVenue?: AnyVenue;
  parentVenue?: AnyVenue;
  currentEvent: Record<string, VenueEvent>;
  venueChats: Record<string, RestrictedChatMessage> | null;
  venueEvents: Record<string, VenueEvent>;
  userPurchaseHistory: Record<string, Purchase>;
  partygoers: Record<string, User>;
  users: Record<string, User>;
  privatechats: Record<string, PrivateChatMessage>;
  experiences: Record<string, Experience>;
  eventPurchase: Record<string, Purchase>;
  reactions: Record<string, Reaction>;
  venues?: Record<string, AnyVenue>;
  events?: Record<string, VenueEvent>;
  playaVenues?: Record<string, AnyVenue>; // for the admin playa preview
  allUsers?: Record<string, User>;
  userModalVisits?: Record<string, UserVisit>;
  userRoles: Record<string, Role>;
  allowAllRoles: Record<string, Role>;
  adminRole: AdminRole;
}

export interface FirestoreOrdered {
  currentVenue: Array<WithId<AnyVenue>>;
  currentEvent: Array<WithId<VenueEvent>>;
  venueChats: Array<WithId<RestrictedChatMessage>>;
  venueEvents: Array<WithId<VenueEvent>>;
  userPurchaseHistory: Array<WithId<Purchase>>;
  partygoers: Array<WithId<User>>;
  users: Array<WithId<User>>;
  privatechats: Array<WithId<PrivateChatMessage>>;
  experiences: Array<WithId<Experience>>;
  eventPurchase: Array<WithId<Purchase>>;
  reactions: Array<WithId<Reaction>>;
  venues?: Array<WithId<AnyVenue>>;
  events?: Array<WithId<VenueEvent>>;
  playaVenues?: Array<WithId<AnyVenue>>;
  statsOnlineUsers?: Array<WithId<User>>;
  statsOpenVenues?: Array<WithId<AnyVenue>>;
  allUsers?: Array<WithId<User>>;
  userModalVisits?: Array<WithId<UserVisit>>;
  chatRequests?: Array<WithId<ChatRequest>>;
}
