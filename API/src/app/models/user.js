const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//Antes de salvar o usuário
UserSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;

    next();
});

//Salvando usuário
const User = mongoose.model('User', UserSchema);

module.exports = User;