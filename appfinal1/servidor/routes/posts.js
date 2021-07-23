const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//crear publicacion

router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});
//actualizar publicacion

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("publicacion actualizada");
    } else {
      res.status(403).json("solo puedes actualizar tu post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//Borrar publicacion

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("la publicacion ha sido eliminada");
    } else {
      res.status(403).json("solo puedes borrar tu propio post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//like / dislike 

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Publicacion likeada");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Publicacion dislikeada");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//Buscar una publicacion

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Publicaciones 

router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

//ver publicaciones de usuarios

router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
