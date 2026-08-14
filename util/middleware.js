const jwt = require('jsonwebtoken')
const { SECRET } = require('./config.js')
const { Session, User } = require('../models')

// check if the token is valid
const tokenExtractor = (req, res, next) => {
    const authorization = req.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        try {
            req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
        } catch {
            return res.status(401).json({ error: 'token invalid' })
        }
    } else {
        return res.status(401).json({ error: 'token missing' })
    }
    next()
}

// check if the session for this token is not expired and the user's account is not disabled
const sessionCheck = async (req, res, next) => {
    const authorization = req.get('authorization')
    const token = authorization.substring(7)

    const session = await Session.findOne({ where: { token } })
    if (!session) {
        return res.status(401).json({ error: 'session expired, please log in again' })
    }

    const user = await User.findByPk(session.userId)
    if (!user || user.disabled) {
        return res.status(401).json({ error: 'account disabled' })
    }

    next()
}

module.exports = { tokenExtractor, sessionCheck }
