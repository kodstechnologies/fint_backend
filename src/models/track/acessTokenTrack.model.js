// src/models/accessTokenTrack.model.js

import mongoose from 'mongoose';

const accessTokenTrackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    ventureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venture',
    },
  },
  { timestamps: true }
);

export const AccessTokenTrack = mongoose.model('AccessTokenTrack', accessTokenTrackSchema);
