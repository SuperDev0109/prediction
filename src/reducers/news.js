import { GET_NEWS } from '../actions/types';

const initialState = {
}

function news(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_NEWS:
      return payload;
    default:
      return state;
  }
}

export default news;
