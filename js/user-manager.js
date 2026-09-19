/**
 * ASHA Copilot 2.0+ - User Management & Multi-ASHA System
 * Kalachakra 2K26 Healthcare PS-H02
 * 
 * Supports:
 * - Multiple ASHA worker logins with credential verification
 * - User creation & profile management
 * - Audit attribution on every clinical and field record:
 *   { createdBy, createdDate, modifiedBy, modifiedDate }
 */

const STORAGE_USERS_KEY = 'asha_db_users_v2';
const STORAGE_ACTIVE_USER_KEY = 'asha_db_active_user_v2';

export const DEFAULT_USERS = [
  {
    id: 'ASHA001',
    username: 'sita.rao',
    password: 'password123',
    fullName: 'Sita Rao',
    role: 'ASHA',
    roleTitle: 'ASHA Worker (Field Level)',
    phone: '9848011221 (Synthetic)',
    area: 'Rampur Sub-Centre North (Sector 4)',
    avatar: '👩‍⚕️',
    status: 'ACTIVE',
    createdDate: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'ASHA002',
    username: 'priya.k',
    password: 'password123',
    fullName: 'Priya Kumar',
    role: 'ASHA',
    roleTitle: 'ASHA Worker (Field Level)',
    phone: '9848022332 (Synthetic)',
    area: 'Rampur Sub-Centre South (Sector 2)',
    avatar: '👩',
    status: 'ACTIVE',
    createdDate: '2026-08-05T08:00:00.000Z'
  },
  {
    id: 'ASHA003',
    username: 'lakshmi.d',
    password: 'password123',
    fullName: 'Lakshmi Devi',
    role: 'ASHA',
    roleTitle: 'ASHA Worker (Field Level)',
    phone: '9848033443 (Synthetic)',
    area: 'Ganesh Nagar Ward 3',
    avatar: '🧕',
    status: 'ACTIVE',
    createdDate: '2026-08-10T08:00:00.000Z'
  },
  {
    id: 'ANM001',
    username: 'sarojini.rao',
    password: 'password123',
    fullName: 'Sarojini Rao',
    role: 'ANM',
    roleTitle: 'ANM Clinical Supervisor',
    phone: '9848099887 (Synthetic)',
    area: 'Rampur Cluster HQ',
    avatar: '🩺',
    status: 'ACTIVE',
    createdDate: '2026-07-15T08:00:00.000Z'
  },
  {
    id: 'MO001',
    username: 'dr.sharma',
    password: 'password123',
    fullName: 'Dr. K. V. Sharma',
    role: 'ADMIN',
    roleTitle: 'Medical Officer / PHC Admin',
    phone: '9848055667 (Synthetic)',
    area: 'Primary Health Centre HQ',
    avatar: '👨‍⚕️',
    status: 'ACTIVE',
    createdDate: '2026-07-01T08:00:00.000Z'
  }
];

export class UserManager {
  constructor() {
    this.seedUsersIfEmpty();
    const savedActive = localStorage.getItem(STORAGE_ACTIVE_USER_KEY);
    this.activeUserId = savedActive || 'ASHA001';
  }

  seedUsersIfEmpty() {
    const existing = this.getAllUsers();
    if (existing.length === 0) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }
  }

  getAllUsers() {
    try {
      const data = localStorage.getItem(STORAGE_USERS_KEY);
      const list = data ? JSON.parse(data) : DEFAULT_USERS;
      return list.map(u => ({ ...u, userId: u.id || u.userId, id: u.id || u.userId }));
    } catch (e) {
      console.error('Error fetching users', e);
      return DEFAULT_USERS.map(u => ({ ...u, userId: u.id || u.userId, id: u.id || u.userId }));
    }
  }

  getCurrentUser() {
    const all = this.getAllUsers();
    const user = all.find(u => u.id === this.activeUserId || u.userId === this.activeUserId) || all[0] || DEFAULT_USERS[0];
    return { ...user, userId: user.id || user.userId, id: user.id || user.userId };
  }

  setCurrentUser(userId) {
    const all = this.getAllUsers();
    const target = all.find(u => u.id === userId || u.userId === userId);
    if (target) {
      this.activeUserId = target.id;
      localStorage.setItem(STORAGE_ACTIVE_USER_KEY, target.id);
      return target;
    }
    return null;
  }

  switchUser(userId) {
    return this.setCurrentUser(userId);
  }

  authenticate(username, password) {
    const all = this.getAllUsers();
    const user = all.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      return { success: false, message: 'Invalid username. Please check your credentials.' };
    }
    if (user.password !== password) {
      return { success: false, message: 'Incorrect password. Try "password123" for demo.' };
    }
    this.setCurrentUser(user.id);
    return { success: true, user };
  }

  createUser({ fullName, username, password, phone, area, role = 'ASHA' }) {
    const all = this.getAllUsers();
    if (all.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      return { success: false, message: `Username "${username}" is already taken.` };
    }

    const nextIdx = all.filter(u => u.role === role).length + 1;
    const rolePrefix = role === 'ASHA' ? 'ASHA' : (role === 'ANM' ? 'ANM' : 'MO');
    const newId = `${rolePrefix}${String(nextIdx).padStart(3, '0')}`;

    let roleTitle = 'ASHA Worker (Field Level)';
    let avatar = '👩‍⚕️';
    if (role === 'ANM') {
      roleTitle = 'ANM Clinical Supervisor';
      avatar = '🩺';
    } else if (role === 'ADMIN') {
      roleTitle = 'Medical Officer / PHC Admin';
      avatar = '👨‍⚕️';
    }

    const newUser = {
      id: newId,
      username: username.trim().toLowerCase(),
      password: password || 'password123',
      fullName: fullName.trim(),
      role: role,
      roleTitle: roleTitle,
      phone: phone || '9848012345 (Synthetic)',
      area: area || 'Rampur Field Cluster',
      avatar: avatar,
      status: 'ACTIVE',
      createdDate: new Date().toISOString()
    };

    all.push(newUser);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(all));
    return { success: true, user: newUser };
  }

  /**
   * Generates audit attribution stamps for saving records
   */
  getAttributionStamp(isEdit = false) {
    const user = this.getCurrentUser();
    const now = new Date().toISOString();
    return {
      createdBy: `${user.id} — ${user.fullName}`,
      createdDate: now,
      modifiedBy: `${user.id} — ${user.fullName}`,
      modifiedDate: now
    };
  }
}

export const userManager = new UserManager();
