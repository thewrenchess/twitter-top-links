import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Home from './core/Home'
import AuthRedirect from './auth/AuthRedirect'

const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          path='/' exact
          component={ Home }
        />
        <Route
          path='/auth/redirect' exact
          component={ AuthRedirect }
        />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes
