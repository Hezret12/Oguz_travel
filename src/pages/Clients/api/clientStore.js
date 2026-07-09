const STORAGE_KEY = 'oguz-travel.clients';

const SEED_CLIENTS = [
  {
    id: 'client-1',
    clientId: 'C-00001',
    fullName: 'Chaytiyev Azymberdi',
    phoneNumber: '61123456',
    passportNumber: 'A2257777',
    dateOfBirth: '1991-03-12',
    passportExpiryDate: '2029-11-25',
    passportCountryOfIssue: 'Turkmenistan',
    gender: 'Men',
  },
  {
    id: 'client-2',
    clientId: 'C-00002',
    fullName: 'Pylan Pylanov',
    phoneNumber: '62234567',
    passportNumber: 'A2258888',
    dateOfBirth: '1988-06-08',
    passportExpiryDate: '2030-05-18',
    passportCountryOfIssue: 'Turkey',
    gender: 'Men',
  },
  {
    id: 'client-3',
    clientId: 'C-00003',
    fullName: 'Myrat Myradov',
    phoneNumber: '63345678',
    passportNumber: 'A2259999',
    dateOfBirth: '1995-09-21',
    passportExpiryDate: '2031-02-09',
    passportCountryOfIssue: 'Kazakhstan',
    gender: 'Men',
  },
  {
    id: 'client-4',
    clientId: 'C-00004',
    fullName: 'Ayna Mammedova',
    phoneNumber: '64456789',
    passportNumber: 'AB1234567',
    dateOfBirth: '1992-04-18',
    passportExpiryDate: '2030-05-18',
    passportCountryOfIssue: 'Turkmenistan',
    gender: 'Women',
  },
  {
    id: 'client-5',
    clientId: 'C-00005',
    fullName: 'Serdar Annaguliyev',
    phoneNumber: '65567890',
    passportNumber: 'CD2345678',
    dateOfBirth: '1988-11-03',
    passportExpiryDate: '2029-09-14',
    passportCountryOfIssue: 'Turkey',
    gender: 'Men',
  },
  {
    id: 'client-6',
    clientId: 'C-00006',
    fullName: 'Meryem Hudaeva',
    phoneNumber: '61111222',
    passportNumber: 'EF3456789',
    dateOfBirth: '1995-07-25',
    passportExpiryDate: '2031-02-09',
    passportCountryOfIssue: 'Kazakhstan',
    gender: 'Women',
  },
  {
    id: 'client-7',
    clientId: 'C-00007',
    fullName: 'Murad Mamedov',
    phoneNumber: '62222333',
    passportNumber: 'GH4567890',
    dateOfBirth: '1990-01-12',
    passportExpiryDate: '2032-08-21',
    passportCountryOfIssue: 'Azerbaijan',
    gender: 'Men',
  },
  {
    id: 'client-8',
    clientId: 'C-00008',
    fullName: 'Lale Gulmammedova',
    phoneNumber: '63333444',
    passportNumber: 'IJ5678901',
    dateOfBirth: '1997-09-30',
    passportExpiryDate: '2028-12-10',
    passportCountryOfIssue: 'Uzbekistan',
    gender: 'Women',
  },
];

const isBrowser = typeof window !== 'undefined';

const cloneClients = (clients) => clients.map((client) => ({ ...client }));

const readStoredClients = () => {
  if (!isBrowser) return cloneClients(SEED_CLIENTS);

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CLIENTS));
      return cloneClients(SEED_CLIENTS);
    }

    const parsed = JSON.parse(storedValue);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CLIENTS));
      return cloneClients(SEED_CLIENTS);
    }

    return cloneClients(parsed);
  } catch {
    return cloneClients(SEED_CLIENTS);
  }
};

const writeStoredClients = (clients) => {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
};

const getNextClientSequence = (clients) => {
  const highest = clients.reduce((max, client) => {
    const numeric = Number(String(client.clientId ?? '').replace(/\D/g, ''));
    return Number.isFinite(numeric) && numeric > max ? numeric : max;
  }, 0);

  return highest + 1;
};

const buildClientId = (sequence) => `C-${String(sequence).padStart(5, '0')}`;

export const getClients = async () => readStoredClients();

export const createClient = async (payload) => {
  const clients = readStoredClients();
  const nextSequence = getNextClientSequence(clients);
  const client = {
    id: `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    clientId: buildClientId(nextSequence),
    fullName: payload.fullName?.trim() ?? '',
    phoneNumber: payload.phoneNumber?.trim() ?? '',
    passportNumber: payload.passportNumber?.trim() ?? '',
    dateOfBirth: payload.dateOfBirth ?? '',
    passportExpiryDate: payload.passportExpiryDate ?? '',
    passportCountryOfIssue: payload.passportCountryOfIssue?.trim() ?? '',
    gender: payload.gender ?? '',
    createdAt: new Date().toISOString(),
  };

  const nextClients = [client, ...clients];
  writeStoredClients(nextClients);

  return client;
};

export const updateClient = async (clientId, patch) => {
  const clients = readStoredClients();
  const nextClients = clients.map((client) =>
    client.id === clientId ? { ...client, ...patch } : client,
  );
  writeStoredClients(nextClients);
  return nextClients.find((client) => client.id === clientId) ?? null;
};

export const clearClientStore = () => {
  if (!isBrowser) return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const seedClients = SEED_CLIENTS;
