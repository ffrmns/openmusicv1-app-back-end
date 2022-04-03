const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');

class UsersService {
  constructor() {
    this.pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);
    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING is',
      values: [id, username, hashedPassword, fullname],
    };
    const result = await this.pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Pengguna gagal ditambahkan.');
    }
    return result.rows[0].id;
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username from users WHERE username = $1',
      value: [username],
    };
    const result = await this.pool.query(query);
    if (result.rows.length) {
      throw new InvariantError('Penambahan pengguna gagal, username sudah digunakan.');
    }
  }
}

module.exports = UsersService;
