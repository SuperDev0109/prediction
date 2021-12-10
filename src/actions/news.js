import api from '../utils/api';
import {
  GET_NEWS,
} from './types';

// Load User
export const getNews = () => async dispatch => {
  try {
    const res = await api.get('/news');

    dispatch({
      type: GET_NEWS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: "Insert Error"
    });
  }
};

 
