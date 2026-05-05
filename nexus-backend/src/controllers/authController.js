const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { nama_lengkap, no_hp, alamat, password } = req.body;

        const userExist = await pool.query('SELECT * FROM users WHERE no_hp = $1', [no_hp]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ message: "Nomor HP sudah terdaftar!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            `INSERT INTO users (nama_lengkap, no_hp, alamat, password, role) 
             VALUES ($1, $2, $3, $4, 'Masyarakat') RETURNING id_user, nama_lengkap, role`,
            [nama_lengkap, no_hp, alamat, hashedPassword]
        );

        res.status(201).json({ message: "Registrasi berhasil!", user: newUser.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Server Error saat registrasi" });
    }
};

exports.login = async (req, res) => {
    try {
        const { no_hp, password } = req.body;

        const result = await pool.query('SELECT * FROM users WHERE no_hp = $1', [no_hp]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Nomor HP atau Password salah!" });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Nomor HP atau Password salah!" });
        }

        const token = jwt.sign(
            { id: user.id_user, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Login Berhasil!",
            token,
            user: { id: user.id_user, nama: user.nama_lengkap, role: user.role, id_instansi: user.id_instansi }
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error saat login" });
    }
};

exports.profile = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id_user, u.nama_lengkap, u.no_hp, u.alamat, u.role, u.id_instansi,
                    i.nama_instansi
             FROM users u
             LEFT JOIN instansi i ON i.id_instansi = u.id_instansi
             WHERE u.id_user = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }

        const user = result.rows[0];
        res.status(200).json({
            user: {
                id: user.id_user,
                nama: user.nama_lengkap,
                no_hp: user.no_hp,
                alamat: user.alamat,
                role: user.role,
                id_instansi: user.id_instansi,
                instansi: user.nama_instansi,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error saat mengambil profil" });
    }
};
