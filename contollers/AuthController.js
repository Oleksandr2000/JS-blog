import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import UserModel from '../models/UserModel.js';
import bcrypt from 'bcrypt';

export const registr = async (request, response) => {
  try {
    const { password, email, fullName } = request.body;

    const existUser = await UserModel.findOne({ email: email });

    if (existUser) {
      return response.status(400).json('user exist');
    }

    const salt = await bcrypt.genSalt(4);

    const passwordHash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: email,
      passwordHash: passwordHash,
      fullName: fullName,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'key',
      {
        expiresIn: '24h',
      },
    );

    const { hash, ...userData } = user._doc;

    response.json({ userData, token }).status(200);
  } catch (error) {
    response.status(500).json('Server Error');
    console.log(error);
  }
};

export const login = async (request, response) => {
  try {
    const { password, email } = request.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(403).json({
        message: 'user not defined',
      });
    }

    const isValidPass = await bcrypt.compare(password, user._doc.passwordHash);

    if (!isValidPass) {
      return response.status(404).json({
        message: 'password no correct',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'key',
      {
        expiresIn: '24h',
      },
    );

    const { passwordHash, ...userData } = user._doc;

    response.status(200).json({ userData, token });
  } catch (error) {
    response.status(500).json('Server Error');
    console.log(error);
  }
};

export const auth = async (request, response) => {
  try {
    const user = await UserModel.findOne({ _id: request.userId });

    if (!user) {
      return response.status(404).json({
        message: 'user not defined',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'key',
      {
        expiresIn: '24h',
      },
    );

    const { hash, ...userData } = user._doc;

    response.json({ userData, token });
  } catch (error) {
    response.json('Server Error').status(500);
  }
};
