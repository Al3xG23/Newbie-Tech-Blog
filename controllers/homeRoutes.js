const router = require('express').Router();
const { Posts, User, Comments } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', withAuth, async (req, res) => {
  try {
    // Get all post and JOIN with user data
    const postData = await Posts.findAll({
      include: [
        {
          model: User,
          attributes: ['username'],
        },
        {
          model: Comments,
          attributes: ['commentPost'],
        },
      ],
    });

    const userData = await User.findByPk(req.session.user_id, {
      attributes: ['username'],
    });

    const commentData = await Comments.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['username'],
        },
      ],
    });

    // Serialize data so the template can read it
    const post = postData.map((postText) => postText.get({ plain: true }));
    
    const user = userData.get({ plain: true });

    const comment = commentData.get({ plain: true });

    // Pass serialized data and session flag into template
    res.render('homepage', {
      post,
      comment,
      username: user.username,
      logged_in: req.session.logged_in
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/dashboard');
    return;
  }

  res.render('login');
});