import React, { useState, useEffect } from 'react'
import Layout from './Layout'
import { TwitterTimelineEmbed } from 'react-twitter-embed'
import {
  get_request_token,
  is_signed_in,
  sign_out
} from '../auth'
import { get_tweets } from '../tweets'
import '../assets/bootstrap-social.css'

const Home = () => {
  const feed_window_style = {
    height: `${window.innerHeight - 200}px`,
    scrollY: 'auto'
  }

  const [user, set_user] = useState(is_signed_in())
  const [is_loading, set_is_loading] = useState(false)

  const siginin = (event) => {
    event.preventDefault()
    get_request_token()
      .then(data => {
        const { auth_url } = data
        if (auth_url) {
          window.location = auth_url
        }
      })
      .catch(err => console.log(err))
  }

  const signout = (event) => {
    event.preventDefault()
    set_user(null)
    sign_out()
  }

  useEffect(() => {
    if (user) {
      get_tweets(user.user_id)
        .then(data => console.log(data))
        .catch(err => console.log(err))
    }
  }, [user])

  return (
    <Layout
      title='Twitter Top Links'
      description={ user && user.screen_name ? (
        `Hello @${user.screen_name}`
      ) : 'Log in to discover top links in your feed!' }
      class_name='container'
    >
      {
        user && user.user_id && user.screen_name ? (
          <div className='row'>
            <div
              className='col-md-8'
              style={ feed_window_style }
            >
              feed here
            </div>
            <div className='col-md-4'>
            <TwitterTimelineEmbed
              sourceType="profile"
              userId={ user.user_id }
              options={{ height: 400 }} />
              <button
                onClick={ signout }
                className='btn btn-block btn-social btn-twitter text-center'
              >
                Sign out from Twitter
              </button>
            </div>
          </div>
        ) : (
          <div className='row'>
            <div className='col-md-4 offset-md-4'>
              <button
                onClick={ siginin }
                className='btn btn-block btn-social btn-twitter text-center'
              >
                <span className='fa fa-twitter'></span> Sign in with Twitter
              </button>
            </div>
          </div>
        )
      }
    </Layout>
  )
}

export default Home
