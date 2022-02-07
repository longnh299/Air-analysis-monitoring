
const express = require('express');
const { object } = require('mongoose/lib/utils');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));


// Dashboard

router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

router.get('/dashboard1', ensureAuthenticated, (req, res) =>
  res.render('dashboard1', {
    user: req.user
  })
); 

module.exports = router;
