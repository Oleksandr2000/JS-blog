import PostModel from '../models/PostModel.js';
import path from 'path';
import commonjsVariables from 'commonjs-variables-for-esmodules';
import CommentsModel from '../models/CommentsModel.js';

const { __dirname } = commonjsVariables(import.meta);

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить тэги',
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const { tag, sort, user, searchString, page, limit } = req.query;

    let count;

    if (tag && user && searchString) {
      count = await PostModel.count({
        tags: tag,
        user: user,
        title: { $regex: '.*' + searchString + '.*' },
      });

      const posts = await PostModel.find({
        tags: tag,
        user: user,
        title: { $regex: '.*' + searchString + '.*' },
      })
        .sort([[sort, -1]])
        .skip(page * limit - limit)
        .limit(limit)
        .populate('user')
        .exec();
      return res.json({ posts, count });
    }

    if (tag && user) {
      count = await PostModel.count({
        tags: tag,
        user: user,
      });

      const posts = await PostModel.find({ tags: tag, user: user })
        .sort([[sort, -1]])
        .skip(page * limit - limit)
        .limit(limit)
        .populate('user')
        .exec();
      return res.json({ posts, count });
    }

    if (tag && searchString) {
      count = await PostModel.count({
        tags: tag,
        title: { $regex: '.*' + searchString + '.*' },
      });

      const posts = await PostModel.find({
        tags: tag,
        title: { $regex: '.*' + searchString + '.*' },
      })
        .sort([[sort, -1]])
        .skip(page * limit - limit)
        .limit(limit)
        .populate('user')
        .exec();
      return res.json({ posts, count });
    }

    if (user && searchString) {
      count = await PostModel.count({
        user: user,
        title: { $regex: '.*' + searchString + '.*' },
      });

      const posts = await PostModel.find({
        user: user,
        title: { $regex: '.*' + searchString + '.*' },
      })
        .sort([[sort, -1]])
        .skip(page * limit - limit)
        .limit(limit)
        .populate('user')
        .exec();
      return res.json({ posts, count });
    }

    if (tag) {
      count = await PostModel.count({
        tags: tag,
      });

      const posts = await PostModel.find({ tags: tag })
        .sort([[sort, -1]])
        .skip(page * limit - limit)
        .limit(limit)
        .populate('user')
        .exec();
      return res.json({ posts, count });
    }

    if (user) {
      count = await PostModel.count({
        user: user,
      });

      const posts = await PostModel.find({ user: user })
        .sort([[sort, -1]])
        .skip(page * limit - limit)
        .limit(limit)
        .populate('user')
        .exec();
      return res.json({ posts, count });
    }

    if (searchString) {
      count = await PostModel.count({
        title: { $regex: '.*' + searchString + '.*' },
      });

      const posts = await PostModel.find({ title: { $regex: '.*' + searchString + '.*' } })
        .sort([[sort, -1]])
        .skip(page * limit - limit)
        .limit(limit)
        .populate('user')
        .exec();
      return res.json({ posts, count });
    }

    count = await PostModel.count();

    const posts = await PostModel.find()
      .sort([[sort, -1]])
      .skip(page * limit - limit)
      .limit(limit)
      .populate('user')
      .exec();
    res.json({ posts, count });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    const comments = await CommentsModel.find({ postId: postId });

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: 'after',
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось вернуть статью',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json({ doc, comments });
      },
    ).populate('user');
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось удалить статью',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json({
          success: true,
        });
      },
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const create = async (req, res) => {
  try {
    const { title, text, tags } = req.body;
    const { img } = req.files;

    img.mv(path.resolve(__dirname, '..', 'static', img.name));

    const doc = new PostModel({
      title: title,
      text: text,
      tags: tags.split(','),
      user: req.userId,
      img: img.name,
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

export const update = async (req, res) => {
  try {
    const { postId, title, text, tags } = req.body;
    const { img } = req.files;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title,
        text,
        img: img.name,
        tags: tags.split(','),
      },
    );

    res.json('succes');
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};
