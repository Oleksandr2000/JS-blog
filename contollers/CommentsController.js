import CommentsModel from '../models/CommentsModel.js';

export const create = async (req, res) => {
  try {
    const { postId, userName, content } = req.body;

    const doc = new CommentsModel({
      userName: userName,
      content: content,
      postId: postId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать статью',
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const comments = await CommentsModel.find().limit(5).exec();

    res.json(comments);
  } catch (error) {
    if (error) {
      res.status(500).json({ message: 'Server Error' });
    }
  }
};
