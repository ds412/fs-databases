const router = require('express').Router()

const { Session } = require('../models')

// delete session with given token from active sessions list
router.delete('/', async (req, res) => {
    const authorization = req.get('authorization')
    if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'token missing' })
    }

    const token = authorization.substring(7)

    // tells us whether this was an active session or not
    const deletedCount = await Session.destroy({ where: { token } })
    if (deletedCount === 0) {
        return res.status(401).json({ error: 'invalid token' })
    }

    res.status(204).end()
})
module.exports = router
