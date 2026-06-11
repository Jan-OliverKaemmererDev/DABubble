/**
 * @file Static dummy data for the app shell (module 1). Mirrors the
 * Firestore model interfaces; replaced by live Firestore data in module 2.
 */
import { Timestamp } from '@angular/fire/firestore';

import { ChannelDoc } from '../../models/channel.model';
import { UserDoc } from '../../models/user.model';

/** Channel document paired with its Firestore document id. */
export interface ChannelEntry {
  readonly id: string;
  readonly doc: ChannelDoc;
}

const DUMMY_CREATED_AT = Timestamp.fromMillis(0);

export const DUMMY_USERS: readonly UserDoc[] = [
  {
    uid: 'dummy-sofia',
    name: 'Sofia Müller',
    email: 'sofia@example.com',
    avatarPath: 'avatars/Sofia-Müller.png',
    createdAt: DUMMY_CREATED_AT,
  },
  {
    uid: 'dummy-noah',
    name: 'Noah Braun',
    email: 'noah@example.com',
    avatarPath: 'avatars/Noah-Braun.png',
    createdAt: DUMMY_CREATED_AT,
  },
  {
    uid: 'dummy-elise',
    name: 'Elise Roth',
    email: 'elise@example.com',
    avatarPath: 'avatars/Elise-Roth.png',
    createdAt: DUMMY_CREATED_AT,
  },
  {
    uid: 'dummy-elias',
    name: 'Elias Neumann',
    email: 'elias@example.com',
    avatarPath: 'avatars/Elias-Neumann.png',
    createdAt: DUMMY_CREATED_AT,
  },
  {
    uid: 'dummy-steffen',
    name: 'Steffen Hoffmann',
    email: 'steffen@example.com',
    avatarPath: 'avatars/Steffen-Hoffmann.png',
    createdAt: DUMMY_CREATED_AT,
  },
];

export const DUMMY_CHANNELS: readonly ChannelEntry[] = [
  {
    id: 'dummy-entwicklerteam',
    doc: {
      name: 'Entwicklerteam',
      description: 'Alles rund um die Entwicklung',
      createdBy: DUMMY_USERS[0].uid,
      memberIds: DUMMY_USERS.map(user => user.uid),
      createdAt: DUMMY_CREATED_AT,
    },
  },
];
