import { Post } from "./axios-client";
import {
   PostBannedWordsCheckRequest,
} from '../types';

export const postBannedWordsCheck = async (
   request: PostBannedWordsCheckRequest
) => {
   try {
      const response = await Post(`/banned-words/check`, request);
      return response.data;
   } catch(error) {
      throw error;
   }
};
