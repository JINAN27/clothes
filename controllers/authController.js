const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config(); // Untuk mengakses variabel .env

// Fungsi untuk registrasi pengguna
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cek apakah pengguna sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Enkripsi password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Membuat user baru
    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Fungsi untuk login pengguna
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, userId: user._id }); // Menambahkan userId di response
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Fungsi untuk mendapatkan profil pengguna
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('email'); // Ambil data pengguna berdasarkan userId dari token
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ id: user._id, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
