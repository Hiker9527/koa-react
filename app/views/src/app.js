import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';

import { StyleRoot } from 'radium';
import { connect } from 'react-redux';
import Index from './component/Index';
import AccessArticle from './container/AccessArticle';
import './css/common.css';

// auth 处理需要登录的路由
const PrivateRoute = ({ component: Component, auth, ...rest }) => {
  return (<Route {...rest} render={ props => (
    auth.user ? (
      <Component {...props} />
    ) : (
      <Redirect to={{
        pathname: '/login',
        state: { from: props.location }
      }}/>
    )
  ) } />)
}

// 用户主页
const UserIndex = ({ match }) => {
  <Route
    path={`${match.url}/:userId`}
    component={AccessArticle}
  />
}