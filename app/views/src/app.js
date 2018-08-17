import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';

import { StyleRoot } from 'radium';
import { connect } from 'react-redux';
// 这一部分应该放在一个 views 得文件夹下
import Index from './component/Index';
import AccessArticle from './container/AccessArticle';
import NoMatch from './component/NoMatch';
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

// 处理服务器重定向问题与404
const RedirectFromServer = ({ match }) => {
  // deal the server redirect
  let url = window.location.search;
  return url.substring(1) ? <Redirect to={{
    pathname: url.substring(1),
    state: { from: '/' }
  }} /> : <NoMatch />
}

class App extends Component {
  componentdidMount() {
    let loading = document.getElementById('loading');
    loading.style.display = 'none';
  }

  render() {
    let auth = this.props.login;
    return (
      <StyleRoot>
        <Router>
          <div>
            <ProcessBars />
            <div className="container">
              <Header/>
              <FlashMessage/>
              <Switch>
                <Route exact path="/index" component={Index}/>
                <Route path="/login" component={Login}/>
                <PrivateRoute path="/edit/article"
                  component={EditArticle}
                  auth={auth}
                />
              </Switch>
            </div>
          </div>
        </Router>
      </StyleRoot>
    )
  }
}