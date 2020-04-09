import React, { useState, useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import query_string from 'query-string'
import Layout from '../core/Layout'
import { exchange_token } from './index'

const AuthRedirect = ({ location }) => {
  const cog_style = {
    color: '#5CB8FF',
    'fontSize': '100px'
  }

  const [is_loading, set_is_loading] = useState(true)

  useEffect(() => {
    const handle_redirect = () => {
      const {
        oauth_token = '',
        oauth_verifier = ''
      } = query_string.parse(location.search)

      exchange_token({
        oauth_token,
        oauth_verifier
      })
        .then(() => {
          set_is_loading(false)
        })
        .catch(err => {
          console.log('error', err)
          set_is_loading(false)
        })
    }

    handle_redirect()
  }, [location])

  return (
    <Layout
      title='Redirects'
      description='Please wait while we redirect you...'
      class_name='container'
    >
      {
        is_loading ? (
          <div className='row'>
            <div className='col-md-4 offset-md-4 text-center'>
              <i
                className='fa fa-cog fa-spin'
                style={ cog_style }
              />
            </div>
        </div>
        ) : <Redirect to='/' />
      }
    </Layout>
  )
}

export default AuthRedirect
