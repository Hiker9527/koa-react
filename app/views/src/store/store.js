import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import loadArticle from '../reducer/loadArticle';
import article from '../reducer/article';
import { persistStore, autoRehydrate } from 'redux-persist';

const reducer = combineReducers({
  article,
  loadArticle,
})

// 加载 redux-devtools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer, {}, composeEnhancers(applyMiddleware(thunk), autoRehydrate()));
persistStore(store, { blacklist: ['progress', 'article'] }, () => {
  // check cookie
})

export default store;